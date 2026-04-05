
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { productSeeds } from '../lib/seed-Data';

// Optional: a fallback Cloudinary image (upload a generic placeholder once)
const FALLBACK_IMAGE = 'https://res.cloudinary.com/dgz6ixsno/image/upload/v1775231630/seed-products/placeholder.jpg';

async function uploadFromUrl(url: string, publicId: string): Promise<string> {
  try {
    // Check if URL is accessible
    const headRes = await axios.head(url);
    if (headRes.status !== 200) {
      console.warn(`  URL not accessible (status ${headRes.status}), skipping upload for ${url}`);
      return FALLBACK_IMAGE;
    }
    const response = await axios({ url, responseType: 'stream' });
    const stream = Readable.from(response.data);
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: `products/${publicId}`, folder: 'products' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.pipe(uploadStream);
    });
    return result.secure_url;
  } catch (error: any) {
    console.error(`  Failed to upload ${url}: ${error.message}`);
    // Return a fallback image or the original URL
    return FALLBACK_IMAGE;
  }
}

async function main() {
  console.log('Starting migration of seed images to Cloudinary...');
  const updatedProducts = [];
  for (const product of productSeeds) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let mainUrl = product.images.main;
    let thumbUrl = product.images.thumbnail;

    if (mainUrl && mainUrl.includes('unsplash.com')) {
      console.log(`Processing main image for ${product.name}...`);
      mainUrl = await uploadFromUrl(mainUrl, `${slug}-main`);
    }
    if (thumbUrl && thumbUrl.includes('unsplash.com')) {
      console.log(`Processing thumbnail for ${product.name}...`);
      thumbUrl = await uploadFromUrl(thumbUrl, `${slug}-thumb`);
    }

    updatedProducts.push({
      ...product,
      images: { main: mainUrl, thumbnail: thumbUrl, gallery: [] },
    });
  }

  const outputPath = path.join(process.cwd(), 'lib', 'seed-data-cloudinary.ts');
  const content = `// Auto‑generated with Cloudinary images – DO NOT EDIT MANUALLY
import { Types } from 'mongoose';

export const productSeeds = ${JSON.stringify(updatedProducts, null, 2)};
`;
  fs.writeFileSync(outputPath, content);
  console.log(`✅ New seed file written to: ${outputPath}`);
  console.log('Replace lib/seed-data.ts with this file and re‑seed.');
}

main().catch(console.error);