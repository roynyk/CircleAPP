import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  toggleLikeRedux,
  addThread,
  incrementReplyCount,
} from "@/redux/threadSlice";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ReplyData } from "@/types/thread";

export const useThreadDetail = (threadIdString: string | undefined) => {
  const dispatch = useDispatch();
  const threadId = threadIdString ? parseInt(threadIdString, 10) : NaN;

  // 1. Ambil data profil kita (untuk WebSocket check)
  const user = useSelector((state: RootState) => state.auth.user);

  // 2. AMBIL DATA THREAD DARI REDUX (Ini menyelesaikan masalah Redux kamu!)
  const threads = useSelector((state: RootState) => state.threads.threads);
  const thread = threads.find((t) => t.id === threadId) || null;

  // State lokal khusus untuk list Balasan & status loading
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A. Fetch data detail thread & balasan dari API
  useEffect(() => {
    const fetchThreadDetail = async () => {
      if (isNaN(threadId)) return;
      try {
        setLoading(true);
        setError("");

        // Fetch balasan (replies)
        const repliesResponse = await api.get(`/threads/${threadId}/replies`);
        setReplies(repliesResponse.data.data || []);

        // Jika thread belum ada di Redux (misal karena refresh halaman), fetch dari API & simpan ke Redux
        if (!thread) {
          const response = await api.get(`/threads/${threadId}`);
          dispatch(addThread(response.data.data));
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.message || "Gagal memuat detail postingan.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchThreadDetail();
  }, [threadId, dispatch]);

  // B. Koneksi WebSocket untuk real-time reply
  useEffect(() => {
    if (isNaN(threadId)) return;
    const ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.event === "NEW_REPLY") {
        const newReply = parsedData.data;

        if (newReply.threadId === threadId && newReply.user.id !== user?.id) {
          setReplies((prevReplies) => {
            if (prevReplies.some((r) => r.id === newReply.id))
              return prevReplies;
            return [newReply, ...prevReplies];
          });

          toast.info("Balasan Baru!", {
            description: `${newReply.user.name} baru saja membalas postingan ini.`,
          });
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [threadId, user?.id, dispatch]);

  // C. Aksi Toggle Like
  const handleLikeToggle = async () => {
    if (isNaN(threadId)) return;

    // Update instan di Redux
    dispatch(toggleLikeRedux(threadId));

    try {
      await api.post(`/threads/${threadId}/like`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyukai postingan");
    }
  };

  // D. Aksi Submit Balasan Baru
  const handleReplySubmit = async (content: string, image: File | null) => {
    if (isNaN(threadId)) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await api.post(`/threads/${threadId}/reply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newReply = response.data.data;

      const formattedNewReply: ReplyData = {
        ...newReply,
        likes: 0,
        reply: 0,
      };

      setReplies((prevReplies) => [formattedNewReply, ...prevReplies]);
      dispatch(incrementReplyCount(threadId)); // Update count reply di Redux
      toast.success("Balasan berhasil diposting");
    } catch (err) {
      console.error("Gagal mengirim balasan:", err);
      toast.error("Gagal mengirim balasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    thread,
    replies,
    loading,
    error,
    isSubmitting,
    handleLikeToggle,
    handleReplySubmit,
  };
};
