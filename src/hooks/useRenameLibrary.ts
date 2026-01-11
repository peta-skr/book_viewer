import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import type { BookInfo } from "../../types/book";
import { mangataClient } from "../services/mangataClient";

export function useRenameLibrary(params: { reload: () => Promise<void> }) {
  const { reload } = params;

  const [target, setTarget] = useState<BookInfo | null>(null);
  const [title, setTitle] = useState("");

  const open = useCallback((book: BookInfo) => {
    setTarget(book);
    setTitle(book.title ?? "");
  }, []);

  const close = useCallback(() => setTarget(null), []);

  const submit = useCallback(async () => {
    if (!target) return;

    const next = title.trim();
    if (!next) return;

    const t = toast.loading("更新中...");
    try {
      const ok = await mangataClient.renameBook(String(target.id), next);
      if (!ok) {
        toast.error("更新できませんでした", { id: t });
        return;
      }
      toast.success("更新しました", { id: t });
      close();
      await reload();
    } catch (e) {
      console.error(e);
      toast.error("更新できませんでした", { id: t });
    }
  }, [target, title, reload, close]);

  return { rename: { target, title, setTitle, open, close, submit } };
}
