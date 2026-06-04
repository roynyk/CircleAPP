import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios"; // Kurir Axios
import ThreadCard from "@/components/common/ThreadCard"; // Komponen Kartu Thread
import { Button } from "@/components/ui/button"; // Tombol shadcn/ui
import { Textarea } from "@/components/ui/textarea"; // Textarea input shadcn/ui
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Avatar shadcn/ui
import { Thread } from "@/types/thread"; // Tipe data TypeScript

const Home = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State untuk menampung data threads
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk form posting baru
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // 1. Ambil data list thread dari Backend saat halaman dimuat
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get("/threads");
        // Sesuai format respons backend kita: response.data.data.threads
        setThreads(response.data.data.threads);
      } catch (err: any) {
        setError("Gagal memuat daftar postingan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  // 2. Fungsi untuk mengirim postingan baru (POST /threads)
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const response = await api.post("/threads", { content: newPostContent });
      const createdThread = response.data.data;

      // Mapping data baru agar formatnya sesuai dengan tipe data Thread di Frontend
      const formattedNewThread: Thread = {
        id: createdThread.id,
        content: createdThread.content,
        created_at: createdThread.createdAt,
        user: {
          id: user?.id || 0,
          username: user?.username || "",
          name: user?.fullName || "",
          profile_picture: user?.photoProfile || null,
        },
        likes: 0,
        reply: 0,
        isLiked: false,
      };

      // Taruh postingan baru di urutan paling atas feed
      setThreads([formattedNewThread, ...threads]);
      setNewPostContent("");
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim postingan.");
    } finally {
      setIsPosting(false);
    }
  };

  // 3. Fungsi interaktif tombol Like di Frontend (untuk demo)
  const handleLikeToggle = (threadId: number) => {
    setThreads(
      threads.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            isLiked: !t.isLiked,
            likes: t.isLiked ? t.likes - 1 : t.likes + 1,
          };
        }
        return t;
      }),
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Atas */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          {/* <div className="text-left">
            <h1 className="text-xl font-bold text-gray-800">
              CircleAPP Beranda
            </h1>
            {user && (
              <p className="text-xs text-gray-500">
                Masuk sebagai: <strong>{user.fullName}</strong> (@
                {user.username})
              </p>
            )}
          </div> */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="cursor-pointer"
          >
            Logout
          </Button>
        </div>

        {/* Input Form Posting Baru (Tampilan mirip Threads/Twitter) */}
        <div className="p-6 border-b border-gray-200 flex space-x-4">
          <Avatar className="h-10 w-10">
            {user?.photoProfile && <AvatarImage src={user.photoProfile} />}
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold uppercase">
              {user?.fullName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <form onSubmit={handlePostSubmit} className="flex-1 space-y-3">
            <Textarea
              placeholder="Apa yang sedang kamu pikirkan hari ini?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPosting || !newPostContent.trim()}
                className="cursor-pointer"
              >
                {isPosting ? "Memposting..." : "Post"}
              </Button>
            </div>
          </form>
        </div>

        {/* Daftar Feed Postingan */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <p className="p-6 text-center text-gray-500">
              Sedang memuat postingan...
            </p>
          ) : error ? (
            <p className="p-6 text-center text-red-500">{error}</p>
          ) : threads.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              Belum ada postingan saat ini. Jadilah yang pertama memposting!
            </p>
          ) : (
            threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onLikeToggle={handleLikeToggle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
