import express from 'express';
import { initGeneral, updateGeneral } from '../controllers/general.controller.js';

const router = express.Router();

router.get('/get-general-settings', initGeneral);
router.put('/update-general', updateGeneral);

export default router;