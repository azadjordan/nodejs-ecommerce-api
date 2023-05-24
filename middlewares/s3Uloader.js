import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to delete all files in a directory
const clearDirectory = (directoryPath) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directoryPath, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

const s3Uploader = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const uploadPromises = req.files.map((file) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.filename,
      Body: fs.createReadStream(file.path),
    };

    return s3.upload(params).promise();
  });

  try {
    const uploadResults = await Promise.all(uploadPromises);
    req.files.forEach((file, index) => {
      file.location = uploadResults[index].Location;
    });

    clearDirectory('./uploads'); // Call function to delete all files in uploads directory before proceeding
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default s3Uploader;
