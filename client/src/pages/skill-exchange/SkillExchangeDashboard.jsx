import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills, fetchMatches, addUserSkill, sendSkillRequest } from '../../features/skillExchange/skillExchangeSlice';
import axios from 'axios';

const AVATAR_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB35Dn0T6cXFSlM_zviMquK1Avx0EXxLtlz690yKQjWiGKUuY4ZsoJPvN3IYEoFXcykIoljCTJ80p8PRS_m1zngB7ne0fJrPOebKxQtoQ-yny-J9fEYU7OH7QtTC5bCCQyuDnOImsHxa2GgArUbzMGWat0lkFTedWY89Rt3zghObW2KqnEDSTlwDKwcdMWihIvSKp738DqNsW4-klE6A9H8cCwC1rewPb7eq6EGOQMClU7tuu8tH3Pkz6go8gIKxaJU6UIXSVIc93Q';

const SkillExchangeDashboard = () => {
  const dispatch = useDispatch();
  const { skills = [], matches = [], loading, error } = useSelector(state => state.skillExchange || {});
  const [mode, setMode] = useState('learn'); // 'learn' or 'teach'
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  // Compute unique skills offered to teach
  const teachableSkills = Array.from(new Set(skills
    .filter(s => s.UserSkills && s.UserSkills.some(us => us.type === 'teach'))
    .map(s => s.name)
  ));

  useEffect(() => {
    dispatch(fetchSkills());
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    // Sync teachSkills and learnSkills with backend after fetch
    setTeachSkills(skills.filter(s => s.UserSkills && s.UserSkills.some(us => us.type === 'teach')).map(s => s.name));
    setLearnSkills(skills.filter(s => s.UserSkills && s.UserSkills.some(us => us.type === 'learn')).map(s => s.name));
  }, [skills]);

  const handleAddSkill = async () => {
    if (mode === 'learn' && skillInput) {
      if (!learnSkills.includes(skillInput)) {
        setLearnSkills(prev => [...prev, skillInput]);
      }
      await dispatch(addUserSkill({ skillName: skillInput, type: 'learn' }));
      setSkillInput('');
      dispatch(fetchSkills());
      dispatch(fetchMatches());
    } else if (mode === 'teach' && skillInput) {
      if (!teachSkills.includes(skillInput)) {
        setTeachSkills(prev => [...prev, skillInput]);
      }
      await dispatch(addUserSkill({ skillName: skillInput, type: 'teach' }));
      setSkillInput('');
      dispatch(fetchSkills());
      dispatch(fetchMatches());
    }
  };

  const handleSendRequest = (recipientId, skillId) => {
    dispatch(sendSkillRequest({ recipientId, skillId, message }));
    setMessage('');
    alert('Request sent!');
  };

  const handleDeleteTeachSkill = async (skillName) => {
    // Find the UserSkill entry for this skill and type 'teach'
    const skillObj = skills.find(s => s.name === skillName);
    if (!skillObj) return;
    // Find the UserSkill id for 'teach'
    const userSkill = skillObj.UserSkills?.find(us => us.type === 'teach');
    if (!userSkill) return;
    // Call backend to delete
    await axios.delete(`/api/skill-exchange/user-skill/${userSkill.id}`);
    // Refresh skills and matches
    dispatch(fetchSkills());
    dispatch(fetchMatches());
  };

  if (loading) return <div className="p-8 text-center text-lg text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-lg text-red-500">{error.toString()}</div>;
  if (!Array.isArray(skills) || !Array.isArray(matches)) return <div className="p-8 text-center text-lg text-gray-400">Loading data...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-indigo-950 text-white flex flex-col">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Peer-to-Peer Skill Exchange</p>
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Add Skills</h2>
            <div className="flex flex-wrap gap-3 p-4">
              <label
                className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#3e4d5b] px-4 h-11 text-white relative cursor-pointer ${mode === 'learn' ? 'border-[3px] px-3.5 border-[#c9dbec]' : ''}`}
              >
                I want to learn
                <input
                  type="radio"
                  className="invisible absolute"
                  name="mode"
                  checked={mode === 'learn'}
                  onChange={() => { setMode('learn'); setSkillInput(''); }}
                />
              </label>
              <label
                className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#3e4d5b] px-4 h-11 text-white relative cursor-pointer ${mode === 'teach' ? 'border-[3px] px-3.5 border-[#c9dbec]' : ''}`}
              >
                I want to teach
                <input
                  type="radio"
                  className="invisible absolute"
                  name="mode"
                  checked={mode === 'teach'}
                  onChange={() => { setMode('teach'); setSkillInput(''); }}
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2">Skills</p>
                {mode === 'learn' ? (
                  <select
                    className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3e4d5b] bg-[#1f262e] focus:border-[#3e4d5b] h-14 placeholder:text-[#9eaebd] p-[15px] text-base font-normal leading-normal"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                  >
                    <option value="">Select a skill to learn</option>
                    {teachableSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    placeholder="e.g., Python Programming"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3e4d5b] bg-[#1f262e] focus:border-[#3e4d5b] h-14 placeholder:text-[#9eaebd] p-[15px] text-base font-normal leading-normal"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                  />
                )}
              </label>
            </div>
            <div className="flex px-4 py-3 justify-start">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#c9dbec] text-[#151a1e] text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={handleAddSkill}
                disabled={!skillInput}
              >
                <span className="truncate">Add Skill</span>
              </button>
            </div>
            {mode === 'teach' && teachSkills.length > 0 && (
              <div className="px-4 py-3">
                <h3 className="text-white text-lg font-semibold mb-2">Your Teach Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {teachSkills.map(skill => (
                    <div key={skill} className="bg-[#1f262e] text-white rounded-xl px-4 py-2 shadow border border-[#3e4d5b] flex items-center gap-2">
                      <span>{skill}</span>
                      <button
                        className="ml-2 text-white bg-gradient-to-tr from-red-500 via-pink-500 to-yellow-500 hover:from-red-600 hover:to-yellow-400 focus:ring-2 focus:ring-pink-300 shadow-lg transition-all duration-200 rounded-full w-7 h-7 flex items-center justify-center border-2 border-white/20 hover:scale-110 active:scale-95"
                        title="Delete skill"
                        onClick={() => handleDeleteTeachSkill(skill)}
                        style={{ fontWeight: 'bold', fontSize: '20px', lineHeight: '1', boxShadow: '0 2px 8px rgba(255,0,80,0.15)' }}
                      >
                        <span className="sr-only">Delete</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 pointer-events-none">
                          <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recommended Matches</h2>
            <div className="p-4">
              {matches.length === 0 ? (
                <p className="text-[#9eaebd] text-base font-normal leading-normal">No matches found yet.</p>
              ) : (
                matches.map(match => (
                  <div
                    key={match.id}
                    className="flex items-center gap-4 rounded-xl bg-[#1f262e] p-4 shadow border border-[#3e4d5b] min-w-[320px] mb-4"
                  >
                    <img
                      src={match.user?.avatar || AVATAR_PLACEHOLDER}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="text-white text-base font-bold">{match.user?.name || 'Unknown'}</div>
                      <div className="text-[#9eaebd] text-sm">Branch: {match.user?.branch || 'N/A'}</div>
                      <div className="text-[#9eaebd] text-sm">Email: {match.user?.email || 'N/A'}</div>
                      <div className="text-[#9eaebd] text-sm">Semester: {match.user?.semester || 'N/A'}</div>
                      <div className="text-[#9eaebd] text-sm">Skill: {match.Skill?.name || 'Unknown'}</div>
                    </div>
                    <button
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2b3640] text-white text-sm font-medium leading-normal w-fit ml-auto"
                      onClick={() => handleSendRequest(match.user.id, match.Skill.id)}
                    >
                      <span className="truncate">Request to Connect</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillExchangeDashboard; 