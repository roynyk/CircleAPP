export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  photoProfile?: string;
  bio?: string | null; // <--- Tambahkan Bio
  followingCount?: number; // <--- Tambahkan Jumlah Following
  followersCount?: number; // <--- Tambahkan Jumlah Followers
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
