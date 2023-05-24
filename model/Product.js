import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      ref: "Category",
      required: true,
    },
    sizes: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    images: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Image"
        },
        url: String
      }
    ],    
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    totalQty: {
      type: Number,
      required: true,
    },
    totalSold: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);
//Virtuals
//qty left
ProductSchema.virtual("qtyLeft").get(function () {
  const product = this

  return product.totalQty - product.totalSold
})
// Total number of ratings
ProductSchema.virtual("totalReviews").get(function () {
  const product = this
  return product?.reviews?.length
});
// Average Rating
ProductSchema.virtual("averageRating").get(function () {
  let ratingsSum = 0
  const product = this
  product?.reviews?.forEach((review)=>{
    ratingsSum += review?.rating
  })
  // calculate average rating
  const averageRating = Number(ratingsSum / product?.reviews?.length).toFixed(1)
  return averageRating
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
