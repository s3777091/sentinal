// app/community/comment-loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function CommentLoading() {
  return (
    <div className="flex items-start space-x-4 p-4 bg-zinc-900 text-gray-200 rounded-lg mb-4">
      {/* Skeleton for profile picture */}
      <Skeleton className="w-8 h-8 rounded-full" />

      <div className="flex-1 space-y-3">
        {/* Skeleton for username */}
        <Skeleton className="w-1/4 h-4 rounded-md" />
        
        {/* Skeleton for comment text */}
        <Skeleton className="w-full h-4 rounded-md" />
        <Skeleton className="w-2/3 h-4 rounded-md" />
      </div>
    </div>
  );
}