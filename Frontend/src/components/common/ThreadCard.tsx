import React from "react";
import { ThreadCardProps } from "@/types/thread";
import { Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";

// React.FC itu singkatan dari React Functional Component Ini adalah sebuah Tipe Data Bawaan dari TypeScript yang khusus digunakan untuk memberi tahu editor bahwa fungsi/variabel yang sedang kita buat ini adalah sebuah Komponen React (bukan fungsi javascript biasa).
const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  onLikeToggle,
  isDetail = false,
}) => {
  //Mengubah tanggal yang amberadul di database menjadi Format tanggal postingan (misal: 4 Jun 2026)
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Content card body
  const CardBody = (
    <>
      {/* Header Kartu (Nama, Username, Tanggal) */}
      <div className="flex items-center space-x-2">
        <span className="font-bold text-gray-900 text-sm hover:underline">
          {thread.user.name}
        </span>
        <span className="text-xs text-gray-500">@{thread.user.username}</span>
        <span className="text-gray-300 text-xs">•</span>
        <span className="text-xs text-gray-500">
          {formatDate(thread.created_at)}
        </span>
      </div>
      {/* Isi Tulisan Postingan */}
      <p className="mt-1.5 text-sm text-gray-800 whitespace-pre-line leading-relaxed break-words">
        {thread.content}
      </p>

      {/* Gambar Postingan (Jika ada) */}
      {thread.image && (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 max-h-80 bg-gray-50 flex items-center justify-center w-full max-w-full">
          <img
            src={`http://localhost:3000/uploads/${thread.image}`}
            alt="Thread attachment"
            className="max-h-80 w-full object-contain"
          />
        </div>
      )}
    </>
  );
  return (
    <Card className="w-full bg-white border border-gray-100/80 rounded-2xl shadow-sm hover:shadow-md transition duration-300 text-left">
      <CardContent className="p-4 flex space-x-3">
        {/* Avatar Profil */}
        <Avatar className="h-9 w-9 flex-shrink-0">
          {thread.user.profile_picture && (
            <AvatarImage
              src={
                thread.user.profile_picture.startsWith("http")
                  ? thread.user.profile_picture
                  : `http://localhost:3000/uploads/${thread.user.profile_picture}`
              }
              alt={thread.user.username}
            />
          )}
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold uppercase">
            {thread.user.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {/* KONDISI: Jika halaman detail, tampilkan isi biasa. Jika feed, bungkus dengan <Link> */}
          {isDetail ? (
            <div>{CardBody}</div>
          ) : (
            <Link
              to={`/thread/${thread.id}`}
              className="block hover:no-underline"
            >
              {CardBody}
            </Link>
          )}
          {/* Tombol Aksi (Di luar Link) */}
          <div className="mt-3 flex items-center space-x-6 text-gray-500">
            <button
              onClick={() => onLikeToggle && onLikeToggle(thread.id)}
              className="flex items-center space-x-1.5 text-xs hover:text-red-500 transition cursor-pointer"
            >
              {thread.isLiked ? (
                <Heart
                  size={16}
                  className="fill-red-500 text-red-500 animate-pulse"
                />
              ) : (
                <Heart size={16} />
              )}
              <span>{thread.likes}</span>
            </button>
            {isDetail ? (
              <div>
                <button className="flex items-center space-x-1.5 text-xs hover:text-blue-500 transition cursor-pointer">
                  <MessageCircle size={16} />
                  <span>{thread.reply}</span>
                </button>
              </div>
            ) : (
              <Link to={`/thread/${thread.id}`}>
                <button className="flex items-center space-x-1.5 text-xs hover:text-blue-500 transition cursor-pointer">
                  <MessageCircle size={16} />
                  <span>{thread.reply}</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreadCard;
