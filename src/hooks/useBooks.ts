import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { BookInfo } from "../../types/book";
import { mangataClient } from "../services/mangataClient";

export function useBooks() {
  const [bookList, setBookList] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    return await mangataClient.listFolder();
  }, []);

  const reload = useCallback(async () => {
    try {
      const list = await fetchBooks();
      setBookList(list);
    } catch (e) {
      console.error("failed to load books", e);
      toast.error("読み込みに失敗しました");
    }
  }, [fetchBooks]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchBooks();
        if (cancelled) return;
        setBookList(list);
      } catch (e) {
        console.error("failed to load books", e);
        toast.error("読み込みに失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchBooks]);

  return { bookList, loading, reload };
}
