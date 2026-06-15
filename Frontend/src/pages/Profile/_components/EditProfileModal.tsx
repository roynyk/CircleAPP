import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setProfile } from "@/redux/authSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";
import api from "@/lib/axios";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  // State Form
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Set ulang data form saat modal dibuka
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName);
      setBio(user.bio || "");
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [isOpen, user]);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("bio", bio);
      if (selectedFile) {
        formData.append("photoProfile", selectedFile);
      }

      // Kirim request update ke backend
      const response = await api.patch("/users/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update data di Redux & LocalStorage
      dispatch(setProfile(response.data.data));

      toast.success("Profile updated successfully!");
      onClose(); // Tutup modal setelah sukses
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg border-none text-left">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Update your full name, bio, or profile picture below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2 w-full min-w-0">
          {/* Bagian Uploader Foto Profil */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-slate-200">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="Preview Avatar" />
                ) : (
                  user.photoProfile && (
                    <AvatarImage
                      src={getImageUrl(user.photoProfile)}
                      alt={user.username}
                    />
                  )
                )}
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold uppercase">
                  {fullName[0] || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Overlay Tombol Kamera */}
              <label
                htmlFor="modal-photo-upload"
                className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition duration-200"
              >
                <Camera className="text-white" size={20} />
              </label>
              <input
                id="modal-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                Profile Picture
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click avatar to change image.
              </p>
            </div>
          </div>

          {/* Input Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Full Name
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 h-9 bg-white text-xs"
            />
          </div>

          {/* Input Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio..."
              className="break-word resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white text-xs"
              rows={3}
            />
          </div>

          {/* Tombol Simpan */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 text-xs rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 text-xs rounded-lg cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
