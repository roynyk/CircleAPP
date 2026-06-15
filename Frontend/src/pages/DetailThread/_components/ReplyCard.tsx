import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReplyData } from "@/types/thread";
import { getAvatarUrl } from "@/lib/utils";

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
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="py-4 flex space-x-3 ">
      {/* 3. Tampilkan Avatar Pembuat Komentar */}
      <Avatar className="h-8 w-8">
        {reply.user.photoProfile && (
          <AvatarImage
            src={getAvatarUrl(reply.user.photoProfile)}
            alt={reply.user.username}
          />
        )}
        <AvatarFallback className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
          {reply.user.name[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 text-left min-w-0">
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

        {reply.content && (
          <p className="mt-1 text-xs text-gray-700 whitespace-pre-line leading-relaxed break-words">
            {reply.content}
          </p>
        )}

        {reply.image && (
          <div className="mmt-3 rounded-xl overflow-hidden border border-gray-100 max-h-80 w-fit max-w-full mt-2">
            <img
              src={getAvatarUrl(reply.image)} // Arahkan ke folder static uploads backend
              alt="Reply attachment"
              className="max-h-80 w-auto object-cover rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyCard;
