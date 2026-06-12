export interface Creator {
  id: number;
  username: string;
  name: string;
  photoProfile: string | null;
}

export interface Thread {
  id: number;
  content: string;
  image?: string | null;
  created_at: string;
  user: Creator;
  likes: number;
  reply: number;
  isLiked: boolean;
}

// 1. Definisikan tipe data untuk properti (props) yang diterima oleh ReplyCard
export interface ReplyData {
  id: number;
  content: string;
  image?: string | null;
  likes: number;
  reply: number;
  user: {
    id: number;
    username: string;
    name: string;
    photoProfile: string | null;
  };
  created_at: string;
}

export interface ThreadCardProps {
  thread: Thread;
  onLikeToggle?: (threadId: number) => void;
  onCardClick?: (threadId: number) => void;
  isDetail: boolean;
}

export interface SuggestedUser {
  id: number;
  username: string;
  fullName: string;
  photoProfile: string | null;
  bio: string | null;
}

interface HoverUserData {
  id: number;
  username: string;
  fullName: string;
  photoProfile: string | null;
  bio: string | null;
  followingCount: number;
  followersCount: number;
  isFollowed: boolean;
}

interface UserFollow {
  id: number;
  username: string;
  fullName: string;
  photoProfile: string | null;
  bio: string | null;
}
