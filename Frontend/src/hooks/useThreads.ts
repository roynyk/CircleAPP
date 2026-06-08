import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/axios";
import { Thread } from "@/types/thread";
import { toast } from "sonner";

export const useThreads = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Seluruh State Data dipindahkan ke sini
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Aksi 1: Ambil Thread Awal dari Backend

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
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

  // Aksi 2: Pendengar Real-Time WebSocket & Notifikasi Toast
  useEffect(() => {
    // 1. Hubungkan browser ke port server WebSocket Backend (port 3000)
    const ws = new WebSocket("ws://localhost:3000");

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
            classNames: { toast: "bg-black-600", title: "text-white-400" },
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
    // 3. Bersihkan koneksi saat halaman ditutup atau berpindah agar tidak terjadi kebocoran memori (memory leak)
    return () => {
      ws.close();
    };
  }, [user?.id]);

  // Aksi 3: Membuat Thread Baru (FormData)
  const createThread = async (content: string, image: File | null) => {
    setIsPosting(true);
    try {
      // kenapa pake FormData?? karena kita mau menghandle request untuk file juga, jadi sebelumnya kan datanya hanya bentuk JSON/teks aja, nah JSON tuh gabisa menampung file, jadi data yang sebelumnya JSON kita masukkan ke FormData agar filenya juga bisa ikut di kirim ke backend
      const formData = new FormData();
      formData.append("content", content);

      // untuk penggunaan 'image' itu harus sama dengan fieldname nya yang ada di backend, karena aku menggunakan upload.single("image") maka harus di append dengan fieldname yang sama
      if (image) {
        formData.append("image", image);
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
      return true;
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim postingan.");
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  // Aksi 4: Toggle Like (Optimistic Update)
  const toggleLike = async (threadId: number) => {
    // 1. Simpan salinan data threads sebelumnya untuk cadangan rollback jika gagal
    const originalThreads = [...threads];

    // 2. Lakukan Optimistic Update (Ubah UI secara instan)
    setThreads(
      threads.map((thread) => {
        if (thread.id === threadId) {
          const isCurrentlyLiked = thread.isLiked;
          return {
            ...thread,
            likes: isCurrentlyLiked ? thread.likes - 1 : thread.likes + 1,
            isLiked: !isCurrentlyLiked,
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

  // Kembalikan data dan fungsi yang dibutuhkan oleh komponen visual (Home.tsx)
  return {
    threads,
    setThreads,
    loading,
    error,
    isPosting,
    createThread,
    toggleLike,
  };
};
