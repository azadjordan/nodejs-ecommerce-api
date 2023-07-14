import fs from 'fs'
import Image from '../model/Image.js';
import s3 from '../config/s3.js'

export const uploadImagesToS3 = async (files) => {
  let imageUrls = [];

  // Upload images to S3 bucket and create Image documents
  if (files && files.length > 0) {
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
  }

  return imageUrls;
}
