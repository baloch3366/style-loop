import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    description: { 
      type: String,
      default: null
    },
    image: { 
      type: String,
      default: null
    },
    parent: { 
      type: Schema.Types.ObjectId, 
      ref: "Category",
      default: null
    },
    productCount: { 
      type: Number, 
      default: 0,
      min: 0
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { 
    timestamps: true 
  }
);

// Virtual id field
categorySchema.virtual('id').get(function() {
  return this._id.toString();
});

// Transform for JSON output
categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    
    // Convert empty strings to null for GraphQL
    if (ret.description === '') ret.description = null;
    if (ret.image === '') ret.image = null;
    
    // Handle populated parent
    if (ret.parent && ret.parent._id) {
      ret.parent.id = ret.parent._id.toString();
      delete ret.parent._id;
      delete ret.parent.__v;
      
      if (ret.parent.description === '') ret.parent.description = null;
      if (ret.parent.image === '') ret.parent.image = null;
    }
    
    return ret;
  }
});

// Indexes for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parent: 1 });

// Auto-generate slug from name
categorySchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/\s+/g, '-')     
      .replace(/-+/g, '-');     
    
    this.slug = baseSlug;
  }
  next();
});

const Category = models.Category || model("Category", categorySchema);
export default Category;