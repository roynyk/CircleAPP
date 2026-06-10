import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { EditProfileModal } from "./EditProfileModal";

export const CardProfile: React.FC = () => {
  // jalankan hook untuk fetch profile secara otomatis
  const { loading } = useProfile();
  // Mengambil data user yang sedang login dari Redux
  const user = useSelector((state: RootState) => state.auth.user);

  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white text-left">
      {/* Banner Gradient */}
      <div className="h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative" />
      <div className="px-5 pb-5 relative">
        {/* Avatar Profil */}
        <div className="absolute -top-10 left-5">
          <Avatar className="h-16 w-16 border-4 border-white shadow-md">
            {user.photoProfile && (
              <AvatarImage
                src={
                  user.photoProfile.startsWith("http")
                    ? user.photoProfile
                    : `http://localhost:3000/uploads/${user.photoProfile}`
                }
                alt={user.username}
              />
            )}
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg uppercase">
              {user.fullName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* Tombol Edit Profile */}
        <div className="flex justify-end pt-3">
          <Button
            onClick={() => setIsEditOpen(true)} // <--- Pemicu buka modal
            size="sm"
            variant="outline"
            className="h-8 text-[11px] font-bold px-4 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full cursor-pointer transition duration-150"
          >
            Edit Profile
          </Button>
        </div>
        {/* Nama Lengkap & Username */}
        <div className="mt-3">
          <h2 className="font-bold text-slate-800 text-base leading-tight hover:underline cursor-pointer">
            <Link to="/profile">{user.fullName}</Link>
          </h2>
          <p className="text-xs text-slate-400">@{user.username}</p>
        </div>
        {/* Bio (Diambil dinamis dari Redux) */}
        <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[16px]">
          {loading ? (
            <span className="text-slate-300">Memuat bio...</span>
          ) : (
            user.bio || "Belum ada bio."
          )}
        </p>
        {/* Statistik Follower & Following (Diambil dinamis dari Redux) */}
        <div className="mt-4 flex items-center space-x-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-slate-800">
              {loading ? "-" : (user.followingCount ?? 0)}
            </span>
            <span className="text-slate-400">Following</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-slate-800">
              {loading ? "-" : (user.followersCount ?? 0)}
            </span>
            <span className="text-slate-400">Followers</span>
          </div>
        </div>
      </div>
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
};
