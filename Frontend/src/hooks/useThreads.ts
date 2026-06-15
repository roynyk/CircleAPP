import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setThreads,
  addThread,
  toggleLikeRedux,
  incrementReplyCount,
} from "@/redux/threadSlice";
import api from "@/lib/axios";
import { Thread } from "@/types/thread";
import { toast } from "sonner";

export const useThreads = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Seluruh State Data dipindahkan ke sini
  // Mengambil data threads dari Redux (Retrieve data like from Redux)
  const threads = useSelector((state: RootState) => state.threads.threads);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const response = await api.get("/threads");
        // Sesuai format respons backend response.data.data.threads
        dispatch(setThreads(response.data.data.threads));
      } catch (err) {
        setError("Gagal memuat daftar postingan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  // Pendengar Real-Time WebSocket & Notifikasi Toast
  useEffect(() => {
    // Hubungkan browser ke port server WebSocket Backend (port 3000)
    const ws = new WebSocket("ws://localhost:3000");

    // Dengarkan pesan/siaran yang masuk dari backend
    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      // Jika ada event "NEW_THREAD" (siaran postingan baru)
      if (parsedData.event === "NEW_THREAD") {
        const newThread = parsedData.data;

        // HANYA UNTUK USER LAIN (Bukan pembuat postingan)
        if (newThread.user.id !== user?.id) {
          // Munculkan notifikasi toast melayang menggunakan Sonner
          toast.info("Thread Baru!", {
            classNames: { toast: "bg-black-600", title: "text-white-400" },
            description: `${newThread.user.name} (@${newThread.user.username}) memposting thread baru.`,
            duration: 5000,
          });
          dispatch(addThread(newThread));
        }
      } else if (parsedData.event === "NEW_REPLY") {
        const newReply = parsedData.data;
        dispatch(incrementReplyCount(newReply.threadId));
      }
    };

    return () => {
      ws.close();
    };
  }, [user?.id]);

  // Membuat Thread Baru (FormData)
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
          photoProfile: user?.photoProfile || null,
        },
        likes: 0,
        reply: 0,
        isLiked: false,
      };
      // Taruh postingan baru di urutan paling atas feed
      dispatch(setThreads([formattedNewThread, ...threads]));
      return true;
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim postingan.");
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  //Toggle Like (Optimistic Update)
  const toggleLike = async (threadId: number) => {
    //Lakukan Optimistic Update (Ubah UI secara instan)
    dispatch(toggleLikeRedux(threadId));

    try {
      //Kirim request ke backend untuk menyimpan data ke database
      await api.post(`/threads/${threadId}/like`);
    } catch (err) {
      console.error("Gagal menyinkronkan like ke server:", err);
      //Rollback tampilan jika API gagal
      dispatch(toggleLikeRedux(threadId));
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
