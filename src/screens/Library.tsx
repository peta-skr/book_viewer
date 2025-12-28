import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookInfo } from "../../types/book";
import { BookList } from "../components/BookList";
import toast from "react-hot-toast";

export default function Library() {
  const nav = useNavigate();

  const [bookList, setBookList] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const bookCountText = useMemo(() => {
    if (loading) return "読み込み中…";
    return `${bookList.length} 冊`;
  }, [loading, bookList.length]);

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

  async function handleRegisterFolder() {
    const folder = await window.mangata.pickFolder();
    const t = toast.loading("登録中...");
    try {
      if (!folder) {
        toast.dismiss(t);
        return;
      }

      const ok = await window.mangata.addFolder(folder);
      if (!ok) {
        toast.error("登録できませんでした", { id: t });
        return;
      }

      // 追加したら一覧を再読込（最小変更で確実）
      const list = (await window.mangata.listFolder()) ?? [];
      setBookList(list);

      toast.success("登録しました", { id: t });
    } catch (error) {
      console.error(error);
      toast.error("登録できませんでした", { id: t });
    }
  }

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__headerLeft">
          <div className="library__subtitle">{bookCountText}</div>
        </div>

        <div className="library__headerRight">
          <button className="btn btn--primary" onClick={handleRegisterFolder}>
            📂 フォルダ追加
          </button>
        </div>
      </header>

      <section className="library__content">
        {loading && <p className="library__message">読み込み中...</p>}
        {!loading && bookList.length === 0 && (
          <div className="library__empty">
            <p className="library__message">まだ本が登録されていません。</p>
            <button className="btn" onClick={handleRegisterFolder}>
              📂 フォルダを追加する
            </button>
          </div>
        )}

        {!loading && bookList.length > 0 && (
          <BookList books={bookList} onClickBook={handleClickBook} />
        )}
      </section>
    </div>
  );
}
