"use server";

import { Buffer } from "buffer";

type UploadResult = { success: true; url: string } | { success: false; error: string };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadCoverImage(formData: FormData): Promise<UploadResult> {
  try {
    if (!formData) return { success: false, error: "No form data provided" };

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided" };

    if (file.size > MAX_FILE_BYTES) {
      return { success: false, error: `File too large. Max ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB` };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const owner = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return { success: false, error: "Missing GitHub configuration (GITHUB_USERNAME / GITHUB_REPO / GITHUB_TOKEN)" };
    }

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const dir = `covers/${now.getFullYear()}-${month}`;

    // preserve extension when possible
    const originalName = (file as any).name || "cover.png";
    const extMatch = originalName.match(/\.([a-z0-9]+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${dir}/${filename}`;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

    const body = {
      message: `Add cover ${filename}`,
      content: base64,
      committer: {
        name: owner,
        email: `${owner}@users.noreply.github.com`,
      },
    };

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "User-Agent": "truyendoc-cover-uploader",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `GitHub API error ${res.status}: ${text}` };
    }

    // Construct raw URL
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    return { success: true, url: rawUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}
