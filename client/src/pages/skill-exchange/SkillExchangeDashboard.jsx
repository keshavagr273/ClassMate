import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills, fetchMatches, addUserSkill, sendSkillRequest, clearError, fetchUserSkills } from '../../features/skillExchange/skillExchangeSlice';
import axios from 'axios';

const AVATAR_PLACEHOLDER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB35Dn0T6cXFSlM_zviMquK1Avx0EXxLtlz690yKQjWiGKUuY4ZsoJPvN3IYEoFXcykIoljCTJ80p8PRS_m1zngB7ne0fJrPOebKxQtoQ-yny-J9fEYU7OH7QtTC5bCCQyuDnOImsHxa2GgArUbzMGWat0lkFTedWY89Rt3zghObW2KqnEDSTlwDKwcdMWihIvSKp738DqNsW4-klE6A9H8cCwC1rewPb7eq6EGOQMClU7tuu8tH3Pkz6go8gIKxaJU6UIXSVIc93Q';

const SkillExchangeDashboard = () => {
  const dispatch = useDispatch();
  const { skills = [], matches = [], userSkills = { teach: [], learn: [] }, loading, isAuthenticated } = useSelector(state => state.skillExchange || {});
  const { user, isAuthenticated: authIsAuthenticated } = useSelector(state => state.auth || {});
  const [mode, setMode] = useState('learn'); // 'learn' or 'teach'
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Compute unique skills offered to teach (for learn mode)
  const teachableSkills = Array.from(new Set(skills
    .filter(s => s.UserSkills && s.UserSkills.some(us => us.type === 'teach'))
    .map(s => s.name)
  ));

  // Get all available skills (for learn mode - all skills in the system)
  const allAvailableSkills = Array.from(new Set(skills.map(s => s.name)));

  useEffect(() => {
    if (authIsAuthenticated) {
      dispatch(fetchSkills());
      dispatch(fetchMatches());
      dispatch(fetchUserSkills());
    }
    // Clear any global error state when component mounts
    dispatch(clearError());
    setErrorMessage('');
  }, [dispatch, authIsAuthenticated]);

  useEffect(() => {
    // Sync teachSkills and learnSkills with Redux userSkills state
    const teachSkillsFromRedux = (userSkills.teach || []).map(skill => skill.Skill?.name || skill.name);
    const learnSkillsFromRedux = (userSkills.learn || []).map(skill => skill.Skill?.name || skill.name);
        setTeachSkills(teachSkillsFromRedux);
    setLearnSkills(learnSkillsFromRedux);
  }, [userSkills]);

  const handleAddSkill = async () => {
    if (!skillInput || isAddingSkill) return;
    
    // Input validation
    const trimmedInput = skillInput.trim();
    if (trimmedInput.length === 0) {
      setErrorMessage('Skill name cannot be empty');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    if (trimmedInput.length > 100) {
      setErrorMessage('Skill name must be less than 100 characters');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    // Check if skill already exists using both Redux userSkills data and local state
    const currentUserSkills = mode === 'learn' ? (userSkills.learn || []) : (userSkills.teach || []);
    const currentSkillNames = currentUserSkills.map(skill => skill.Skill?.name || skill.name);
    
    // Also check against local state for immediate feedback
    const localSkills = mode === 'learn' ? learnSkills : teachSkills;
    
    if (currentSkillNames.includes(trimmedInput) || localSkills.includes(trimmedInput)) {
      setErrorMessage(`You have already added "${trimmedInput}" as a ${mode} skill`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Note: For teach mode, users can now add any skill they want to teach
    // No need to restrict to previously added skills
    
    setIsAddingSkill(true);
    setErrorMessage(''); // Clear any previous errors
    
    try {
      const result = await dispatch(addUserSkill({ skillName: trimmedInput, type: mode }));
      
      if (addUserSkill.fulfilled.match(result)) {
        // Success - skill was added
        setSkillInput('');
        dispatch(fetchSkills());
        dispatch(fetchMatches());
        dispatch(fetchUserSkills());
        
        // Update local state
        if (mode === 'learn' && !learnSkills.includes(trimmedInput)) {
          setLearnSkills(prev => [...prev, trimmedInput]);
        } else if (mode === 'teach' && !teachSkills.includes(trimmedInput)) {
          setTeachSkills(prev => [...prev, trimmedInput]);
        }
      } else if (addUserSkill.rejected.match(result)) {
        // Error - skill already exists or other error
        const errorMsg = result.payload || result.error?.message || 'Failed to add skill';
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 5000); // Clear error after 5 seconds
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      setErrorMessage('Failed to add skill');
      setTimeout(() => setErrorMessage(''), 5000); // Clear error after 5 seconds
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleSendRequest = async (recipientId, skillId) => {
    try {
      const result = await dispatch(sendSkillRequest({ recipientId, skillId, message }));
      if (sendSkillRequest.fulfilled.match(result)) {
        setMessage('');
        setErrorMessage('Request sent successfully!');
        setTimeout(() => setErrorMessage(''), 3000);
      } else if (sendSkillRequest.rejected.match(result)) {
        const errorMsg = result.payload || 'Failed to send request';
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setErrorMessage('Failed to send request');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDeleteTeachSkill = async (skillName) => {
    if (!authIsAuthenticated) return;
    
    try {
      // Find the UserSkill entry for this skill and type 'teach' from Redux userSkills
      const teachSkill = (userSkills.teach || []).find(skill => 
        (skill.Skill?.name || skill.name) === skillName
      );
      
      if (!teachSkill) {
        setErrorMessage('Skill not found');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      // Call backend to delete using the UserSkill ID
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.delete(`${apiBase}/skill-exchange/user-skill/${teachSkill.id}`, {
        withCredentials: true
      });
      
      // Refresh skills and matches
      dispatch(fetchSkills());
      dispatch(fetchMatches());
      dispatch(fetchUserSkills());
      
      setErrorMessage('Skill deleted successfully!');
      setTimeout(() => setErrorMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to delete skill: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (loading) return <div className="p-8 text-center text-lg text-gray-400">Loading...</div>;
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
                    onChange={e => {
                      setSkillInput(e.target.value);
                      // Don't clear error immediately - let user see the message
                    }}
                  >
                    <option value="">Select a skill to learn</option>
                    {allAvailableSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    placeholder="e.g., Python Programming, Web Development"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#3e4d5b] bg-[#1f262e] focus:border-[#3e4d5b] h-14 placeholder:text-[#9eaebd] p-[15px] text-base font-normal leading-normal"
                    value={skillInput}
                    onChange={e => {
                      setSkillInput(e.target.value);
                      // Don't clear error immediately - let user see the message
                    }}
                  />
                )}
              </label>
            </div>
            <div className="flex px-4 py-3 justify-start">
              <button
                className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                  !skillInput || isAddingSkill 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                    : 'bg-[#c9dbec] text-[#151a1e] cursor-pointer hover:bg-[#b8c9dc]'
                }`}
                onClick={handleAddSkill}
                disabled={!skillInput || isAddingSkill}
              >
                {isAddingSkill ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <span className="truncate">
                    {mode === 'learn' ? 'Add to Learn Skills' : 'Add to Teach Skills'}
                  </span>
                )}
              </button>
            </div>
            
            {errorMessage && (
              <div className="px-4 py-2">
                <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1">{errorMessage}</span>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Dismiss error"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            
            {/* Show skills based on current mode */}
            {mode === 'teach' && teachSkills.length > 0 && (
              <div className="px-4 py-3">
                <h3 className="text-white text-lg font-semibold mb-2">Your Teaching Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {teachSkills.map(skill => (
                    <div key={`teach-${skill}`} className="bg-[#1f262e] text-white rounded-xl px-4 py-2 shadow border border-[#3e4d5b] flex items-center gap-2">
                      <span>{skill}</span>
                      <button
                        className="ml-2 text-white bg-gradient-to-tr from-red-500 via-pink-500 to-yellow-500 hover:from-red-600 hover:to-yellow-400 focus:ring-2 focus:ring-pink-300 shadow-lg transition-all duration-200 rounded-full w-7 h-7 flex items-center justify-center border-2 border-white/20 hover:scale-110 active:scale-95"
                        title="Delete skill"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteTeachSkill(skill);
                        }}
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

            {mode === 'learn' && learnSkills.length > 0 && (
              <div className="px-4 py-3">
                <h3 className="text-white text-lg font-semibold mb-2">Your Learning Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {learnSkills.map(skill => (
                    <div key={`learn-${skill}`} className="bg-[#1f262e] text-white rounded-xl px-4 py-2 shadow border border-[#3e4d5b] flex items-center gap-2">
                      <span>{skill}</span>
                      <span className="text-xs text-gray-400 ml-2">(Learning)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Only show Recommended Matches in learn mode */}
            {mode === 'learn' && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillExchangeDashboard; 