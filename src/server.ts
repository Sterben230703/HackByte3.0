import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { handleUpload } from './pages/api/upload';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// File upload endpoint
app.post('/api/upload', (req: Request, res: Response) => handleUpload(req, res));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
