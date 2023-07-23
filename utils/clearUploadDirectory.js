import fs from 'fs';

/**
 * Clears the 'uploads' directory.
 * This function assumes that `req.files` contains the files that have been uploaded in the current request.
 *
 * @param {object} req - Express request object
 */
export const clearUploadDirectory = (req) => {
  try {
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    } else if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  } catch (error) {
    // Handle the error
    console.error('Error while clearing upload directory:', error);
  }
};
