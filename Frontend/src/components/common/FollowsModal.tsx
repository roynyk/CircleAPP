import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { UserFollow } from "@/types/thread";
import { getAvatarUrl } from "@/lib/utils";

interface FollowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
}

export const FollowsModal: React.FC<FollowsModalProps> = ({
  isOpen,
  onClose,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    initialTab,
  );
  const [users, setUsers] = useState<UserFollow[]>([]);
  const [loading, setLoading] = useState(false);

  // Sinkronkan tab aktif saat modal pertama kali dibuka
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Fetch data followers / following dari API backend
  useEffect(() => {
    let active = true;
    const fetchFollowData = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        const response = await api.get("/users/follows", {
          params: { type: activeTab },
        });
        // Guard clause: Jika tab sudah berubah / modal ditutup, abaikan kelanjutannya
        if (!active) return;
        setUsers(response.data.data);
        setLoading(false);
      } catch (error) {
        if (!active) return;
        console.error("Gagal mengambil data follow:", error);
        setLoading(false);
      }
    };
    fetchFollowData();
    return () => {
      active = false; // Batalkan proses jika tab berpindah / modal ditutup
    };
  }, [isOpen, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg border-none text-left p-0 overflow-hidden flex flex-col h-[480px]">
        {/* Header Modal */}
        <DialogHeader className="p-4 border-b border-slate-100 flex-shrink-0">
          <DialogTitle className="text-sm font-bold text-slate-800">
            Daftar Koneksi
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100/80 text-center text-xs font-bold text-slate-500 flex-shrink-0">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 py-3 border-b-2 transition duration-200 cursor-pointer ${
              activeTab === "followers"
                ? "border-blue-500 text-blue-600 font-extrabold"
                : "border-transparent hover:text-slate-700"
            }`}
          >
            Pengikut (Followers)
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 border-b-2 transition duration-200 cursor-pointer ${
              activeTab === "following"
                ? "border-blue-500 text-blue-600 font-extrabold"
                : "border-transparent hover:text-slate-700"
            }`}
          >
            Mengikuti (Following)
          </button>
        </div>

        {/* List Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-pulse"
                >
                  <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-slate-200 rounded"></div>
                    <div className="h-2 w-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <p className="text-xs font-medium">
                {activeTab === "followers"
                  ? "Belum ada yang mengikuti kamu."
                  : "Kamu belum mengikuti siapa pun."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50/80 rounded-xl transition duration-150"
                >
                  <Avatar className="h-9 w-9 border border-slate-100">
                    <AvatarImage
                      src={getAvatarUrl(item.photoProfile)}
                      alt={item.fullName}
                    />
                    <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                      {item.fullName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-none">
                      {item.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">
                      @{item.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
