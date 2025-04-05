import type { Request, Response } from 'express';
import formidable from 'formidable';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, renameSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '..', '..', '..', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export async function handleUpload(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const result = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const [fields, files] = result;
    const file = files.file && ('length' in files.file ? files.file[0] : files.file);

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Generate a unique filename
    const filename = `${Date.now()}-${file.originalFilename || file.newFilename}`;
    const newPath = join(uploadsDir, filename);

    // Rename the file to include the original filename
    renameSync(file.filepath, newPath);

    // Return the URL that can be used to access the file
    const fileUrl = `/uploads/${filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
