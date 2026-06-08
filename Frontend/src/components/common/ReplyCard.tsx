import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 1. Definisikan tipe data untuk properti (props) yang diterima oleh ReplyCard
interface ReplyData {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    name: string;
    profile_picture: string | null;
    avatar: string | null;
  };
  created_at: string;
}

interface ReplyCardProps {
  reply: ReplyData;
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply }) => {
  // 2. Fungsi pembantu untuk memformat tanggal (misal: "8 Jun")
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="py-4 flex space-x-3">
      {/* 3. Tampilkan Avatar Pembuat Komentar */}
      <Avatar className="h-8 w-8">
        {(reply.user.profile_picture || reply.user.avatar) && (
          <AvatarImage
            src={reply.user.profile_picture || reply.user.avatar || ""}
            alt={reply.user.username}
          />
        )}
        <AvatarFallback className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
          {reply.user.name[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 text-left">
        {/* 4. Bagian Header Komentar (Nama, Username, Tanggal Komentar) */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-900 text-xs">
            {reply.user.name}
          </span>
          <span className="text-[10px] text-gray-500">
            @{reply.user.username}
          </span>
          <span className="text-[10px] text-gray-300">•</span>
          <span className="text-[10px] text-gray-400">
            {formatDate(reply.created_at)}
          </span>
        </div>

        {/* 5. Bagian Isi Komentar */}
        <p className="mt-1 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
          {reply.content}
        </p>
      </div>
    </div>
  );
};

export default ReplyCard;
