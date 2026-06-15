import React from "react";
import ThreadCard from "@/components/common/ThreadCard";
import { Thread } from "@/types/thread";

interface ProfileLikesProps {
  likedThreads: Thread[];
  toggleLike: (threadId: number) => void;
}

export const ProfileLikes: React.FC<ProfileLikesProps> = ({
  likedThreads,
  toggleLike,
}) => {
  return (
    <div className="p-4 columns-1 gap-4">
      {likedThreads.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <p className="text-gray-400 text-sm">
            You haven't liked any posts yet.
          </p>
        </div>
      ) : (
        likedThreads.map((thread) => (
          <div key={thread.id} className="break-inside-avoid mb-4">
            <ThreadCard
              thread={thread}
              onLikeToggle={toggleLike}
              isDetail={false}
              isProfile={true}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default ProfileLikes;
