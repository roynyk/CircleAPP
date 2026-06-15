import React, { useState } from "react";
import { useThreads } from "@/hooks/useThreads";
import ThreadCard from "@/components/common/ThreadCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RightBar from "@/components/common/RightBar";
import { Image, X } from "lucide-react";
import Header from "@/components/common/Header";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/utils";

const Home = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { threads, loading, error, isPosting, createThread, toggleLike } =
    useThreads();

  // State untuk form posting baru
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handler ketika user memilih file dari komputernya
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file agar hanya gambar
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
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

  // Fungsi untuk mengirim postingan baru (POST /threads)
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // mencegah user mengisi postingan kosong dan mencegah user memosting spasi saja, karena pada dasarnya newPostContent.trim() itu nilainya false karena kosong, jadi tambahkan ! biar kondisinya true
    if (!newPostContent.trim() && !selectedImage) return;

    const success = await createThread(newPostContent, selectedImage);
    if (success) {
      setNewPostContent("");
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="max-w-[1375px] w-full mx-auto px-4 py-6 flex items-start space-x-6 min-w-0">
        <div className="flex-1 max-w-5xl w-full min-w-0 text-left">
          <div className="p-6 border-b border-gray-200 flex space-x-4">
            <Avatar className="h-10 w-10">
              {user?.photoProfile && (
                <AvatarImage src={getAvatarUrl(user.photoProfile)} />
              )}
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold uppercase">
                {user?.fullName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <form
              onSubmit={handlePostSubmit}
              className="flex-1 min-w-0 w-full space-y-3"
            >
              <Textarea
                placeholder="What is on your mind today?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                rows={3}
              />

              {imagePreview && (
                <div className="relative mt-2 rounded-xl overflow-hidden max-h-60 border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
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
                <div>
                  <label
                    htmlFor="image-input"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer p-2 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Image size={20} />
                    <span className="text-xs font-semibold">Add Image</span>
                  </label>
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
                  onClick={() => toast.success("Post created successfully")}
                  disabled={
                    isPosting || (!newPostContent.trim() && !selectedImage)
                  }
                  className="cursor-pointer"
                >
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </div>
          {/* Daftar Feed Postingan */}

          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading posts...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-500">{error}</p>
          ) : threads.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              No posts at the moment. Be the first to post!
            </p>
          ) : (
            <div className="columns-1 sm:columns-2 gap-4">
              {threads.map((thread) => (
                <div key={thread.id} className="break-inside-avoid mb-4">
                  <ThreadCard
                    thread={thread}
                    onLikeToggle={toggleLike}
                    isDetail={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <RightBar />
      </div>
    </div>
  );
};

export default Home;
