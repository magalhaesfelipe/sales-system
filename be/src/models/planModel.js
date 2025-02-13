import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["basico", "avancado", "premium"],
      required: true,
    },
    description: { type: String },
    basePrice: { type: Number, required: true },
  },
  { strict: "throw" }
);

export default mongoose.model("Plan", planSchema);
