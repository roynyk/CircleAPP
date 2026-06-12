import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import RightBar from "@/components/common/RightBar";
import ThreadCard from "@/components/common/ThreadCard";
import { ArrowLeft } from "lucide-react";
import ReplyForm from "@/components/common/ReplyForm";
import ReplyCard from "@/components/common/ReplyCard";
import { useThreadDetail } from "@/hooks/useThreadDetail"; // <-- Import hook baru

const DetailThread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Panggil semua state & fungsi langsung dari hook
  const {
    thread,
    replies,
    loading,
    error,
    isSubmitting,
    handleLikeToggle,
    handleReplySubmit,
  } = useThreadDetail(id);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex items-start space-x-6 min-w-0">
        <div className="flex-1 max-w-4xl w-full min-w-0 bg-white rounded-xl shadow-md p-6 text-left">
          {/* Tombol Kembali */}
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
              {/* Tampilkan Thread Utama */}
              <ThreadCard
                thread={thread}
                onLikeToggle={handleLikeToggle}
                isDetail={true}
              />

              {/* Form Balasan */}
              <ReplyForm
                onSubmit={handleReplySubmit}
                isSubmitting={isSubmitting}
              />

              {/* Daftar Balasan */}
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
