import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    image: { 
      type: String, 
      required: true, 
      default: "https://via.placeholder.com/300x200.png?text=No+Image" 
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

