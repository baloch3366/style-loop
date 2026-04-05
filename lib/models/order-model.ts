import { Schema, model, models } from "mongoose";

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  guestEmail: String,
  items: [orderItemSchema],
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
   default: 'PENDING',
     uppercase: true, 
  },
  paymentMethod: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  stripeSessionId: { type: String },
  paymentIntentId: { type: String },
  paypalOrderId: { type: String },
  paypalCaptureId: { type: String },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    // Cast to any to avoid TypeScript error
    const Model = this.constructor as any;
    const count = await Model.countDocuments();
    this.orderNumber = `ORD-${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

export default models.Order || model("Order", orderSchema);