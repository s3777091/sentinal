import { redirect } from "next/navigation";
import { getUser } from "@/app/supercode";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import Image from 'next/image';

export const revalidate = 0;

const prisma = new PrismaClient();

async function getPostDetail(postId: string) {
  return await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
          bio: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userDetail = await getUser(user);

  // Fetch the post details
  const post = await getPostDetail(params.id);

  if (!post) {
    return (
      <section className="relative">
        <h1 className="head-text">Post Not Found</h1>
      </section>
    );
  }

  return (
    <section className="relative">
      <div
        key={post.id}
        className="bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition transform hover:scale-105 duration-300"
      >
        <div className="flex items-center mb-4">
          <Image
            src={post.author.image || '/default-avatar.png'}
            alt={`${post.author.username}'s avatar`}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <h2 className="text-xl font-semibold">{post.author.username}</h2>
            <p className="text-gray-400 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Render the post's content */}
        <p className="mb-4 text-lg">{post.content}</p>

        {post.imageUrl ? (
          // Layout with image
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 flex-shrink-0">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={600} // Adjust as needed
                height={400} // Adjust as needed
                className="rounded-lg shadow-md"
                objectFit="cover"
              />
            </div>
            <div className="lg:w-1/2 lg:ml-6 mt-4 lg:mt-0">
              <div className="post-comments">
                <h3 className="text-lg text-white">Comments</h3>
                {post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="bg-zinc-700 p-4 rounded-lg mt-3">
                      <p className="text-gray-300">{comment.content}</p>
                      <small className="text-gray-500">
                        By {comment.author.username} on {new Date(comment.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Layout without image
          <div className="post-comments">
            <h3 className="text-lg text-white mt-8">Comments</h3>
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-zinc-700 p-4 rounded-lg mt-3">
                  <p className="text-gray-300">{comment.content}</p>
                  <small className="text-gray-500">
                    By {comment.author.username} on {new Date(comment.createdAt).toLocaleString()}
                  </small>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Page;