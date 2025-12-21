import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookInfo } from "../../types/book";
import { BookList } from "../components/BookList";

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

  return (
    <div className="library">
      <button onClick={() => nav("/")} style={{ marginBottom: 16 }}>
        📚 Home
      </button>

      <h1 className="library__title">Library</h1>

      {loading && <p>読み込み中...</p>}
      {!loading && bookList.length === 0 && <p>まだ本が登録されていません。</p>}

      {!loading && bookList.length > 0 && (
        <BookList books={bookList} onClickBook={handleClickBook} />
      )}
    </div>
  );
}
