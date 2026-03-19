import { Router } from 'express';
import { getUserProfile } from '../../controllers/users/profileController';

const router = Router();

router.get('/:username', getUserProfile);

export default router;