import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { folderBaseName } from "../utils/path";
import { mangataClient } from "../services/mangataClient";

export function useAddLibrary(params: { reload: () => Promise<void> }) {
  const { reload } = params;

  const [open, setOpen] = useState(false);
  const [pickedFolder, setPickedFolder] = useState("");
  const [title, setTitle] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{
    folder: string;
    title: string;
  } | null>(null);

  const canSubmit = useMemo(
    () => pickedFolder.trim().length > 0 && title.trim().length > 0,
    [pickedFolder, title]
  );

  const openModal = useCallback(() => {
    setPickedFolder("");
    setTitle("");
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  const pickFolder = useCallback(async () => {
    const folder = await mangataClient.pickFolder();
    if (!folder) return;

    setPickedFolder(folder);
    setTitle((prev) => prev || folderBaseName(folder));
  }, []);

  const submit = useCallback(async () => {
    const t = toast.loading("登録中...");

    try {
      const folder = pickedFolder.trim();
      const nextTitle = title.trim();

      if (!folder || !nextTitle) {
        toast.error("タイトルとフォルダを指定してください", { id: t });
        return;
      }

      const exists = await mangataClient.existBook(folder);
      if (exists) {
        toast.dismiss(t);
        setPending({ folder, title: nextTitle });
        setConfirmOpen(true);
        return;
      }

      const ok = await mangataClient.addFolder(folder, nextTitle);
      if (!ok) {
        toast.error("登録できませんでした", { id: t });
        return;
      }

      await reload();
      toast.success("登録しました", { id: t });
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error("登録できませんでした", { id: t });
    }
  }, [pickedFolder, title, reload, closeModal]);

  const cancelOverwrite = useCallback(() => {
    setConfirmOpen(false);
    setPending(null);
  }, []);

  const confirmOverwrite = useCallback(async () => {
    if (!pending) return;

    const t = toast.loading("登録中...");
    try {
      const result = await mangataClient.overwriteBook(
        pending.folder,
        pending.title
      );
      if (!result.ok) {
        toast.error("登録できませんでした", { id: t });
        return;
      }
      await reload();
      toast.success("登録しました", { id: t });
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error("登録できませんでした", { id: t });
    } finally {
      setConfirmOpen(false);
      setPending(null);
    }
  }, [pending, reload, closeModal]);

  return {
    add: {
      open,
      openModal,
      closeModal,
      pickedFolder,
      title,
      setTitle,
      pickFolder,
      canSubmit,
      submit,
    },
    overwrite: {
      open: confirmOpen,
      cancel: cancelOverwrite,
      confirm: confirmOverwrite,
    },
  };
}
