import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookInfo } from "../../types/book";
import { BookList } from "../components/BookList";
import toast from "react-hot-toast";

export default function Library() {
  const nav = useNavigate();

  const [bookList, setBookList] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const list = (await window.mangata.listFolder()) ?? [];
        if (cancelled) return;
        setBookList(list);
      } catch (error) {
        console.error("failed to load books", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClickBook = (book: BookInfo) => {
    // 好みで state に book 情報を渡してもOK
    nav(`/book/${book.id}`, { state: { book } });
  };

  async function handleRegisterFolder() {
    const folder = await window.mangata.pickFolder();
    const t = toast.loading("登録中...");
    try {
      if (!folder) return;
      const ok = await window.mangata.addFolder(folder);
      if (!ok) {
        toast.error("登録できませんでした", { id: t });
        return;
      }
      toast.success("登録しました", { id: t });
    } catch (error) {
      console.error(error);
      toast.error("登録できませんでした", { id: t });
    }
  }

  return (
    <div className="library">
      <button onClick={handleRegisterFolder}>📂 フォルダ選択</button>

      <h1 className="library__title">Library</h1>

      {loading && <p>読み込み中...</p>}
      {!loading && bookList.length === 0 && <p>まだ本が登録されていません。</p>}

      {!loading && bookList.length > 0 && (
        <BookList books={bookList} onClickBook={handleClickBook} />
      )}
    </div>
  );
}
