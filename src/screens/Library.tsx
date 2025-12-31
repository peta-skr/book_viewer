import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookInfo, LibraryInfo } from "../../types/book";
import { BookList } from "../components/BookList";
import toast from "react-hot-toast";
import { LibrarySearchBar } from "../components/SearchBar";

export default function Library() {
  const nav = useNavigate();

  const [bookList, setBookList] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // --- modal state ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pickedFolder, setPickedFolder] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");

  // メニュー/モーダル state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [renameTarget, setRenameTarget] = useState<BookInfo | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<BookInfo | null>(null);

  // 検索
  const [search, setSearch] = useState("");

  const bookCountText = useMemo(() => {
    if (loading) return "読み込み中…";
    return `${bookList.length} 冊`;
  }, [loading, bookList.length]);

  async function reload() {
    const list = (await window.mangata.listFolder()) ?? [];
    setBookList(list);
  }

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const list = (await window.mangata.listFolder()) ?? [];
        if (cancelled) return;
        setBookList(list);
      } catch (error) {
        console.error("failed to load books", error);
        toast.error("読み込みに失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClickBook = (book: BookInfo) => {
    nav(`/book/${book.id}`, { state: { book } });
  };

  const openAddModal = () => {
    setPickedFolder("");
    setNewTitle("");
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
  };

  const pickFolderInModal = async () => {
    const folder = await window.mangata.pickFolder();
    if (!folder) return;

    setPickedFolder(folder);

    // 初期値はフォルダ名（末尾）にする
    const base = folder.split(/[\\]/).filter(Boolean).pop() ?? "";
    setNewTitle((prev) => prev || base);
  };

  const canSubmit =
    pickedFolder.trim().length > 0 && newTitle.trim().length > 0;

  const submitAdd = async () => {
    console.log(newTitle);

    const t = toast.loading("登録中...");
    try {
      const ok = await window.mangata.addFolder(pickedFolder, newTitle.trim());

      if (!ok) {
        toast.error("登録できませんでした", { id: t });
      }

      await reload();
      toast.success("登録しました", { id: t });
      closeAddModal();
    } catch (error) {
      console.error(error);
      toast.error("登録できませんでした", { id: t });
    }
  };

  const openRename = (lib: BookInfo) => {
    setMenuOpenId(null);
    setRenameTarget(lib);
    setRenameTitle(lib.title ?? "");
  };

  const submitRename = async () => {
    if (!renameTarget) return;
    const next = renameTitle.trim();
    if (!next) return;

    const t = toast.loading("更新中...");
    try {
      const ok = await window.mangata.renameBook(String(renameTarget.id), next);
      if (!ok) {
        console.log(ok);
        toast.error("更新できませんでした", { id: t });
        return;
      }
      toast.success("更新しました", { id: t });
      setRenameTarget(null);
      await reload();
    } catch (error) {
      console.error(error);
      toast.error("更新できませんでした", { id: t });
    }
  };

  const openDelete = (lib: BookInfo) => {
    setMenuOpenId(null);
    setDeleteTarget(lib);
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;

    const t = toast.loading("削除中...");

    try {
      const ok = await window.mangata.removeBook(String(deleteTarget.id));

      if (!ok) {
        toast.error("削除できませんでした", { id: t });
        return;
      }
      toast.success("削除しました", { id: t });
      setDeleteTarget(null);
      await reload();
    } catch (error) {
      console.error(error);
      toast.error("削除できませんでした", { id: t });
    }
  };

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookList;

    return bookList.filter((b) => b.title?.toLowerCase().includes(q));
  }, [bookList, search]);

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__headerLeft">
          <LibrarySearchBar
            value={search}
            onChange={setSearch}
            placeholder="タイトルで検索"
            totalCount={bookList.length}
            filteredCount={filteredBooks.length}
          />
          <div className="library__subtitle">{bookCountText}</div>
        </div>
        <div className="library__headerRight">
          <button className="btn btn--primary" onClick={openAddModal}>
            ＋ ライブラリ追加
          </button>
        </div>
      </header>

      <section className="library__content">
        {loading && <p className="library__message">読み込み中...</p>}
        {!loading && bookList.length === 0 && (
          <div className="library__empty">
            <p className="library__message">まだ本が登録されていません。</p>
            <button className="btn" onClick={openAddModal}>
              ＋ ライブラリ追加
            </button>
          </div>
        )}
        {!loading && filteredBooks.length === 0 && (
          <p className="library__message">
            「{search}」に一致する本はありません
          </p>
        )}

        {!loading && bookList.length > 0 && (
          <BookList
            books={filteredBooks}
            onClickBook={handleClickBook}
            onRenameBook={(b: BookInfo) => {
              setRenameTarget(b);
              setRenameTitle(b.title ?? "");
            }}
            onRemoveBook={(b: BookInfo) => setDeleteTarget(b)}
          />
        )}
      </section>

      {/* --- Modal --- */}
      {isAddOpen && (
        <div className="modal__backdrop" onMouseDown={closeAddModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">ライブラリ追加</div>
              <button className="btn btn--ghost" onClick={closeAddModal}>
                ✕
              </button>
            </div>

            <div className="modal__body">
              <div className="field">
                <div className="field__label">フォルダ</div>
                <div className="field__row">
                  <button className="btn" onClick={pickFolderInModal}>
                    📂 フォルダ選択
                  </button>
                  <div className="field__value" title={pickedFolder}>
                    {pickedFolder ? pickedFolder : "未選択"}
                  </div>
                </div>
              </div>

              <div className="field">
                <div className="field__label">タイトル</div>
                <input
                  className="input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例：青年誌 / ラノベ / お気に入り"
                />
              </div>
            </div>

            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={closeAddModal}>
                キャンセル
              </button>
              <button
                className="btn btn--primary"
                disabled={!canSubmit}
                onClick={submitAdd}
              >
                登録
              </button>
            </div>
          </div>
        </div>
      )}
      {/* リネームモーダル */}
      {renameTarget && (
        <div
          className="modal__backdrop"
          onMouseDown={() => setRenameTarget(null)}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">ライブラリ名の変更</div>
              <button
                className="btn btn--ghost"
                onClick={() => setRenameTarget(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              <div className="field">
                <div className="field__label">新しいタイトル</div>
                <input
                  className="input"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal__footer">
              <button
                className="btn btn--ghost"
                onClick={() => setRenameTarget(null)}
              >
                キャンセル
              </button>
              <button
                className="btn btn--primary"
                onClick={submitRename}
                disabled={!renameTitle.trim()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除（登録解除）確認モーダル */}
      {deleteTarget && (
        <div
          className="modal__backdrop"
          onMouseDown={() => setDeleteTarget(null)}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">ライブラリの登録解除</div>
              <button
                className="btn btn--ghost"
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              <p className="library__message">
                「{deleteTarget.title}」を登録解除します。
                <br />
                <strong>PC内のファイルは削除されません。</strong>
              </p>
            </div>

            <div className="modal__footer">
              <button
                className="btn btn--ghost"
                onClick={() => setDeleteTarget(null)}
              >
                キャンセル
              </button>
              <button className="btn btn--primary" onClick={submitDelete}>
                登録解除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
