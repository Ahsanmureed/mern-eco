import express from 'express';
import connection from "./database/db.js";
import dotenv from 'dotenv';
import { errorHandler } from "./utils/errorHandler.js";
import router from "./routes/index.js";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createServer } from 'http';
import socketSetup from './config/socketSetup.js'; 

const app = express();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer(app);
const io = socketSetup(server);

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
}));

dotenv.config();

// Connect to the database
connection();

// API routes
app.use('/api/v1', router);
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Error handler
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000; 
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
