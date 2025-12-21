import { useEffect, useState } from "react";
import { useIntersectionOnce } from "../hooks/useIntersectionOnce";
import type { BookInfo } from "../../types/book";
import { toArrayBuffer } from "../lib/lib";

type Props = {
  book: BookInfo;
  onClick: (book: BookInfo) => void;
};

export function BookCard({ book, onClick }: Props) {
  const { ref, visible } = useIntersectionOnce<HTMLDivElement>();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || url) return;

    let revoked = false;

    window.mangata.loadThumbnail(String(book.id)).then((bytes) => {
      if (!bytes || revoked) return;

      const ab = toArrayBuffer(bytes);
      const blob = new Blob([ab], { type: book.mimeType });
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });

    return () => {
      revoked = true;
    };
  }, [visible, book.id, book.mimeType, url]);

  return (
    <div ref={ref} className="book-card" onClick={() => onClick(book)}>
      {url ? (
        <img className="book-card__thumb" src={url} />
      ) : (
        <div className="book-card__thumbPlaceholder" />
      )}
      <div className="book-card__title">{book.title}</div>
    </div>
  );
}
