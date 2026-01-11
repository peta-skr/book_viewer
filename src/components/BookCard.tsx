import { useEffect, useRef, useState } from "react";
import { useIntersectionOnce } from "../hooks/useIntersectionOnce";
import type { BookInfo } from "../../types/book";
import { toArrayBuffer } from "../lib/lib";

type Props = {
  book: BookInfo;
  onClick: (book: BookInfo) => void;
  onRename: () => void;
  onRemove: () => void;
};

export function BookCard({ book, onClick, onRename, onRemove }: Props) {
  const { ref, visible } = useIntersectionOnce<HTMLDivElement>();
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  // 外側クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="book-card" onClick={() => onClick(book)}>
      {/* 右上メニュー */}
      <div className="book-card__menuWrap" ref={menuRef}>
        <button
          className="btn btn--ghost book-card__menuBtn"
          onClick={(e) => {
            e.stopPropagation(); // ← ここ重要（カードクリックを防ぐ）
            setOpen((v) => !v);
          }}
          aria-label="menu"
        >
          ⋯
        </button>

        {open && (
          <div className="menu">
            <button
              className="menu__item"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onRename();
              }}
            >
              ✏️ 名前変更
            </button>
            <button
              className="menu__item menu__item--danger"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onRemove();
              }}
            >
              🗑 登録解除
            </button>
          </div>
        )}
      </div>
      {url ? (
        <img className="book-card__thumb" src={url} />
      ) : (
        <div className="book-card__thumbPlaceholder" />
      )}
      <div className="book-card__title">{book.title}</div>
    </div>
  );
}
