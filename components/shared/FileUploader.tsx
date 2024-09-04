import { useCallback } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  previewUrl?: string | null; // Allow previewUrl to be optional
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
      className="flex flex-col items-center justify-center border h-80 dark:border-slate-800 border-slate-200 bg-white dark:bg-dark-3 rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {previewUrl ? (
        <>
          <div className="flex justify-center w-full p-5 lg:p-10">
            <img
              src={previewUrl}
              alt="Preview"
              className="file_uploader-img w-full max-w-xs sm:max-w-sm lg:max-w-md max-h-40 object-contain rounded-md" // Set maximum height here
            />
          </div>
          <p className="file_uploader-label">Click or drag photo to replace</p>
        </>
      ) : (
        <div className="file_uploader-box flex flex-col items-center justify-center">
          <img
            src="/assets/file-upload.svg"
            className="w-24 h-auto sm:w-32 lg:w-48" // Responsive size
            alt="file upload"
          />
          <h3 className="base-medium text-dark-3 dark:text-light-2 mb-2 mt-6">Drag photo here</h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;