import { useCallback } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react"; // Import the Upload icon from Lucide

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  previewUrl?: string | null;
};

const FileUploader = ({ fieldChange, mediaUrl, previewUrl }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      fieldChange(acceptedFiles);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex flex-col items-center justify-center border h-80 dark:border-slate-800 border-slate-200 bg-white dark:bg-dark-3 rounded-xl cursor-pointer shadow-lg overflow-hidden hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-300"
    >
      <input {...getInputProps()} className="absolute inset-0 cursor-pointer opacity-0" />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/assets/upload-bg.jpg')" }}
      />

      {previewUrl ? (
        <>
          <div className="flex justify-center w-full p-5 lg:p-10">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md max-h-40 object-contain rounded-md shadow-md"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Click or drag photo to replace</p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 text-gray-500 dark:text-gray-400 mb-6" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Drag photo here</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">SVG, PNG, JPG</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
