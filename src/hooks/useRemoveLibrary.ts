import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import type { BookInfo } from "../../types/book";

export function useRemoveLibrary(params: { reload: () => Promise<void> }) {
  const { reload } = params;
  const [target, setTarget] = useState<BookInfo | null>(null);

  const open = useCallback((book: BookInfo) => setTarget(book), []);
  const close = useCallback(() => setTarget(null), []);

  const submit = useCallback(async () => {
    if (!target) return;

    const t = toast.loading("削除中...");
    try {
      const ok = await window.mangata.removeBook(String(target.id));
      if (!ok) {
        toast.error("削除できませんでした", { id: t });
        return;
      }
      toast.success("削除しました", { id: t });
      close();
      await reload();
    } catch (e) {
      console.error(e);
      toast.error("削除できませんでした", { id: t });
    }
  }, [target, reload, close]);

  return { remove: { target, open, close, submit } };
}
