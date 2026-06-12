import React from "react";
import { Newspaper } from "lucide-react";

const newsItems = [
  {
    id: 1,
    category: "Politik • 5 jam yang lalu",
    title: "Prabowo Soroti Pentingnya Pengawasan Ketat Pengusaha Nasional",
    postsCount: "23.6K postingan",
    avatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=50&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    category: "Gaya Hidup • 6 jam yang lalu",
    title: "Foto Kucing Lucu Banjiri Linimasa, Bikin Gemas Warganet",
    postsCount: "7,592 postingan",
    avatars: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    category: "Sedang Tren • Hiburan",
    title: "TalkHive Dipenuhi Candaan Sepatu Boots Merah yang Viral",
    postsCount: "391 postingan",
    avatars: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&auto=format&fit=crop",
    ],
  },
];

export const TodaysNewsCard: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4 text-left">
      <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-50 pb-2">
        <Newspaper size={17} className="text-indigo-500" />
        <h2 className="font-extrabold text-sm tracking-wide">Today's News</h2>
      </div>

      <div className="space-y-3.5">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer space-y-1 hover:opacity-85 transition"
          >
            <p className="text-[10px] font-semibold text-slate-400">
              {item.category}
            </p>
            <h3 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition">
              {item.title}
            </h3>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[9px] font-bold text-slate-400/80">
                {item.postsCount}
              </p>

              {/* Stacked Avatar */}
              <div className="flex -space-x-1 overflow-hidden">
                {item.avatars.map((url, idx) => (
                  <img
                    key={idx}
                    className="inline-block h-3.5 w-3.5 rounded-full ring-2 ring-white object-cover"
                    src={url}
                    alt="User avatar"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysNewsCard;
