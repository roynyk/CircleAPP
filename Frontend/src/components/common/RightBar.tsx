import React, { useEffect, useState } from "react";
import { UserPlus, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setSuggestedUsers,
  toggleSuggestedUserFollow,
} from "@/redux/authSlice"; // <-- Import toggle action
import api from "@/lib/axios";
import { toast } from "sonner";
import TodaysNewsCard from "./TodaysNewsCard";
import WhatsHappeningCard from "./WhatsHappeningCard";

const RightBar: React.FC = () => {
  const dispatch = useDispatch();
  const suggestedUsers = useSelector(
    (state: RootState) => state.auth.suggestedUsers,
  );
  const [loading, setLoading] = useState(true);

  // Fetch daftar rekomendasi user dari backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get("/users/suggested");
        dispatch(setSuggestedUsers(response.data.data));
      } catch (error) {
        console.error("Gagal memuat rekomendasi user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [dispatch]);

  // Fungsi toggle follow / unfollow
  const handleFollowToggle = async (
    targetId: number,
    username: string,
    isCurrentlyFollowed: boolean,
  ) => {
    try {
      if (isCurrentlyFollowed) {
        // Jika sudah di-follow, maka panggil API Unfollow
        await api.delete(`/users/unfollow/${targetId}`); // Sesuaikan dengan endpoint unfollow kamu
        toast.success(`Batal mengikuti @${username}`);
      } else {
        // Jika belum di-follow, maka panggil API Follow
        await api.post(`/users/follow/${targetId}`); // Sesuaikan dengan endpoint follow kamu
        toast.success(`Berhasil mengikuti @${username}`);
      }

      // Update status di Redux (akan langsung mengubah tampilan tombol)
      dispatch(
        toggleSuggestedUserFollow({ targetId, isFollow: !isCurrentlyFollowed }),
      );
    } catch {
      toast.error(
        isCurrentlyFollowed
          ? "Gagal batal mengikuti"
          : "Gagal mengikuti pengguna",
      );
    }
  };

  return (
    <aside className="w-96 hidden lg:flex flex-col space-y-5 p-6 h-fit sticky bottom-6 self-end">
      <TodaysNewsCard />
      <WhatsHappeningCard />
      <div className="bg-white/70 backdrop-blur-md border border-slate-100 shadow-sm rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between text-slate-800 border-b border-slate-100/80 pb-3">
          <div className="flex items-center space-x-2">
            <UserPlus size={18} className="text-blue-500" />
            <h2 className="font-bold text-sm tracking-wide">Who to Follow</h2>
          </div>
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
        </div>

        {loading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    <div className="h-2 w-16 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="h-7 w-14 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : suggestedUsers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No recommendations at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 -mx-2 hover:bg-slate-50/80 rounded-xl transition duration-200 group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar className="h-9 w-9 border border-slate-100 group-hover:border-blue-400/50 transition duration-300">
                    <AvatarImage
                      src={getAvatarUrl(user.photoProfile)}
                      alt={user.fullName}
                    />
                    <AvatarFallback className="bg-blue-50 text-xs text-blue-600 font-bold uppercase">
                      {user.fullName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition duration-150">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* Tombol dengan Kondisional ClassName & Teks */}
                <Button
                  size="sm"
                  variant={user.isFollowed ? "secondary" : "outline"}
                  onClick={() =>
                    handleFollowToggle(
                      user.id,
                      user.username,
                      !!user.isFollowed,
                    )
                  }
                  className={`h-7 text-[10px] font-bold px-3.5 rounded-lg cursor-pointer transition duration-200 ${
                    user.isFollowed
                      ? "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-red-600 hover:border-red-200" // Hover berubah jadi merah tipis jika ingin batal
                      : "border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  }`}
                >
                  {user.isFollowed ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 4. Render Footer Catatan Kaki */}
      <div className="px-2 text-[9px] text-slate-400/80 leading-relaxed text-left space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 font-semibold text-sm">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <span>|</span>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="hover:underline">
            Cookie Policy
          </a>
          <span>|</span>
          <a href="#" className="hover:underline">
            Accessibility
          </a>
          <span>|</span>
          <a href="#" className="hover:underline">
            Ads Info
          </a>
          <span>|</span>
          <a href="#" className="hover:underline">
            More
          </a>
        </div>
        <div className="mt-1 font-bold text-[9px] text-slate-400/60">
          © 2026 TalkHive Corp.
        </div>
      </div>
    </aside>
  );
};

export default RightBar;
