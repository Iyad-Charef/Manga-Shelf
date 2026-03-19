import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  addToLibrary, 
  removeFromLibrary, 
  getLibrary, 
  setProgress, 
  rateManga, 
  commentManga, 
  getMangaDetails 
} from '../controllers/manga';

const router = Router();

// Protect ALL manga routes
router.use(requireAuth);

router.get('/library', getLibrary);
router.post('/library', addToLibrary);
router.delete('/library/:mangaId', removeFromLibrary);

router.post('/progress', setProgress);
router.post('/rating', rateManga);
router.post('/comment', commentManga);

router.get('/:mangaId/details', getMangaDetails);

export default router;
