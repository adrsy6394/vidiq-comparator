import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Enable Helmet to secure HTTP headers
app.use(helmet());

// Enable CORS for frontend cross-origin requests
app.use(cors());

// Parse JSON payload bodies
app.use(express.json());

// Mount all core endpoints on base /api prefix path
app.use('/api', routes);

// Global operational and validation error catcher
app.use(errorHandler);

export default app;
