"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { postSchema } from "@/lib/validations/Post";
import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";
import { userDetail } from "@/types/types";

interface UserProps {
  user: userDetail;
}

const PostVul = ({ user }: UserProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { startUpload } = useUploadThing("media");

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    const blob = values.imageUrl ?? "";

    const hasImageChanged = isBase64Image(blob);
    if (hasImageChanged) {
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
        body: JSON.stringify(values), // Include imageUrl in the submission
      });

      if (response.ok) {
        router.push("/");
      } else {
        const data = await response.json();
        console.error("Error creating post:", data.errors || data);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
        setPreviewUrl(imageDataUrl); // Set the preview URL for the image
      };

      fileReader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10 p-6 bg-white rounded-lg shadow-md"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormLabel className="text-lg font-semibold text-gray-700">
                Upload Image
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e, field.onChange)}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
              {previewUrl && (
                <div className="mt-3">
                  <Image
                    src={previewUrl}
                    alt="Uploaded image preview"
                    width={400}
                    height={300}
                    className="rounded-md object-contain"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="self-end px-6 py-3 rounded-md hover:bg-blue-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:bg-dark-2 dark:text-light-1
          "
        >
          Post Scyber
        </Button>
      </form>
    </Form>
  );
};

export default PostVul;