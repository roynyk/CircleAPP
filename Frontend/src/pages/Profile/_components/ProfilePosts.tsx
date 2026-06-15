import { Thread } from "@/types/thread";
import ThreadCard from "@/components/common/ThreadCard";

interface ProfilePostsProps {
  postThreads: Thread[];
  toggleLike: (threadId: number) => void;
}

export const ProfilePosts: React.FC<ProfilePostsProps> = ({
  postThreads,
  toggleLike,
}) => {
  return (
    <div className="p-4 columns-1 gap-4">
      {postThreads.length === 0 ? (
        <div className="col-span-full">
          <p className="text-gray-400 text-sm py-12 text-center">
            Kamu belum memposting apapun.
          </p>
        </div>
      ) : (
        postThreads.map((thread) => (
          <div key={thread.id} className="break-inside-avoid mb-4">
            <ThreadCard
              thread={thread}
              onLikeToggle={toggleLike}
              isDetail={false}
            />
          </div>
        ))
      )}
    </div>
  );
};
