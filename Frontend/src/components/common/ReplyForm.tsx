import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Image, X } from "lucide-react";

// 1. Validasi tipe data properti (props) yang dibutuhkan
interface ReplyFormProps {
  onSubmit: (content: string, image: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onSubmit, isSubmitting }) => {
  // 2. State lokal untuk menampung isi teks komentar yang sedang diketik
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Hanya diperbolehkan mengunggah file gambar.");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // Membuat URL virtual sementara
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // 3. Handler saat form di-submit (tombol kirim diklik atau enter)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Cegah submit jika teks kosong atau sedang dalam proses pengiriman
    if (!content.trim() && selectedImage) return;

    // Jalankan fungsi kirim ke API yang dikirim dari halaman utama
    await onSubmit(content, selectedImage);

    // Kosongkan kembali textarea setelah balasan sukses terkirim
    setContent("");
    setSelectedImage(null);
    setImagePreview(null);
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

      {/* 🌟 TAMPILKAN PREVIEW GAMBAR (Jika ada gambar yang dipilih) */}
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden max-h-48 border border-gray-200 bg-gray-50 flex items-center justify-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 cursor-pointer transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 🌟 BARIS BAWAH: Tombol Tambah Gambar (Kiri) dan Tombol Kirim (Kanan) */}
      <div className="flex justify-between items-center pt-1">
        {/* Tombol Pilih Gambar */}
        <div>
          <label
            htmlFor="reply-image-input"
            className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 cursor-pointer p-1.5 hover:bg-blue-100/50 rounded-lg transition"
          >
            <Image size={18} />
            <span className="text-[11px] font-semibold">Tambah Gambar</span>
          </label>
          <input
            id="reply-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Tombol Kirim */}
        <Button
          type="submit"
          disabled={isSubmitting || (!content.trim() && !selectedImage)}
          className="h-10 w-10 rounded-xl flex items-center justify-center p-0 cursor-pointer"
        >
          {isSubmitting ? "Mengirim..." : <Send size={16} />}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
