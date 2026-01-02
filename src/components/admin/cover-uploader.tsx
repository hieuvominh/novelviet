"use client";

import React, { useState, useTransition, useEffect } from "react";

// Inline minimal SVG icons to avoid adding a dependency on lucide-react
function UploadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="17"
        width="18"
        height="4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ImageIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 13l2.5-3 3.5 4 2.5-3 2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  initialUrl?: string | null;
  onUploaded?: (url: string | null) => void;
};

export default function CoverUploader({
  initialUrl = null,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFiles = (f: File | null) => {
    setError(null);
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) handleFiles(f);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) handleFiles(f);
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);

      // Import server action (callable from client)
      const mod = await import("@/app/actions/uploadCover");
      let res = null as any;
      try {
        res = await mod.uploadCoverImage(fd);
      } catch (err: any) {
        // server action may throw if body parsing fails; fall through to API fallback
        res = { success: false, error: err?.message || String(err) };
      }

      if (!res || !res.success) {
        // Attempt API fallback: read file as base64 and POST to /api/upload-cover
        try {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(
              null,
              Array.prototype.slice.call(bytes.subarray(i, i + chunkSize))
            );
          }
          const base64 =
            typeof window === "undefined"
              ? Buffer.from(binary, "binary").toString("base64")
              : btoa(binary);

          const apiRes = await fetch("/api/upload-cover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, content: base64 }),
          });

          // Read as text first so we can handle non-JSON responses (Next may return
          // an HTML/text error like "Invalid JSON" when the body is too large).
          const text = await apiRes.text();
          try {
            const json = JSON.parse(text);
            if (!json?.success) {
              setError(json?.error || "Upload failed");
              return;
            }
            setPreview(json.url);
            setFile(null);
            onUploaded?.(json.url);
            return;
          } catch (parseErr: any) {
            // If the server returned a 413 or a body that begins with "Invalid JSON",
            // surface a clearer message the UI can display.
            if (
              apiRes.status === 413 ||
              (typeof text === "string" && text.includes("Invalid JSON"))
            ) {
              setError(
                "Unexpected token 'I', \"Invalid JSON\" is not valid JSON"
              );
            } else {
              setError(parseErr?.message || String(parseErr));
            }
            return;
          }
          return;
        } catch (err2: any) {
          setError(err2?.message || String(err2));
          return;
        }
      }

      setPreview(res.url);
      setFile(null);
      onUploaded?.(res.url);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onUploaded?.(null);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center gap-4"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="flex items-center gap-3">
            <div className="w-40 h-60 bg-gray-50 rounded shadow-sm flex items-center justify-center overflow-hidden">
              {preview ? (
                // 2:3 aspect preview
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-2">
                  <ImageIcon />
                  <div className="text-xs">No image</div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">
                Drag & drop an image or choose a file
              </div>
              <input type="file" accept="image/*" onChange={onSelect} />
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={upload}
                  disabled={loading || !file}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  <UploadIcon className="w-4 h-4" />
                  {loading ? "Uploading..." : "Upload"}
                </button>

                <button
                  type="button"
                  onClick={remove}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" /> Remove
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 mt-2">{error}</div>
              )}

              {preview &&
                typeof preview === "string" &&
                preview.startsWith("http") && (
                  <div className="text-sm text-gray-700 mt-3 break-all">
                    Uploaded URL:{" "}
                    <a
                      className="text-blue-600 cursor-pointer"
                      href={preview}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {preview}
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
