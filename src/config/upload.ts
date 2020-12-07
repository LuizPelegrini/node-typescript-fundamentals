/**
 * Settings for when the application needs to handle files
 */

import multer from 'multer';
import path from 'path';

// the location the files will be saved locally
const tmpFolder = path.resolve(__dirname, '..', '..', 'temp');

export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (request, file, callback) => {
      callback(null, 'csvfile');
    },
  }),
};
