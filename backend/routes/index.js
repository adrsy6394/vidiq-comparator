import { Router } from 'express';
import analyzeRoutes from './analyzeRoutes.js';
import chatRoutes from './chatRoutes.js';
import sessionRoutes from './sessionRoutes.js';

const router = Router();

// Mount routes on respective paths
router.use('/', analyzeRoutes);
router.use('/chat', chatRoutes);
router.use('/session', sessionRoutes);

export default router;
