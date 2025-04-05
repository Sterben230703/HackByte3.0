import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Server is running!' });
});

app.listen(port, () => {
  console.log(`Test server is running on port ${port}`);
});
