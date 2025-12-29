import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookInfo } from "../../types/book";
import { BookList } from "../components/BookList";
import toast from "react-hot-toast";

export default function Library() {
  const nav = useNavigate();

  const [bookList, setBookList] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // --- modal state ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pickedFolder, setPickedFolder] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");

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

  // async function handleRegisterFolder() {
  //   const folder = await window.mangata.pickFolder();
  //   const t = toast.loading("登録中...");
  //   try {
  //     if (!folder) {
  //       toast.dismiss(t);
  //       return;
  //     }

  //     const ok = await window.mangata.addFolder(folder);
  //     if (!ok) {
  //       toast.error("登録できませんでした", { id: t });
  //       return;
  //     }

  //     // 追加したら一覧を再読込（最小変更で確実）
  //     const list = (await window.mangata.listFolder()) ?? [];
  //     setBookList(list);

  //     toast.success("登録しました", { id: t });
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("登録できませんでした", { id: t });
  //   }
  // }

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__headerLeft">
          <h1 className="library__title">Library</h1>
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
        {!loading && bookList.length > 0 && (
          <BookList books={bookList} onClickBook={handleClickBook} />
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
    </div>
  );
}
