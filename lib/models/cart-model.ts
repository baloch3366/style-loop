import { Schema, model, models } from 'mongoose';

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` on save
cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default models.Cart || model('Cart', cartSchema);