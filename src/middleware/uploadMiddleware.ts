import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.join(__dirname, '../uploads/profileImages');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `profile_${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

const fileFilter = (req: any, file:any, cb:any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadProfileImage = multer({ storage, fileFilter });
