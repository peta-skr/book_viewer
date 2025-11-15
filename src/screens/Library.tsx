import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookInfo } from "../../types/book";

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
        console.log("loaded books:", list);
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
    <div style={{ padding: 16 }}>
      <button onClick={() => nav("/")} style={{ marginBottom: 16 }}>
        📚 Home
      </button>

      <h1 style={{ marginBottom: 16 }}>Library</h1>

      {loading && <p>読み込み中...</p>}

      {!loading && bookList.length === 0 && <p>まだ本が登録されていません。</p>}

      {!loading && bookList.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {bookList.map((book) => (
            <div
              key={book.id}
              onClick={() => handleClickBook(book)}
              style={{
                cursor: "pointer",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={book.coverPath}
                alt={book.title}
                style={{
                  width: 140,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 4,
                  textAlign: "center",
                  width: "100%",
                  wordBreak: "break-word",
                }}
              >
                {book.title}
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {book.lastPageIndex + 1} / {book.pageCount} ページ
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
