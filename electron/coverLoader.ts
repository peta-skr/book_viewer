import fs from "fs/promises";
import path from "path";
import mime from "mime"; // なければ `npm i mime`

// path → data URLのキャッシュ
const coverCache = new Map<string, string>();

export async function loadCoverDataUrl(
  coverPath: string
): Promise<string | null> {
  if (!coverPath) return null;

  // すでに作ったことがあればキャッシュから返す
  const cached = coverCache.get(coverPath);
  if (cached) return cached;

  try {
    const buf = await fs.readFile(coverPath);
    const mimeType = mime.getType(coverPath) ?? "image/png";

    const dataUrl = `data:${mimeType};base64,${buf.toString("base64")}`;

    coverCache.set(coverPath, dataUrl);
    trimCoverCache();

    return dataUrl;
  } catch (e) {
    console.error("Failed to load cover:", coverPath, e);
    return null;
  }
}

const MAX_COVER_CACHE = 10;

function trimCoverCache() {
  while (coverCache.size > MAX_COVER_CACHE) {
    const oldestKey = coverCache.keys().next().value;
    coverCache.delete(oldestKey);
  }
}
