import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Header from "@/components/common/Header";
import RightBar from "@/components/common/RightBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThreads } from "@/hooks/useThreads";
import { EditProfileModal } from "./_components/EditProfileModal";
import { FollowsModal } from "./_components/FollowsModal";
import { getAvatarUrl } from "@/lib/utils";
import { ProfileMedia } from "@/pages/Profile/_components/ProfileMedia";
import { ProfileLikes } from "@/pages/Profile/_components/ProfileLikes";
import { ProfilePosts } from "@/pages/Profile/_components/ProfilePosts";

const Profile: React.FC = () => {
  // Mengambil data user yang sedang login dari Redux (Retrieve data profile from Redux)
  const user = useSelector((state: RootState) => state.auth.user);

  // Mengambil data threads global dari Redux
  const threads = useSelector((state: RootState) => state.threads.threads);
  const { toggleLike } = useThreads();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowsOpen, setIsFollowsOpen] = useState(false);
  const [followsTab, setFollowsTab] = useState<"followers" | "following">(
    "followers",
  );
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">(
    "posts",
  );
  if (!user) return null;

  const likedThreads = threads.filter((thread) => thread.isLiked);
  const myThreads = threads.filter((thread) => thread.user.id === user.id);
  const mediaThreads = myThreads.filter((thread) => thread.image);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex items-start space-x-6 min-w-0">
        {/* Kolom Kiri: Informasi Profil & Postingan User */}
        <div className="flex-1 max-w-4xl w-full min-w-0 bg-white rounded-xl shadow-md overflow-hidden text-left">
          {/* Header Atas (Tombol Kembali) */}
          <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-gray-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-slate-800 text-base leading-tight">
                {user.fullName}
              </h2>
              <p className="text-xs text-gray-400">
                {myThreads.length} Postingan
              </p>
            </div>
          </div>

          {/* Banner Profil (Gradient Premium) */}
          <div className="h-44 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative" />

          {/* Konten Utama Profil */}
          <div className="px-6 pb-6 relative">
            {/* Foto Profil Besar Overlapping */}
            <div className="absolute -top-16 left-6">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                {user.photoProfile && (
                  <AvatarImage
                    src={getAvatarUrl(user.photoProfile)}
                    alt={user.username}
                  />
                )}
                <AvatarFallback className="bg-blue-100 text-blue-600 text-4xl font-bold uppercase">
                  {user.fullName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Tombol Edit Profile (Masih statik/tombol biasa dulu) */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsEditOpen(true)}
                variant="outline"
                className="h-9 font-bold px-5 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-full cursor-pointer text-xs"
              >
                Edit Profile
              </Button>
            </div>

            {/* Nama & Username */}
            <div className="mt-4">
              <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
                {user.fullName}
              </h1>
              <p className="text-sm text-slate-400">@{user.username}</p>
            </div>

            {/* Bio User (Diambil langsung dari Redux) */}
            <p className="mt-3.5 text-sm text-slate-600 leading-relaxed break-words">
              {user.bio || "Belum ada bio."}
            </p>

            {/* Meta Info Tambahan */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>Indonesia</span>
              </div>
              <div className="flex items-center space-x-1">
                <LinkIcon size={14} />
                <a href="#" className="text-blue-500 hover:underline">
                  github.com/{user.username}
                </a>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>Bergabung Juni 2026</span>
              </div>
            </div>

            {/* Statistik Followers / Following */}
            <div className="mt-4 flex items-center space-x-5 pt-4 border-t border-slate-100 text-sm">
              {/* 1. Tambahkan onClick untuk Mengikuti (Following) */}
              <div
                onClick={() => {
                  setFollowsTab("following");
                  setIsFollowsOpen(true);
                }}
                className="flex items-center space-x-1.5 cursor-pointer hover:underline"
              >
                <span className="font-bold text-slate-800">
                  {user.followingCount ?? 0}
                </span>
                <span className="text-slate-400 text-xs">Mengikuti</span>
              </div>

              {/* 2. Tambahkan onClick untuk Pengikut (Followers) */}
              <div
                onClick={() => {
                  setFollowsTab("followers");
                  setIsFollowsOpen(true);
                }}
                className="flex items-center space-x-1.5 cursor-pointer hover:underline"
              >
                <span className="font-bold text-slate-800">
                  {user.followersCount ?? 0}
                </span>
                <span className="text-slate-400 text-xs">Pengikut</span>
              </div>
            </div>
          </div>

          {/* Menu Tab Profil */}
          <div className="border-b border-gray-100 flex text-center text-sm font-semibold text-gray-500">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 border-b-2 font-bold transition duration-200 cursor-pointer ${
                activeTab === "posts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-slate-700"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 py-3 border-b-2 font-bold transition duration-200 cursor-pointer ${
                activeTab === "media"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-slate-700"
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab("likes")}
              className={`flex-1 py-3 border-b-2 font-bold transition duration-200 cursor-pointer ${
                activeTab === "likes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-slate-700"
              }`}
            >
              Likes
            </button>
          </div>

          {/* Daftar Postingan Personal Milik User */}
          {activeTab === "posts" && (
            <ProfilePosts postThreads={myThreads} toggleLike={toggleLike} />
          )}
          {activeTab === "media" && (
            <ProfileMedia mediaThreads={mediaThreads} />
          )}
          {activeTab === "likes" && (
            <ProfileLikes likedThreads={likedThreads} toggleLike={toggleLike} />
          )}
        </div>

        {/* Kolom Kanan */}
        <RightBar />
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
        {isFollowsOpen && (
          <FollowsModal
            isOpen={isFollowsOpen}
            onClose={() => setIsFollowsOpen(false)}
            initialTab={followsTab}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
