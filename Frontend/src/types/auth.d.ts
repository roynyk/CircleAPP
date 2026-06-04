export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  photoProfile?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
