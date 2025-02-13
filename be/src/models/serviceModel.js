import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
  },
  { strict: "throw" }
);

export default mongoose.model("Service", serviceSchema);
