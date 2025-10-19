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

    // Enhanced validation
    if (!skillName || !type || !userId) {
      return res.status(400).json({ success: false, message: "skillName, type, and userId are required" });
    }

    // Validate skill name
    if (typeof skillName !== 'string' || skillName.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Skill name must be a non-empty string" });
    }

    if (skillName.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Skill name must be less than 100 characters" });
    }

    // Validate type
    if (!['teach', 'learn'].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be either 'teach' or 'learn'" });
    }

    let skill = await Skill.findOne({ where: { name: skillName } });
    if (!skill) skill = await Skill.create({ name: skillName });
    const [userSkill, created] = await UserSkill.findOrCreate({
      where: { userId: userId, SkillId: skill.id, type }
    });

    if (!created) {
      return res.status(409).json({ 
        success: false, 
        message: `You have already added "${skillName}" as a ${type} skill`,
        code: "SKILL_ALREADY_EXISTS"
      });
    }
    res.json({ success: true, userSkill });
  } catch (error) {
    console.error("Error in addUserSkill:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all skills (for search/filter)
const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      include: [
        {
          model: UserSkill,
          attributes: ['id', 'type', 'userId'],
          as: 'userSkills' // Use the correct association alias
        }
      ]
    });
    res.json({ success: true, skills });
  } catch (error) {
    console.error("Error in getAllSkills:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get user's teach/learn skills
const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const teach = await UserSkill.findAll({ 
      where: { userId: userId, type: 'teach' }, 
      include: [{ model: Skill, attributes: ['id', 'name'] }] 
    });
    const learn = await UserSkill.findAll({ 
      where: { userId: userId, type: 'learn' }, 
      include: [{ model: Skill, attributes: ['id', 'name'] }] 
    });
    
    res.json({ success: true, teach, learn });
  } catch (error) {
    console.error("Error in getUserSkills:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Find matches for current user
const getSkillMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find skills user wants to learn
    const learnSkills = await UserSkill.findAll({ where: { userId: userId, type: 'learn' } });
    const skillIds = learnSkills.map(us => us.SkillId);
    
    if (skillIds.length === 0) {
      return res.json({ success: true, matches: [] });
    }
    
    // Find users who can teach those skills
    const matches = await UserSkill.findAll({
      where: { SkillId: skillIds, type: 'teach' },
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'branch', 'semester'] },
        { model: Skill, attributes: ['id', 'name'] }
      ]
    });
    res.json({ success: true, matches });
  } catch (error) {
    console.error("Error in getSkillMatches:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Send a request to connect
const sendSkillRequest = async (req, res) => {
  try {
    const { recipientId, skillId, message } = req.body;
    const requesterId = req.user.id;

    // Validation
    if (!recipientId || !skillId) {
      return res.status(400).json({ success: false, message: "recipientId and skillId are required" });
    }

    if (recipientId === requesterId) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    // Get requester details
    const requester = await User.findByPk(requesterId);
    if (!requester) {
      return res.status(404).json({ success: false, message: "Requester not found" });
    }

    // Get recipient details
    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    // Get skill details
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

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
  } catch (error) {
    console.error("Error in sendSkillRequest:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get requests for user
const getSkillRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await SkillRequest.findAll({
      where: { recipientId: userId },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
        { model: Skill, attributes: ['id', 'name'] }
      ]
    });
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error in getSkillRequests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
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