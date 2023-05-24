import Product from "../model/Product.js";
import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";
import Image from "../model/Image.js"
import fs from 'fs';
import AWS from "aws-sdk";
import dotenv from 'dotenv'
dotenv.config()

// Create an instance of the AWS.S3 class
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// @desc    Create new Product
// @route   POST /api/v1/Products
// @access  Private/Admin
export const createSingleProductController = asyncHandler(async (req, res) => {
  const { name, description, category, sizes, colors, price, totalQty, brand } = req.body;

  // Product exists?
  const productExists = await Product.findOne({ name });
  if (productExists) {
    throw new Error("Product already exists");
  }

  // Find the Category
  const categoryFound = await Category.findOne({ name: category.toLowerCase() });
  if (!categoryFound) {
    throw new Error("Category not found. Please create the category first or check the category name");
  }

  // Find the Brand
  const brandFound = await Brand.findOne({ name: brand.toLowerCase() });
  if (!brandFound) {
    throw new Error("Brand not found. Please create the brand first or check the brand name");
  }

  // Upload images to S3 bucket and create Image documents
  let imageUrls = [];

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) => {
      const fileContent = fs.readFileSync(file.path);

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
        Body: fileContent,
        // Add any additional parameters or ACL settings as per your requirement
      };

      return s3.upload(params).promise();
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Create Image documents and add to images array
    const createImagePromises = uploadResults.map((result) => {
      const newImage = new Image({
        key: result.Key,
        bucket: result.Bucket,
        location: result.Location,
        etag: result.ETag,
      });
      
      // Add the image id and URL to the array
      imageUrls.push({id: newImage._id, url: result.Location});

      return newImage.save();
    });

    await Promise.all(createImagePromises);

    req.files.forEach((file) => {
      fs.unlinkSync(file.path); // Delete the files after successful upload
    });
  }

  // Create the product with the uploaded images
  const product = await Product.create({
    name,
    description,
    category: category.toLowerCase(),
    sizes,
    colors,
    user: req.userAuthId,
    price,
    totalQty,
    brand: brand.toLowerCase(),
    images: imageUrls, // This now contains the objects of image ids and urls
  });

  // Push the product into Category
  categoryFound.products.push(product._id);
  await categoryFound.save();

  // Push the product into Brand
  brandFound.products.push(product._id);
  await brandFound.save();

  // Send response
  res.json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// @desc    Get all Products
// @route   GET /api/v1/products
// @access  Public
export const getAllProductsController = asyncHandler(async (req, res) => {
  // query // if we use await rightaway, we won't be able to use any other mongoDB methods. (that's why we defined productQuery)
  let productQuery = Product.find();
  //Yes, you could filter the results directly in the Product.find() method. However, using let productQuery = Product.find() allows you to build up the query dynamically depending on the presence of any query parameters.In this code, the productQuery variable is initially set to Product.find(), which fetches all products in the database. But if there is a name query parameter in the request, then the productQuery variable is updated to include an additional find() method to filter the results by name. This way, the productQuery variable is built up incrementally, allowing for more flexibility in constructing the query based on different conditions.

  // filter by name
  if (req.query.name) {
    productQuery = productQuery.find({
      name: { $regex: req.query.name, $options: "i" },
    });
  }
  // filter by brand
  if (req.query.brand) {
    productQuery = productQuery.find({
      brand: { $regex: req.query.brand, $options: "i" },
    });
  }
  // filter by category
  if (req.query.category) {
    productQuery = productQuery.find({
      category: { $regex: req.query.category, $options: "i" },
    });
  }
  // filter by color
  if (req.query.color) {
    productQuery = productQuery.find({
      colors: { $regex: req.query.color, $options: "i" },
    });
  }
  // filter by size
  if (req.query.size) {
    productQuery = productQuery.find({
      sizes: { $regex: req.query.size, $options: "i" },
    });
  }
  // filter by price range
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    const minPrice = parseInt(priceRange[0]);
    const maxPrice = parseInt(priceRange[1]);

    productQuery = productQuery.find({
      price: { $gte: minPrice, $lte: maxPrice },
    });
  }

  // PAGINATION
  //page
  const page = parseInt(req.query.page) || 1
  //limit
  const limit = parseInt(req.query.limit) || 10
  //startIndex
  const startIndex = (page - 1) * limit
  //endIndex
  const endIndex = page * limit
  //total
  const totalProducts = await Product.countDocuments()

  productQuery = productQuery.skip(startIndex).limit(limit)

  // pagination results
  const pagination = {}
  if(endIndex < totalProducts){
    pagination.next = {
        page: page +1,
        limit,
    }
  }
  if(startIndex > 0){
    pagination.prev = {
        page: page -1,
        limit,
    }
  }

  // await the query
  const products = await productQuery;

  res.json({
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,

    status: "success",
    totalProducts,
    results: products.length,
    pagination,
    message:"Products fetched successfully",
    products
});
});

