import { useEffect, useState } from "react";
import { loadCoverDataUrl } from "../../electron/coverLoader";
import type { BookInfo } from "../../types/book";

type CoverMap = Record<number, string>; // bookId -> dataUrl

export function useBookCovers(books: BookInfo[]) {
  const [covers, setCovers] = useState<CoverMap>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const newEntries: [number, string][] = [];

      for (const book of books) {
        if (!book.coverPath) continue;

        console.log("tre");

        const url = await loadCoverDataUrl(book.coverPath);
        if (!url) continue;

        newEntries.push([book.id, url]);
      }

      if (cancelled) return;

      setCovers((prev) => {
        const next = { ...prev };
        for (const [id, url] of newEntries) {
          next[id] = url;
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  });
}
