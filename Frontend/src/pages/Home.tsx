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
import RightBar from "@/components/common/RightBar";
import { LogOut, Circle, Image, X } from "lucide-react";
import { toast } from "sonner";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // 1. Ambil data list thread dari Backend saat halaman dimuat
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get("/threads");
        // Sesuai format respons backend response.data.data.threads
        setThreads(response.data.data.threads);
      } catch (err) {
        setError("Gagal memuat daftar postingan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  useEffect(() => {
    // 1. Hubungkan browser ke port server WebSocket Backend (port 3000)
    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => {
      console.log("🔌 Terkoneksi ke WebSocket Server");
    };
    // 2. Dengarkan pesan/siaran yang masuk dari backend
    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      // Jika ada event "NEW_THREAD" (siaran postingan baru)
      if (parsedData.event === "NEW_THREAD") {
        const newThread = parsedData.data;

        // HANYA UNTUK USER LAIN (Bukan pembuat postingan)
        if (newThread.user.id !== user?.id) {
          // 1. Munculkan notifikasi toast melayang menggunakan Sonner
          toast.info("Thread Baru!", {
            description: `${newThread.user.name} (@${newThread.user.username}) memposting thread baru.`,
            duration: 5000, // Tayang selama 5 detik
          });
          // 2. Masukkan thread baru tersebut ke feed agar langsung tampil di layar
          setThreads((prevThreads) => {
            const isExist = prevThreads.some((t) => t.id === newThread.id);
            if (isExist) return prevThreads;
            return [newThread, ...prevThreads];
          });
        }
      }
    };
    ws.onclose = () => {
      console.log("❌ Terputus dari WebSocket Server");
    };
    // 3. Bersihkan koneksi saat halaman ditutup atau berpindah agar tidak terjadi kebocoran memori (memory leak)
    return () => {
      ws.close();
    };
  }, []);

  // Handler ketika user memilih file dari komputernya
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file agar hanya gambar
      if (!file.type.startsWith("image/")) {
        alert("Hanya diperbolehkan mengunggah file gambar.");
        return;
      }
      setSelectedImage(file);
      // URL.createObjectURL(file) adalah fungsi bawaan browser (Web API) yang digunakan untuk membuat alamat URL sementara (virtual) yang mengarah langsung ke file yang ada di komputer kita.
      setImagePreview(URL.createObjectURL(file));
    }
  };
  // Handler jika user membatalkan pilihan gambar sebelum memposting
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // 2. Fungsi untuk mengirim postingan baru (POST /threads)
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // mencegah user mengisi postingan kosong dan mencegah user memosting spasi saja
    if (!newPostContent.trim() || !selectedImage) return;

    setIsPosting(true);
    try {
      // kenapa pake FormData?? karena kita mau menghandle request untuk file juga, jadi sebelumnya kan datanya hanya bentuk JSON/teks aja, nah JSON tuh gabisa menampung file, jadi data yang sebelumnya JSON kita masukkan ke FormData agar filenya juga bisa ikut di kirim ke backend
      const formData = new FormData();
      formData.append("content", newPostContent);

      // untuk penggunaan 'image' itu harus sama dengan fieldname nya yang ada di backend, karena aku menggunakan upload.single("image") maka harus di append dengan fieldname yang sama
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // 2. Kirim request dengan header multipart/form-data
      const response = await api.post("/threads/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // di consume data yang dari backend karena kan proses response di atas itu pake async await, jadi harus nunggu selesai dulu baru ini di eksekusi
      const createdThread = response.data.data;

      // Mapping data baru agar formatnya sesuai dengan tipe data Thread di Frontend
      const formattedNewThread: Thread = {
        id: createdThread.id,
        content: createdThread.content,
        image: createdThread.image,
        created_at: createdThread.created_at,
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
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim postingan.");
    } finally {
      setIsPosting(false);
    }
  };

  // 3. Fungsi interaktif tombol Like di Frontend
  const handleLikeToggle = async (threadId: number) => {
    // 1. Simpan salinan data threads sebelumnya untuk cadangan rollback jika gagal
    const originalThreads = [...threads];
    // 2. Lakukan Optimistic Update (Ubah UI secara instan)
    setThreads(
      threads.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1,
            isLiked: !thread.isLiked,
          };
        }
        return thread;
      }),
    );
    try {
      // 3. Kirim request ke backend untuk menyimpan data ke database
      await api.post(`/threads/${threadId}/like`);
    } catch (err) {
      console.error("Gagal menyinkronkan like ke server:", err);
      // 4. Rollback tampilan jika API gagal
      setThreads(originalThreads);
      alert("Gagal memperbarui status like.");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      {/* Pembungkus utama untuk menyandingkan Feed (Kiri) dan RightBar (Kanan) */}
      <div className="max-w-5xl mx-auto px-4 flex items-start space-x-6">
        {/* Kolom Kiri: Feed & Form Input (Tetap Max-Width 2xl dan Putih) */}
        <div className="flex-1 max-w-2xl bg-white rounded-xl shadow-md overflow-hidden text-left">
          {/* Header Atas */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-800">
                CircleAPP Beranda
              </h1>
              {user && (
                <p className="text-xs text-gray-500">
                  Masuk sebagai: <strong>{user.fullName}</strong> (@
                  {user.username})
                </p>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="cursor-pointer"
            >
              Logout
            </Button>
          </div>
          {/* Form Input Postingan Baru */}
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
              {/* TAMPILAN PREVIEW GAMBAR (Jika gambar dipilih) */}
              {imagePreview && (
                <div className="relative mt-2 rounded-xl overflow-hidden max-h-60 border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview unggahan"
                    className="max-h-60 object-contain w-full"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 cursor-pointer transition duration-150"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                {/* TOMBOL ICON UNTUK MEMILIH GAMBAR */}
                <div>
                  <label
                    htmlFor="image-input"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer p-2 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Image size={20} />
                    <span className="text-xs font-semibold">
                      Tambahkan Gambar
                    </span>
                  </label>
                  {/* Input asli disembunyikan menggunakan tailwind class "hidden" */}
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    isPosting || (!newPostContent.trim() && !selectedImage)
                  }
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
        <RightBar />
      </div>
    </div>
  );
};

export default Home;
