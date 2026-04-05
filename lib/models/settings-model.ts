import { Schema, model, models } from "mongoose";

const settingsSchema = new Schema({
  storeName: { type: String, default: "StyleLoop" },
  storeEmail: { type: String, default: "support@styleloop.com" },
  storePhone: { type: String, default: "+1 (555) 123-4567" },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  socialLinks: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
  },
  currency: { type: String, default: "USD" },
  taxRate: { type: Number, default: 8.0 },
  freeShippingThreshold: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.StoreSettings || model("StoreSettings", settingsSchema);