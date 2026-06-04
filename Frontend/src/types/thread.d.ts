export interface Creator {
  id: number;
  username: string;
  name: string;
  profile_picture: string | null;
}

export interface Thread {
  id: number;
  content: string;
  created_at: string;
  user: Creator;
  likes: number;
  reply: number;
  isLiked: boolean;
}
