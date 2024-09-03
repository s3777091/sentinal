// app/community/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-[100vh] bg-zinc-900 text-gray-200 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Skeleton for search bar */}
        <div className="flex mb-8">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="ml-4 w-full h-10 rounded-md" />
          <Skeleton className="ml-4 w-24 h-10 rounded-md" />
        </div>

        {/* Skeletons for post cards */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-zinc-800 p-6 rounded-lg mb-3 shadow-md">
            <div className="flex items-center mb-4">
              <Skeleton className="w-12 h-12 rounded-full mr-4" />
              <div className="flex-1">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}