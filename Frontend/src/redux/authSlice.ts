import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "@/types/auth";

// Mengambil data dari localStorage agar saat refresh data tidak hilang
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Simpan ke localStorage browser
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Hapus dari localStorage browser
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Sinkronkan data terupdate ke localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
});

export const { loginSuccess, logout, setProfile } = authSlice.actions;
export default authSlice.reducer;
