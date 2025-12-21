"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCoverDataUrl = loadCoverDataUrl;
const promises_1 = __importDefault(require("fs/promises"));
const mime_1 = __importDefault(require("mime")); // なければ `npm i mime`
// path → data URLのキャッシュ
const coverCache = new Map();
async function loadCoverDataUrl(coverPath) {
    if (!coverPath)
        return null;
    // すでに作ったことがあればキャッシュから返す
    const cached = coverCache.get(coverPath);
    if (cached)
        return cached;
    try {
        const buf = await promises_1.default.readFile(coverPath);
        const mimeType = mime_1.default.getType(coverPath) ?? "image/png";
        const dataUrl = `data:${mimeType};base64,${buf.toString("base64")}`;
        coverCache.set(coverPath, dataUrl);
        trimCoverCache();
        return dataUrl;
    }
    catch (e) {
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
