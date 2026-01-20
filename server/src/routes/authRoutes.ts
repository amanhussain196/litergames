import express from 'express';
import { login, getMe } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.get('/:id', getMe);

export default router;
