import fs from 'fs';

/**
 * Clears the 'uploads' directory.
 * This function assumes that `req.files` contains the files that have been uploaded in the current request.
 *
 * @param {object} req - Express request object
 */
export const clearUploadDirectory = (req) => {
  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => {
      fs.unlinkSync(file.path);
    });
  }
};
