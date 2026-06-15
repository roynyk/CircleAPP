import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { getImageUrl } from "@/lib/utils";
import { updateThread } from "@/redux/threadSlice";
import { Thread } from "@/types/thread";
import { Image, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface EditThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Thread;
}

export const EditThreadModal: React.FC<EditThreadModalProps> = ({
  isOpen,
  onClose,
  thread,
}) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null | undefined>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(thread.content);
      setSelectedFile(null);
      setImagePreview(thread.image ? getImageUrl(thread.image) : null);
    }
  }, [isOpen, thread]);

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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) {
      toast.error("content cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (!imagePreview) {
        formData.append("removeImage", "true");
      }

      const response = await api.patch(`/threads/${thread.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(updateThread(response.data.data));
      toast.success("Post updated successfully!");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg border-none text-left">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Edit Post
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Update your thread text or replace the image.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2 w-full min-w-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is on your mind?"
            className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
            rows={4}
          />
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden max-h-48 border border-gray-200 bg-gray-50 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Attachment preview"
                className="max-h-48 object-contain w-full"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 cursor-pointer transition duration-150"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div>
              <label
                htmlFor="edit-image-input"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer p-2 hover:bg-blue-50/50 rounded-lg transition"
              >
                <Image size={18} />
                <span className="text-xs font-semibold">Change Image</span>
              </label>
              <input
                id="edit-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="flex space-x-2">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
