"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const fileInput = e.currentTarget.elements.namedItem(
        "file"
      ) as HTMLInputElement;
      const file = fileInput.files?.[0];

      if (!file) return;

      // Get presigned URL
      const urlResponse = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });
      const { uploadUrl, fileKey } = await urlResponse.json();

      // Upload directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        const finalUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;
        setUploadedUrl(finalUrl);
      }
    } catch (error: unknown) {
      alert("Upload failed");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">File Upload to S3</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Select File</label>
              <input
                type="file"
                name="file"
                required
                className="w-full border p-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {uploadedUrl && (
            <div className="mt-6">
              <h2 className="font-bold mb-2">Uploaded File:</h2>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