// @desc    Get a single Product
// @route   GET /api/v1/products/:id
// @access  Public
export const getSingleProductController = asyncHandler(async(req,res)=>{
    const product = await Product.findById(req.params.id).populate("reviews")
    if(!product){
        throw new Error ('Product not found!')
    }
    res.json({
        status: 'success',
        message: 'Product fetched successfully',
        product
    })
})

// @desc    Update a Product
// @route   PUT /api/v1/products/:id/update
// @access  Private/Admin
export const updateSingleProductController = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    sizes,
    colors,
    user,
    price,
    totalQty,
    brand,
  } = req.body;

  // Retrieve the product
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // If images are included in the request, handle image deletion and upload
  if (req.files && req.files.length > 0) {
    // Loop through each existing image, delete from S3 and MongoDB
    for (const img of product.images) {
      // Deleting from S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: img.key,
      };

      try {
        await s3.deleteObject(params).promise(); // Delete image from S3
      } catch (error) {
        res.status(500);
        throw new Error('Failed to delete images from S3');
      }

      // Deleting from MongoDB
      await Image.findByIdAndRemove(img.id);
    }

    // Upload new images to S3 and MongoDB
    const uploadPromises = req.files.map((file) => {
      const fileContent = fs.readFileSync(file.path);

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
        Body: fileContent,
      };

      return s3.upload(params).promise();
    });

    const uploadResults = await Promise.all(uploadPromises);

    const createImagePromises = uploadResults.map((result) => {
      const newImage = new Image({
        key: result.Key,
        bucket: result.Bucket,
        location: result.Location,
        etag: result.ETag,
      });

      return newImage.save();
    });

    const newImages = await Promise.all(createImagePromises);

    // Create an array of the new images (with ID and URL)
    product.images = newImages.map((img) => ({
      id: img._id,
      url: img.location,
    }));

    // Delete the temporary files
    req.files.forEach((file) => {
      fs.unlinkSync(file.path);
    });
  }

  // Update product information
  product.name = name;
  product.description = description;
  product.category = category;
  product.sizes = sizes;
  product.colors = colors;
  product.user = user;
  product.price = price;
  product.totalQty = totalQty;
  product.brand = brand;

  // Save the updated product
  const updatedProduct = await product.save();

  res.json({
    status: 'success',
    message: 'Product updated successfully',
    product: updatedProduct,
  });
});




// @desc    Delete a single Product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteSingleProductController = asyncHandler(async(req,res)=>{
  const product = await Product.findById(req.params.id)
  
  if(!product){
      throw new Error ('Product not found!')
  }
  
  // Fetch the Image documents from the database
  const images = await Image.find({
      _id: { $in: product.images.map((image) => image.id) }
  });

  // Deleting the images from the S3 bucket
  const deleteImagesPromises = images.map((image) => {
      const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.key,  // key is the filename in the S3 bucket
      };

      return s3.deleteObject(params).promise();
  });

  try {
      // Wait for all images to be deleted
      await Promise.all(deleteImagesPromises);

      // If successful, delete the Image records from the database
      await Image.deleteMany({
          _id: { $in: images.map((image) => image._id) }
      });

      // Then, delete the Product from database using findByIdAndDelete
      await Product.findByIdAndDelete(req.params.id);
      res.json({
          status: 'success',
          message: 'Product and associated images deleted successfully'
      })
  } catch (err) {
      // An error occurred during the image deletion process, so throw an error
      throw new Error("Unable to delete one or more images");
  }
});

// @desc    Delete all Products
// @route   DELETE /api/v1/products/deleteall
// @access  Private/Admin
export const deleteAllProductsController = asyncHandler(async(req, res)=>{
  // Fetch all products from the database
  const products = await Product.find();

  // Extract all image ids from the products
  const imageIds = products.flatMap((product) => product.images.map((image) => image.id));

  // Fetch the Image documents from the database
  const images = await Image.find({
      _id: { $in: imageIds }
  });

  // Deleting the images from the S3 bucket
  const deleteImagesPromises = images.map((image) => {
      const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.key,  // key is the filename in the S3 bucket
      };

      return s3.deleteObject(params).promise();
  });

  try {
      // Wait for all images to be deleted
      await Promise.all(deleteImagesPromises);

      // If successful, delete the Image records from the database
      await Image.deleteMany({
          _id: { $in: images.map((image) => image._id) }
      });

      // Then, delete all Products from the database
      await Product.deleteMany({});
      res.json({
          status: 'success',
          message: 'All products and associated images deleted successfully'
      })
  } catch (err) {
      // An error occurred during the image deletion process, so throw an error
      throw new Error("Unable to delete one or more images");
  }
});


  