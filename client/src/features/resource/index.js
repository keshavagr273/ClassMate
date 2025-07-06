import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchSubjects = createAsyncThunk(
  "resource/fetchSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/resources/subjects");
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subjects"
      );
    }
  }
);

const initialState = {
  subjects: [],
  loading: false,
  error: null,
};

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    clearResourcesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
        state.error = null;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch subjects";
      });
  },
});

export const { clearResourcesError } = resourceSlice.actions;
export default resourceSlice.reducer; 