import express from 'express';
import {
    getUserById,
    login,
    logout,
    register,
} from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', authenticateToken, getUserById);
router.put('/logout', authenticateToken, logout);

export default router;
