import express from 'express';
import { fetchInternships } from '../controllers/internship.controller.js';

const router = express.Router();

router.post('/fetch', fetchInternships);

export default router; 