"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validations/Post";
import { useUploadThing } from "@/lib/uploadthing";
import { userDetail } from "@/types/types";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import FileUploader from "@/components/shared/FileUploader";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import Loader from "../LoadiComponents/Loader";

interface UserProps {
  user: userDetail;
}

const PostForm = ({ user }: UserProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("media");

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize the form with Zod validation schema
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      authorId: user.userid, // Ensure this matches your schema
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof postSchema>) => {
    setIsLoading(true);

    if (files.length > 0) {
      const imgRes = await startUpload(files);
      if (imgRes && imgRes[0].url) {
        values.imageUrl = imgRes[0].url;
      }
    }

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const data = await response.json();
        console.error("Error creating post:", data.errors || data);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10 p-6 bg-white rounded-lg shadow-md"
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
              <FormLabel className="text-lg font-semibold text-gray-700">
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
            Post Scyber
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;