import React from "react";
import { TrendingUp, UserPlus, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { CardProfile } from "./CardProfile";

const RightBar: React.FC = () => {
  const suggestedUsers = [
    {
      id: 1,
      name: "Rian Pratama",
      username: "rianpratama",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      isOnline: true,
    },
    {
      id: 2,
      name: "Sarah Amanda",
      username: "sarahamand",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
      isOnline: true,
    },
    {
      id: 3,
      name: "Daffa Zaidan",
      username: "daffazdn",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop",
      isOnline: false,
    },
  ];

  const trendingTopics = [
    { tag: "#ReactJS_v19", posts: "12.4K postingan" },
    { tag: "#TailwindCSS_v4", posts: "8.1K postingan" },
    { tag: "#PrismaORM", posts: "3.2K postingan" },
    { tag: "#CircleAPP", posts: "1.5K postingan" },
  ];

  return (
    <aside className="w-80 hidden lg:flex flex-col space-y-6 p-6 h-fit sticky top-6">
      <CardProfile />
      {/* Box 1: Rekomendasi User */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <UserPlus size={18} className="text-blue-500" />
          <h2 className="font-bold text-sm tracking-wide">
            Siapa untuk Diikuti
          </h2>
        </div>

        <div className="space-y-3.5">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-9 w-9 border border-slate-200 group-hover:border-blue-400 transition duration-300">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-slate-100 text-xs text-slate-700 font-semibold">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition duration-200">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] font-bold px-3 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg cursor-pointer transition duration-150"
              >
                Ikuti
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Box 2: Topik Populer */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800">
          <Flame size={18} className="text-purple-500" />
          <h2 className="font-bold text-sm tracking-wide">Tren Lingkaran</h2>
        </div>

        <div className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="flex justify-between items-center group cursor-pointer"
            >
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition duration-200 truncate">
                  {topic.tag}
                </p>
                <p className="text-[10px] text-slate-400">{topic.posts}</p>
              </div>
              <TrendingUp
                size={14}
                className="text-slate-300 group-hover:text-purple-500 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightBar;
