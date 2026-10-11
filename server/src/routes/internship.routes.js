import express from 'express';
import { fetchInternships } from '../controllers/internship.controller.js';
import { scrapeLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post('/fetch', scrapeLimiter, fetchInternships);

export default router; 
