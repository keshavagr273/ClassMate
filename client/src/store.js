import { configureStore, combineReducers } from "@reduxjs/toolkit";
import ridesReducer from "./slices/ridesSlice";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import buyAndSellReducer from "./slices/buyandsellSlice";
import notificationReducer from "./slices/notificationSlice";
import lostAndFoundReducer from "./slices/lostAndFoundSlice";
import attendanceReducer from "./slices/attendanceSlice"
import enrollmentReducer from "./slices/enrollmentSlice"
import resourceReducer from "./features/resource";
import skillExchange from "./features/skillExchange/skillExchangeSlice";

// Combine reducers without persistence.
const rootReducer = combineReducers({
  rides: ridesReducer,
  auth: authReducer,
  profile: profileReducer,
  notifications: notificationReducer,
  buyAndSell: buyAndSellReducer,
  lostAndFound: lostAndFoundReducer,
  enrollment:enrollmentReducer,
  attendance:attendanceReducer,
  resource: resourceReducer,
  skillExchange,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;