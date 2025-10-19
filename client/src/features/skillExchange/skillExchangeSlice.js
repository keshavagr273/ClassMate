import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/skill-exchange',
  withCredentials: true
});

export const fetchSkills = createAsyncThunk('skillExchange/fetchSkills', async (_, { getState, rejectWithValue }) => {
  try {
    const { isAuthenticated } = getState().auth;
    if (!isAuthenticated) return rejectWithValue('Not authenticated');
    const res = await api.get('/skills');
    return res.data.skills;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch skills');
  }
});

export const fetchUserSkills = createAsyncThunk('skillExchange/fetchUserSkills', async (_, { rejectWithValue }) => {
  try {
    console.log('fetchUserSkills: Making API call to /my-skills');
    const res = await api.get('/my-skills');
    console.log('fetchUserSkills: API response:', res.data);
    return res.data;
  } catch (error) {
    console.error('fetchUserSkills: API error:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user skills');
  }
});

export const fetchMatches = createAsyncThunk('skillExchange/fetchMatches', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/matches');
    return res.data.matches;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
  }
});

export const addUserSkill = createAsyncThunk('skillExchange/addUserSkill', async ({ skillName, type }, { rejectWithValue }) => {
  try {
    const res = await api.post('/add-skill', { skillName, type });
    return res.data.userSkill;
  } catch (error) {
    if (error.response?.status === 409) {
      const message = error.response.data?.message || 'Skill already exists';
      return rejectWithValue(message);
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to add skill');
  }
});

export const sendSkillRequest = createAsyncThunk('skillExchange/sendSkillRequest', async ({ recipientId, skillId, message }, { rejectWithValue }) => {
  try {
    const res = await api.post('/request', { recipientId, skillId, message });
    return res.data.request;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send request');
  }
});

const skillExchangeSlice = createSlice({
  name: 'skillExchange',
  initialState: {
    skills: [],
    matches: [],
    userSkills: { teach: [], learn: [] },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Skills
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.skills = action.payload;
        state.loading = false;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error || 'Failed to fetch skills';
      })
      // Fetch Matches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
        state.loading = false;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error || 'Failed to fetch matches';
      })
      // Add User Skill
      .addCase(addUserSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserSkill.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to add the skill to a userSkills array if you have one
      })
      .addCase(addUserSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add skill';
      })
      // Send Skill Request
      .addCase(sendSkillRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendSkillRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Request sent successfully
      })
      .addCase(sendSkillRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send request';
      })
      // Fetch User Skills
      .addCase(fetchUserSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSkills.fulfilled, (state, action) => {
        console.log('Redux: fetchUserSkills.fulfilled - action.payload:', action.payload);
        state.userSkills = { teach: action.payload.teach || [], learn: action.payload.learn || [] };
        console.log('Redux: Updated state.userSkills:', state.userSkills);
        state.loading = false;
      })
      .addCase(fetchUserSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user skills';
      });
  }
});

export const { clearError } = skillExchangeSlice.actions;
export default skillExchangeSlice.reducer; 