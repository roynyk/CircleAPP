import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

// 1. Validasi tipe data properti (props) yang dibutuhkan
interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onSubmit, isSubmitting }) => {
  // 2. State lokal untuk menampung isi teks komentar yang sedang diketik
  const [content, setContent] = useState("");

  // 3. Handler saat form di-submit (tombol kirim diklik atau enter)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Cegah submit jika teks kosong atau sedang dalam proses pengiriman
    if (!content.trim() || isSubmitting) return;

    // Jalankan fungsi kirim ke API yang dikirim dari halaman utama
    await onSubmit(content);

    // Kosongkan kembali textarea setelah balasan sukses terkirim
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex items-start space-x-3 bg-gray-50 p-4 rounded-xl"
    >
      {/* Textarea Input Balasan */}
      <Textarea
        placeholder="Tulis balasanmu..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white text-sm"
        rows={2}
      />

      {/* Tombol Kirim */}
      <Button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="h-10 w-10 rounded-xl flex items-center justify-center p-0 cursor-pointer"
      >
        <Send size={16} />
      </Button>
    </form>
  );
};

export default ReplyForm;
