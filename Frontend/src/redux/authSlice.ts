import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "@/types/auth";

// Mengambil data dari localStorage agar saat refresh data tidak hilang
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  suggestedUsers: [],
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
      state.suggestedUsers = [];

      // Hapus dari localStorage browser
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Sinkronkan data terupdate ke localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setSuggestedUsers: (state, action: PayloadAction<User[]>) => {
      state.suggestedUsers = action.payload.map((user) => ({
        ...user,
        isFollowed: false,
      }));
    },

    toggleSuggestedUserFollow: (
      state,
      action: PayloadAction<{ targetId: number; isFollow: boolean }>,
    ) => {
      const { targetId, isFollow } = action.payload;
      const user = state.suggestedUsers.find((u) => u.id === targetId);

      // 1. Update status di suggestion list jika ada
      if (user) {
        user.isFollowed = isFollow;
      }
      // 2. Update jumlah following user yang sedang login secara dinamis
      if (state.user) {
        state.user.followingCount = Math.max(
          0,
          (state.user.followingCount ?? 0) + (isFollow ? 1 : -1),
        );
        // Simpan versi terupdate ke localStorage agar tidak ter-reset saat di-refresh
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const {
  loginSuccess,
  logout,
  setProfile,
  setSuggestedUsers,
  toggleSuggestedUserFollow,
} = authSlice.actions;
export default authSlice.reducer;
