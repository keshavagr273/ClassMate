import express from 'express';
import skillExchangeController from '../controllers/skillExchange.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/add-skill', auth, skillExchangeController.addUserSkill);
router.get('/skills', auth, skillExchangeController.getAllSkills);
router.get('/my-skills', auth, skillExchangeController.getUserSkills);
router.get('/matches', auth, skillExchangeController.getSkillMatches);
router.post('/request', auth, skillExchangeController.sendSkillRequest);
router.get('/requests', auth, skillExchangeController.getSkillRequests);
router.delete('/user-skill/:id', auth, skillExchangeController.deleteUserSkill);

export default router; 