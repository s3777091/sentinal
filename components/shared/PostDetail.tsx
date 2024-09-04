import Image from "next/image";
import PostComment from "@/components/forms/PostComment";
import { Post, User, Comment } from "@prisma/client";
import { userDetail } from "@/types/types"; // Assuming you have a custom userDetail type

interface PostDetailProps {
    post: Omit<Post, "authorId"> & {
    author: Pick<User, "id" | "username" | "image" | "bio">;
    comments: (Omit<Comment, "authorId" | "postId"> & {
      author: Pick<User, "id" | "username" | "image">;
    })[];
  };
  user: userDetail; // Assuming userDetail contains 'userid' and 'imageUrl'
}

export default function PostDetail({ post, user }: PostDetailProps) {
  return (
    <div
      key={post.id}
      className="bg-gray-200 dark:bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition transform hover:scale-105 duration-300"
    >
      {/* Post Author Info */}
      <div className="flex items-center mb-4">
        <Image
          src={post.author?.image || "/default-avatar.png"} // Use post author image or default
          alt={`${post.author?.username || "Unknown"}'s avatar`} // Handle missing username
          width={48}
          height={48}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl font-semibold">
            {post.author?.username || "Unknown"}
          </h2>
          <p className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="mb-4 text-lg">{post.content}</p>

      {/* Post Image if available */}
      {post.imageUrl ? (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 flex-shrink-0">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg shadow-md"
              objectFit="cover"
            />
          </div>
          <div className="lg:w-1/2 lg:ml-6 mt-4 lg:mt-0">
            <div className="post-comments">
              <h3 className="text-lg text-black dark:text-white">Comments</h3>
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-300 dark:bg-zinc-700 p-4 rounded-lg mt-3"
                  >
                    <p className="text-black dark:text-gray-300">{comment.content}</p>
                    <small className="text-gray-500">
                      By {comment.author?.username || "Unknown"} on{" "}
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                    <Image
                      src={comment.author?.image || "/default-avatar.png"} // Comment author image
                      alt={`${comment.author?.username || "Unknown"}'s avatar`}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="post-comments">
          <h3 className="text-lg text-black dark:text-white mt-8">Comments</h3>
          {post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment.id} className="bg-zinc-700 p-4 rounded-lg mt-3">
                <p className="text-black dark:text-gray-300">{comment.content}</p>
                <small className="text-gray-500">
                  By {comment.author?.username || "Unknown"} on{" "}
                  {new Date(comment.createdAt).toLocaleString()}
                </small>
                <Image
                  src={comment.author?.image || "/default-avatar.png"} // Comment author image
                  alt={`${comment.author?.username || "Unknown"}'s avatar`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full mr-2"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
      )}

      {/* Add the PostComment form */}
      <div className="mt-8">
        <PostComment
          postId={post.id.toString()}
          currentUserImg={user.imageUrl || "/default-avatar.png"}
          currentUserId={user.userid.toString()}
        />
      </div>
    </div>
  );
}
