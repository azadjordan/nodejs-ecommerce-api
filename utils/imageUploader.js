import fs from 'fs'
import Image from '../model/Image.js'
import s3 from '../config/s3.js'
import { clearUploadDirectory } from '../utils/clearUploadDirectory.js'

export const uploadImagesToS3 = async (files, req) => {  // <-- add the request object as a parameter
  let imageUrls = [];

  // Upload images to S3 bucket and create Image documents
  if (files && files.length > 0) {
    try {
      const uploadPromises = files.map((file) => {
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
      
      // Clear the 'uploads' directory after successful upload, regardless of the number of images
      clearUploadDirectory(req);
    } catch (error) {
      // If an error occurred while uploading or saving, clear the 'uploads' directory and rethrow the error
      clearUploadDirectory(req);
      throw error;
    }
  }

  return imageUrls;
}
