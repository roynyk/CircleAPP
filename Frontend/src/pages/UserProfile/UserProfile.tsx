import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Header from "@/components/common/Header";
import RightBar from "@/components/common/RightBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, LinkIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useThreads } from "@/hooks/useThreads";
import { getImageUrl } from "@/lib/utils";
import { ProfileMedia } from "@/pages/Profile/_components/ProfileMedia";
import { ProfilePosts } from "@/pages/Profile/_components/ProfilePosts";
import api from "@/lib/axios";
import { toast } from "sonner";
import { User } from "@/types/auth";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleLike } = useThreads();

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // State untuk data profil user lain & postingan mereka
  const [user, setUser] = useState<User | null>(null);
  const [userThreads, setUserThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"posts" | "media">("posts");

  // Arahkan ke /profile jika ID di URL ternyata adalah ID kita sendiri
  useEffect(() => {
    if (id && loggedInUser && parseInt(id) === loggedInUser.id) {
      navigate("/profile");
    }
  }, [id, loggedInUser, navigate]);

  // Fetch profil dan postingan user target
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const userRes = await api.get(`/users/${id}`);
        setUser(userRes.data.data);

        const threadsRes = await api.get(`/users/user/${id}`);
        setUserThreads(threadsRes.data.data);
      } catch (err: any) {
        console.error(err);
        toast.error("Gagal memuat profil pengguna.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!user) return;
    try {
      if (user.isFollowed) {
        await api.delete(`/users/unfollow/${user.id}`);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowed: false,
                followersCount: Math.max(0, (prev.followersCount ?? 0) - 1),
              }
            : null,
        );
        toast.success(`Batal mengikuti @${user.username}`);
      } else {
        await api.post(`/users/follow/${user.id}`);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowed: true,
                followersCount: (prev.followersCount ?? 0) + 1,
              }
            : null,
        );
        toast.success(`Mengikuti @${user.username}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah status mengikuti");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-semibold text-sm">
            Memuat profil...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-semibold text-sm">
            Pengguna tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  const mediaThreads = userThreads.filter((thread) => thread.image);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex items-start space-x-6 min-w-0 pb-20 md:pb-6">
        <div className="flex-1 max-w-4xl w-full min-w-0 bg-white rounded-xl shadow-md overflow-hidden text-left">
          {/* Header */}
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
                {userThreads.length} Postingan
              </p>
            </div>
          </div>

          {/* Banner */}
          <div className="h-44 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative" />

          {/* Konten */}
          <div className="px-6 pb-6 relative">
            <div className="absolute -top-16 left-6">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                {user.photoProfile && (
                  <AvatarImage
                    src={getImageUrl(user.photoProfile)}
                    alt={user.username}
                  />
                )}
                <AvatarFallback className="bg-blue-100 text-blue-600 text-4xl font-bold uppercase">
                  {user.fullName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Tombol Follow / Following */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleFollowToggle}
                variant={user.isFollowed ? "outline" : "default"}
                className={`h-9 font-bold px-6 rounded-full cursor-pointer text-xs ${
                  user.isFollowed
                    ? "text-slate-700 border-slate-200 hover:bg-slate-50"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {user.isFollowed ? "Following" : "Follow"}
              </Button>
            </div>

            <div className="mt-4">
              <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
                {user.fullName}
              </h1>
              <p className="text-sm text-slate-400">@{user.username}</p>
            </div>

            <p className="mt-3.5 text-sm text-slate-600 leading-relaxed break-words">
              {user.bio || "Belum ada bio."}
            </p>

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

            <div className="mt-4 flex items-center space-x-5 pt-4 border-t border-slate-100 text-sm">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-800">
                  {user.followingCount ?? 0}
                </span>
                <span className="text-slate-400 text-xs">Mengikuti</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-800">
                  {user.followersCount ?? 0}
                </span>
                <span className="text-slate-400 text-xs">Pengikut</span>
              </div>
            </div>
          </div>

          {/* Tab Menu (Tanpa Likes) */}
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
          </div>

          {/* Posts list (isProfile set ke false agar tombol edit/delete thread tidak muncul) */}
          {activeTab === "posts" && (
            <ProfilePosts
              postThreads={userThreads}
              toggleLike={toggleLike}
              isProfile={false}
            />
          )}
          {activeTab === "media" && (
            <ProfileMedia mediaThreads={mediaThreads} />
          )}
        </div>
        <RightBar />
      </div>
    </div>
  );
};

export default UserProfile;
