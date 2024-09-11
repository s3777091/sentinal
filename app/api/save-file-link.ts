import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const app = express();
const port = 3000;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext); // Unique filename
    },
  }),
});

app.use(express.json());

app.post('/api/save-file-link', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
