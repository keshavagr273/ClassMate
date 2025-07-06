import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({ baseURL: '/api/skill-exchange' });

export const fetchSkills = createAsyncThunk('skillExchange/fetchSkills', async () => {
  const res = await api.get('/skills');
  return res.data.skills;
});

export const fetchMatches = createAsyncThunk('skillExchange/fetchMatches', async () => {
  const res = await api.get('/matches');
  return res.data.matches;
});

export const addUserSkill = createAsyncThunk('skillExchange/addUserSkill', async ({ skillName, type }) => {
  const res = await api.post('/add-skill', { skillName, type });
  return res.data.userSkill;
});

export const sendSkillRequest = createAsyncThunk('skillExchange/sendSkillRequest', async ({ recipientId, skillId, message }) => {
  const res = await api.post('/request', { recipientId, skillId, message });
  return res.data.request;
});

const skillExchangeSlice = createSlice({
  name: 'skillExchange',
  initialState: {
    skills: [],
    matches: [],
    loading: false,
    error: null,
  },
  reducers: {},
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
      });
  }
});

export default skillExchangeSlice.reducer; 