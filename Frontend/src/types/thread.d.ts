export interface Creator {
  id: number;
  username: string;
  name: string;
  profile_picture: string | null;
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
    profile_picture: string | null;
  };
  created_at: string;
}

export interface ThreadCardProps {
  thread: Thread;
  onLikeToggle?: (threadId: number) => void;
  onCardClick?: (threadId: number) => void;
  isDetail: boolean;
}
