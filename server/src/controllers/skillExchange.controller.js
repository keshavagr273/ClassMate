import Skill from '../models/skill.model.js';
import UserSkill from '../models/userSkill.model.js';
import SkillRequest from '../models/skillRequest.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// Add a skill to teach/learn
const addUserSkill = async (req, res) => {
  try {
    const { skillName, type } = req.body;
    const userId = req.user.id;
    console.log('addUserSkill called with:', { skillName, type, userId });

    if (!skillName || !type || !userId) {
      console.log('Missing field:', { skillName, type, userId });
      return res.status(400).json({ success: false, message: "skillName, type, and userId are required" });
    }

    let skill = await Skill.findOne({ where: { name: skillName } });
    if (!skill) skill = await Skill.create({ name: skillName });
    const [userSkill, created] = await UserSkill.findOrCreate({
      where: { userId: userId, SkillId: skill.id, type }
    });
    console.log('UserSkill created:', userSkill, 'Was created:', created);

    if (!created) {
      return res.status(409).json({ success: false, message: "Skill already added for this type" });
    }
    res.json({ success: true, userSkill });
  } catch (error) {
    console.error("Error in addUserSkill:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all skills (for search/filter)
const getAllSkills = async (req, res) => {
  const skills = await Skill.findAll({
    include: [
      {
        model: UserSkill,
        attributes: ['id', 'type', 'userId'],
      }
    ]
  });
  res.json({ success: true, skills });
};

// Get user's teach/learn skills
const getUserSkills = async (req, res) => {
  const userId = req.user.id;
  const teach = await UserSkill.findAll({ where: { userId: userId, type: 'teach' }, include: Skill });
  const learn = await UserSkill.findAll({ where: { userId: userId, type: 'learn' }, include: Skill });
  res.json({ success: true, teach, learn });
};

// Find matches for current user
const getSkillMatches = async (req, res) => {
  const userId = req.user.id;
  // Find skills user wants to learn
  const learnSkills = await UserSkill.findAll({ where: { userId: userId, type: 'learn' } });
  const skillIds = learnSkills.map(us => us.SkillId);
  // Find users who can teach those skills
  const matches = await UserSkill.findAll({
    where: { SkillId: skillIds, type: 'teach' },
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'branch', 'semester'] },
      Skill
    ]
  });
  res.json({ success: true, matches });
};

// Send a request to connect
const sendSkillRequest = async (req, res) => {
  const { recipientId, skillId, message } = req.body;
  const requesterId = req.user.id;

  // Get requester details
  const requester = await User.findByPk(requesterId);
  // Get skill details
  const skill = await Skill.findByPk(skillId);

  const request = await SkillRequest.create({ requesterId, recipientId, SkillId: skillId, message });

  // Create notification for the recipient
  await Notification.create({
    userId: recipientId,
    title: 'New Skill Exchange Request',
    message: `${requester.name} (${requester.email}) wants to learn (${skill?.name || 'a skill'}) from you.`,
    type: 'skill_exchange',
    is_read: false
  });

  res.json({ success: true, request });
};

// Get requests for user
const getSkillRequests = async (req, res) => {
  const userId = req.user.id;
  const requests = await SkillRequest.findAll({
    where: { recipientId: userId },
    include: [
      { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
      Skill
    ]
  });
  res.json({ success: true, requests });
};

// Delete a user skill
const deleteUserSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userSkill = await UserSkill.findOne({ where: { id, userId } });
    if (!userSkill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    await userSkill.destroy();
    res.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    console.error("Error in deleteUserSkill:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default {
  addUserSkill,
  getAllSkills,
  getUserSkills,
  getSkillMatches,
  sendSkillRequest,
  getSkillRequests,
  deleteUserSkill,
}; 