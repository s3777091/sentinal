"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { postEdited } from "@/lib/validations/Post";
import { useUploadThing } from "@/lib/uploadthing";
import { UserDetail } from "@/types/types";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import FileUploader from "@/components/shared/Post/FileUploader";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../../ui/input";
import Loader from "../../Loading/Loader";
import { useToast } from "@/hooks/use-toast";
import { NextResponse } from "next/server";
interface UserProps {
  user: UserDetail;
  postID: string;
}

const PostEdit = ({ user, postID }: UserProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("media");
  const { toast } = useToast();

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize the form with Zod validation schema
  const form = useForm<z.infer<typeof postEdited>>({
    resolver: zodResolver(postEdited),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      postID: postID,
      authorId: user.userid
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof postEdited>) => {
    setIsLoading(true);

    if (files.length > 0) {
      const imgRes = await startUpload(files);
      if (imgRes && imgRes[0].url) {
        values.imageUrl = imgRes[0].url;
      }
    }

    try {
      const response = await fetch("/api/post", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
    } catch (error) {
      throw new NextResponse("Edit post Fail");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10 p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-lg font-semibold text-gray-700">
                Title
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the title of your post..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content Field */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3 mt-4">
              <FormLabel className="text-lg font-semibold text-gray-700">
                Content
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className="resize-none p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write the content of your post..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload Field */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormLabel className="text-lg font-semibold text-gray-700 ">
                Upload Image
              </FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={(files) => {
                    setFiles(files);
                    setPreviewUrl(URL.createObjectURL(files[0])); // Update preview URL
                    field.onChange(""); // Clear imageUrl to let FileUploader handle it
                  }}
                  mediaUrl={field.value || ""}
                  previewUrl={previewUrl} // Pass the previewUrl correctly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit and Cancel Buttons */}
        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading && <Loader />}
            Update new post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostEdit;