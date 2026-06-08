import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Thread } from "@/types/thread";
import Header from "@/components/common/Header";
import RightBar from "@/components/common/RightBar";
import ThreadCard from "@/components/common/ThreadCard"; // <--- Gunakan ThreadCard bawaan
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ReplyForm from "@/components/common/ReplyForm";
import ReplyCard from "@/components/common/ReplyCard";

interface ReplyData {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    name: string;
    profile_picture: string | null;
    avatar: string | null;
  };
  created_at: string;
}

const DetailThread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchThreadDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/threads/${id}`);
        setThread(response.data.data);
        setReplies(response.data.data.replies || []);
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.message || "Gagal memuat detail postingan.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchThreadDetail();
    }
  }, [id]);

  const handleLikeToggle = async () => {
    if (!thread) return;
    const originalThread = { ...thread };

    setThread({
      ...thread,
      likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1,
      isLiked: !thread.isLiked,
    });

    try {
      await api.post(`/threads/${thread.id}/like`);
    } catch (err) {
      console.error(err);
      setThread(originalThread);
    }
  };

  const handleReplySubmit = async (content: string) => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/threads/${id}/reply`, {
        content,
      });

      const newReply = response.data.data;
      setReplies((prevReplies) => [...prevReplies, newReply]);

      if (thread) {
        setThread({
          ...thread,
          reply: thread.reply + 1,
        });
      }
      toast.success("Balasan berhasil diposting");
    } catch (err) {
      console.error("Gagal mengirim balasan:", err);
      toast.error("Gagal mengirim balasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 flex items-start space-x-6">
        {/* Kolom Kiri: Detail Thread & Replies */}
        <div className="flex-1 max-w-2xl bg-white rounded-xl shadow-md p-6 text-left">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-500 hover:text-slate-800 mb-6 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold">Kembali ke Feed</span>
          </button>

          {loading ? (
            <p className="text-center text-gray-500 py-10 text-sm">
              Memuat detail postingan...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 py-10 text-sm">{error}</p>
          ) : !thread ? (
            <p className="text-center text-gray-500 py-10 text-sm">
              Thread tidak ditemukan.
            </p>
          ) : (
            <div>
              {/* 1. Re-use ThreadCard bawaan dengan properti isDetail */}
              <ThreadCard
                thread={thread}
                onLikeToggle={handleLikeToggle}
                isDetail={true}
              />

              {/* 2. Box Form Balasan */}
              <ReplyForm
                onSubmit={handleReplySubmit}
                isSubmitting={isSubmitting}
              />

              {/* 3. List Balasan */}
              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-l-4 border-blue-500 pl-2">
                  Balasan ({replies.length})
                </h3>

                {replies.length === 0 ? (
                  <p className="text-gray-400 text-xs py-6 text-center">
                    Belum ada balasan pada postingan ini.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {replies.map((reply) => (
                      <ReplyCard key={reply.id} reply={reply} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <RightBar />
      </div>
    </div>
  );
};

export default DetailThread;
