import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    // allow larger JSON payloads (base64 encoded images)
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

type UploadResponse = { success: true; url: string } | { success: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse>) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    const { filename, content } = req.body as { filename?: string; content?: string };
    if (!filename || !content) return res.status(400).json({ success: false, error: "Missing filename or content" });

    // limit approximate decoded size to 8MB
    const approxBytes = Math.ceil((content.length * 3) / 4);
    const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
    if (approxBytes > MAX_FILE_BYTES) {
      return res.status(413).json({ success: false, error: `File too large. Max ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB` });
    }

    const owner = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    if (!owner || !repo || !token) {
      return res.status(500).json({ success: false, error: "Missing GitHub configuration (GITHUB_USERNAME / GITHUB_REPO / GITHUB_TOKEN)" });
    }

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const dir = `covers/${now.getFullYear()}-${month}`;

    const extMatch = filename.match(/\.([a-z0-9]+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "png";
    const newName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${dir}/${newName}`;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

    const body = {
      message: `Add cover ${newName}`,
      content,
      committer: {
        name: owner,
        email: `${owner}@users.noreply.github.com`,
      },
    };

    const ghRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "User-Agent": "truyendoc-cover-uploader",
      },
      body: JSON.stringify(body),
    });

    if (!ghRes.ok) {
      const text = await ghRes.text();
      return res.status(ghRes.status).json({ success: false, error: `GitHub API error ${ghRes.status}: ${text}` });
    }

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    return res.status(200).json({ success: true, url: rawUrl });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
}
