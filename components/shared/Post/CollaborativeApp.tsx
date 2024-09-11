"use client";

import { useThreads } from "@liveblocks/react/suspense";

import { Composer, Thread } from "@liveblocks/react-ui";

export function CollaborativeApp() {
  const { threads } = useThreads();
  return (
    <div>
      {threads.map((thread) => (
        <Thread key={thread.id} thread={thread} className="thread thread-text" overrides={{
            THREAD_COMPOSER_PLACEHOLDER: "Reply to post..."
        }}/>
      ))}
      <Composer  className="composer composer-text" overrides={{
        COMPOSER_PLACEHOLDER: "Reply to post...."
      }}/>
    </div>
  );
}