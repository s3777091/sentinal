"use client";

import { z } from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { CommentValidation } from "@/lib/validations/Post";

interface Props {
  postId: string; // Ensure postId is a string
  currentUserImg: string;
  currentUserId: string; // Ensure currentUserId is a string
}

function PostComment({ postId, currentUserImg, currentUserId }: Props) {
  const pathname = usePathname();

  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    try {
      const response = await fetch(`/api/post/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: values.comment,
          postId: postId, // Keep postId as string
          authorId: currentUserId, // Keep authorId as string
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      // Reset the form after successful submission
      form.reset();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <Form {...form}>
      <form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='comment'
          render={({ field }) => (
            <FormItem className='flex w-full items-center gap-3'>
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt='current_user'
                  width={48}
                  height={48}
                  className='rounded-full object-cover'
                />
              </FormLabel>
              <FormControl className='border-none bg-transparent'>
                <Input
                  type='text'
                  {...field}
                  placeholder='Comment...'
                  className='no-focus text-black dark:text-light-1 outline-none'
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type='submit' className='comment-form_btn'>
          Reply
        </Button>
      </form>
    </Form>
  );
}

export default PostComment;