import React from "react";
import { TrendingUp, MoreHorizontal } from "lucide-react";

const trendItems = [
  {
    id: 1,
    category: "Bisnis & Keuangan • Populer",
    tag: "#AktivisDiPemerintahan",
    postsCount: "12.4K postingan",
  },
  {
    id: 2,
    category: "Sedang Tren di Indonesia",
    tag: "#TerikatJanjiEp66",
    postsCount: "8.1K postingan",
  },
  {
    id: 3,
    category: "Olahraga • Sedang Tren",
    tag: "Pemain Terbaik",
    postsCount: "3.2K postingan",
  },
  {
    id: 4,
    category: "Sedang Tren di Indonesia",
    tag: "TVRI",
    postsCount: "1.5K postingan",
  },
];

export const WhatsHappeningCard: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4 text-left">
      <div className="flex items-center justify-between text-slate-800 border-b border-slate-50 pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp size={17} className="text-purple-500" />
          <h2 className="font-extrabold text-sm tracking-wide">
            What's Happening
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {trendItems.map((trend) => (
          <div
            key={trend.id}
            className="flex justify-between items-start group cursor-pointer"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="text-[9px] font-bold text-slate-400">
                {trend.category}
              </p>
              <h3 className="text-xs font-extrabold text-slate-800 truncate group-hover:text-purple-600 transition">
                {trend.tag}
              </h3>
              <p className="text-[9px] font-bold text-slate-400/80">
                {trend.postsCount}
              </p>
            </div>
            <button className="text-slate-300 hover:text-slate-500 p-0.5 rounded transition cursor-pointer">
              <MoreHorizontal size={14} />
            </button>
          </div>
        ))}
      </div>

      <button className="w-full text-left text-[10px] font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer pt-1">
        Show more
      </button>
    </div>
  );
};

export default WhatsHappeningCard;
