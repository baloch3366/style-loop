import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    shortDescription: { 
      type: String,
      default: null
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    totalSold: {
     type: Number,
     required: true,
     min: 0,
     default: 0         
     },

    category: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    sku: { 
      type: String, 
      required: true, 
      unique: true 
    },
    inventory: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], 
      default: 'DRAFT' 
    },
    featured: { 
      type: Boolean, 
      default: false 
    },
    tags: [{ 
      type: String,
      default: []
    }],
    images: {
      main: { type: String, default: null },
      thumbnail: { type: String, default: null },
      gallery: [{ type: String, default: [] }]
    }
  },
  { 
    timestamps: true 
  }
);

// Virtual id field
productSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Transform for JSON output
productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    
    // Convert empty strings to null for GraphQL
    if (ret.shortDescription === '') ret.shortDescription = null;
    if (ret.images?.main === '') ret.images.main = null;
    if (ret.images?.thumbnail === '') ret.images.thumbnail = null;
    
    // Handle populated category
    if (ret.category && ret.category._id) {
      ret.category.id = ret.category._id.toString();
      delete ret.category._id;
      delete ret.category.__v;
    }
    
    return ret;
  }
});

// Indexes
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ inventory: 1 });
productSchema.index({ totalSold: -1 });   
productSchema.index({ createdAt: -1 });  


productSchema.index({ 
  name: 'text', 
  description: 'text', 
  'tags': 'text' 
}, { 
  weights: { 
    name: 10, 
    description: 5, 
    tags: 3 
  } 
});

// Auto-generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.sku = `PROD-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

const Product = models.Product || model("Product", productSchema);
export default Product;