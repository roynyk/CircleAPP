import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { Thread } from "@/types/thread";
import { getAvatarUrl } from "@/lib/utils";

interface ProfileMediaProps {
  mediaThreads: Thread[];
}

export const ProfileMedia: React.FC<ProfileMediaProps> = ({ mediaThreads }) => {
  return (
    <div className="p-5 grid grid-cols-3 gap-3">
      {mediaThreads.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <p className="text-gray-400 text-xs font-semibold">
            No media files found.
          </p>
        </div>
      ) : (
        mediaThreads.map((thread) => (
          <Link
            key={thread.id}
            to={`/thread/${thread.id}`}
            className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm cursor-pointer"
          >
            <img
              src={getAvatarUrl(thread.image!)}
              alt="Media postingan"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {/* Overlay interaktif saat hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center space-x-6 text-white text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <Heart size={15} className="fill-white" />
                <span>{thread.likes}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MessageCircle size={15} className="fill-white" />
                <span>{thread.reply}</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default ProfileMedia;
