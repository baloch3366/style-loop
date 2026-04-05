// // 'use client';

// // import { useState, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ImagePlus, Loader2, X } from 'lucide-react';
// // import Image from 'next/image';

// // interface CloudinaryUploadProps {
// //   onUpload: (url: string) => void;
// //   onRemove?: () => void;
// //   existingUrl?: string | null;
// //   label?: string;
// //   className?: string;
// // }

// // export default function CloudinaryUpload({
// //   onUpload,
// //   onRemove,
// //   existingUrl,
// //   label = 'Upload Image',
// //   className = '',
// // }: CloudinaryUploadProps) {
// //   const [uploading, setUploading] = useState(false);
// //   const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);

// //   const handleUpload = useCallback(async (file: File) => {
// //     setUploading(true);
// //     try {
// //       // 1. Get signature from server
// //       const sigRes = await fetch('/api/cloudinary/signature', { method: 'POST' });
// //       const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

// //       // 2. Upload directly to Cloudinary
// //       const formData = new FormData();
// //       formData.append('file', file);
// //       formData.append('api_key', apiKey);
// //       formData.append('timestamp', timestamp.toString());
// //       formData.append('signature', signature);
// //       formData.append('cloud_name', cloudName);

// //       const uploadRes = await fetch(
// //         `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
// //         { method: 'POST', body: formData }
// //       );
// //       const data = await uploadRes.json();

// //       if (data.secure_url) {
// //         setPreviewUrl(data.secure_url);
// //         onUpload(data.secure_url);
// //       } else {
// //         throw new Error('Upload failed');
// //       }
// //     } catch (error) {
// //       console.error('Upload error:', error);
// //       alert('Failed to upload image');
// //     } finally {
// //       setUploading(false);
// //     }
// //   }, [onUpload]);

// //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (file) handleUpload(file);
// //   };

// //   const handleRemove = () => {
// //     setPreviewUrl(null);
// //     onRemove?.();
// //   };

// //   return (
// //     <div className={`space-y-2 ${className}`}>
// //       <div className="flex items-center gap-2">
// //         <Button
// //           type="button"
// //           variant="outline"
// //           onClick={() => document.getElementById('cloudinary-input')?.click()}
// //           disabled={uploading}
// //         >
// //           {uploading ? (
// //             <>
// //               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //               Uploading...
// //             </>
// //           ) : (
// //             <>
// //               <ImagePlus className="mr-2 h-4 w-4" />
// //               {label}
// //             </>
// //           )}
// //         </Button>
// //         {previewUrl && onRemove && (
// //           <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
// //             <X className="h-4 w-4" />
// //           </Button>
// //         )}
// //       </div>
// //       <input
// //         id="cloudinary-input"
// //         type="file"
// //         accept="image/*"
// //         onChange={handleFileChange}
// //         className="hidden"
// //       />
// //       {previewUrl && (
// //         <div className="relative h-32 w-32 rounded-md overflow-hidden border">
// //           <Image src={previewUrl} alt="Preview" fill className="object-cover" />
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  existingUrl?: string | null;
  label?: string;
  className?: string;
  multiple?: boolean;   // 👈 new prop
}

export default function CloudinaryUpload({
  onUpload,
  onRemove,
  existingUrl,
  label = 'Upload Image',
  className = '',
  multiple = false,     // 👈 default to false for main/thumbnail
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);

  const uploadFile = useCallback(async (file: File) => {
    try {
      const sigRes = await fetch('/api/cloudinary/signature', { method: 'POST' });
      const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('cloud_name', cloudName);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await uploadRes.json();

      if (data.secure_url) {
        onUpload(data.secure_url);
        // For single upload mode, also set preview
        if (!multiple) setPreviewUrl(data.secure_url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload ${file.name}`);
    }
  }, [onUpload, multiple]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (multiple) {
        // Upload all files sequentially
        for (let i = 0; i < files.length; i++) {
          await uploadFile(files[i]);
        }
      } else {
        // Single file upload
        await uploadFile(files[0]);
      }
    } finally {
      setUploading(false);
      // Clear the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('cloudinary-input')?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
        {!multiple && previewUrl && onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <input
        id="cloudinary-input"
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      {!multiple && previewUrl && (
        <div className="relative h-32 w-32 rounded-md overflow-hidden border">
          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
        </div>
      )}
    </div>
  );
}

