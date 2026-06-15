import React, { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { HoverUserData } from "@/types/thread";
import { getImageUrl } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { toggleSuggestedUserFollow } from "@/redux/authSlice";

interface ProfileHoverCardProps {
  userId: number;
  children: React.ReactNode;
}

export const ProfileHoverCard: React.FC<ProfileHoverCardProps> = ({
  userId,
  children,
}) => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<HoverUserData | null>(null);
  const [loading, setLoading] = useState(false);

  // Ambil data profil user target saat Hover Card pertama kali dibuka
  const handleOpenChange = async (open: boolean) => {
    if (open && !userData) {
      try {
        setLoading(true);
        const response = await api.get(`/users/${userId}`);
        setUserData(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data hover profil:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData) return;
    try {
      const newFollowStatus = !userData.isFollowed;

      if (userData.isFollowed) {
        await api.delete(`/users/unfollow/${userId}`);
        toast.success(`Unfollowed @${userData.username}`);
      } else {
        await api.post(`/users/follow/${userId}`);
        toast.success(`Followed @${userData.username}`);
      }
      // 1. Update state lokal Hover Card secara instan
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              isFollowed: newFollowStatus,
              followersCount: prev.isFollowed
                ? prev.followersCount - 1
                : prev.followersCount + 1,
            }
          : null,
      );
      // 2. Sinkronkan dengan Redux global (mengupdate followingCount dan tombol RightBar)
      dispatch(
        toggleSuggestedUserFollow({
          targetId: userId,
          isFollow: newFollowStatus,
        }),
      );
    } catch {
      toast.error("Cannot follow yourself");
    }
  };

  return (
    <HoverCard onOpenChange={handleOpenChange} openDelay={300}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer">{children}</span>
      </HoverCardTrigger>

      <HoverCardContent className="w-72 p-4 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl text-left">
        {loading && !userData ? (
          <div className="animate-pulse space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
              <div className="h-7 w-16 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
              <div className="h-2.5 w-16 bg-slate-200 rounded"></div>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded"></div>
          </div>
        ) : userData ? (
          <div className="space-y-3">
            {/* Bagian Atas: Avatar & Tombol Follow */}
            <div className="flex justify-between items-start">
              <Avatar className="h-12 w-12 border border-slate-100">
                <AvatarImage
                  src={getImageUrl(userData.photoProfile)}
                  alt={userData.fullName}
                />
                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold uppercase text-base">
                  {userData.fullName[0]}
                </AvatarFallback>
              </Avatar>

              <Button
                size="sm"
                variant={userData.isFollowed ? "secondary" : "default"}
                onClick={handleFollowToggle}
                className={`h-8 text-[11px] font-bold px-4 rounded-lg cursor-pointer transition duration-200 ${
                  userData.isFollowed
                    ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {userData.isFollowed ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Nama & Username */}
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-slate-800 leading-none">
                {userData.fullName}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                @{userData.username}
              </p>
            </div>

            {/* Statistik Followers / Following (Teks biasa tanpa klik) */}
            <div className="mt-4 flex items-center space-x-5 pt-4 border-t border-slate-100/60 text-xs font-semibold text-slate-600">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-slate-800">
                  {userData.followingCount ?? 0}
                </span>
                <span className="text-slate-400">Following</span>
              </div>

              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-slate-800">
                  {userData.followersCount ?? 0}
                </span>
                <span className="text-slate-400">Followers</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center">
            Failed to load profile
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
