import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { CacheEntry } from "../../types/book";
import useFullscreen from "../hooks/useFullscreen";
import { toArrayBuffer } from "../lib/lib";

const Reader: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const book = location.state?.book;

  // book がない場合（直リンク等）を最低限ガード
  // ※本当はここで book を取得するのが理想だけど、今回はレイアウト改善が主目的
  if (!book) {
    return (
      <div className="reader reader--error">
        <div className="reader__errorCard">
          <p>本の情報が見つかりませんでした。</p>
          <button className="btn" onClick={() => nav("/")}>
            ライブラリへ戻る
          </button>
        </div>
      </div>
    );
  }

  const [currentImage, setCurrentImage] = useState<string>();
  const [currentPageIndex, setCurrentPageIndex] = useState(
    book?.lastPageIndex ?? 0
  );

  const saveTimer = useRef<number | null>(null);
  const cacheRef = useRef(new Map<number, CacheEntry>());
  const CACHE_RANGE = 3;
  const requestIdRef = useRef(0);

  const pageDisplayNumber = currentPageIndex + 1;

  function bytesToObjectUrl(bytes: Uint8Array, mimeType: string) {
    const ab = toArrayBuffer(bytes);
    const blob = new Blob([ab], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  async function getOrLoadObjectUrl(bookId: string, pageOrder: number) {
    const cached = cacheRef.current.get(pageOrder);
    if (cached) return cached.objectUrl;

    const { info, bytes } = await window.mangata.loadBook(bookId, pageOrder);
    const objectUrl = bytesToObjectUrl(bytes, info.mimeType);

    cacheRef.current.set(pageOrder, { objectUrl, mimeType: info.mimeType });
    return objectUrl;
  }

  function cleanupCache(currentPage: number) {
    for (const [page, entry] of cacheRef.current) {
      if (Math.abs(page - currentPage) > CACHE_RANGE) {
        URL.revokeObjectURL(entry.objectUrl);
        cacheRef.current.delete(page);
      }
    }
  }

  const onChangePage = (index: number) => {
    setCurrentPageIndex(index);
  };

  const handleChangeRange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextIndex = Number(e.target.value);
    onChangePage(nextIndex);
  };

  const saveProgress = (nextIndex: number) => {
    window.mangata.updateLastPage(book.id, nextIndex);
  };

  const onPrevPage = useCallback(() => {
    setCurrentPageIndex((i: number) => Math.max(i - 1, 0));
  }, []);

  const onNextPage = useCallback(() => {
    setCurrentPageIndex((i: number) => Math.min(i + 1, book.pageCount - 1));
  }, [book.pageCount]);

  const {
    ref: containerRef,
    isFullscreen,
    toggle,
  } = useFullscreen<HTMLDivElement>();

  const onBackToLibrary = () => {
    // 履歴があるなら戻る（自然）
    if (window.history.length > 1) {
      nav(-1);
      return;
    }
    // 直リンク等は library へ
    nav("/");
  };

  useEffect(() => {
    return () => {
      for (const [, entry] of cacheRef.current)
        URL.revokeObjectURL(entry.objectUrl);
      cacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNextPage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevPage();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        // 全画面中なら解除、そうでなければ何もしない（好みで）
        if (isFullscreen) toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNextPage, onPrevPage, toggle, isFullscreen]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(() => {
      saveProgress(currentPageIndex);
    }, 300);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [currentPageIndex]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;

    async function run() {
      const bookId = book.id;

      const currentUrl = await getOrLoadObjectUrl(book.id, currentPageIndex);
      if (cancelled || requestId !== requestIdRef.current) return;
      setCurrentImage(currentUrl);

      const prefetch = [currentPageIndex - 1, currentPageIndex + 1].filter(
        (i) => i >= 0 && i < book.pageCount
      );

      await Promise.all(prefetch.map((i) => getOrLoadObjectUrl(bookId, i)));

      if (cancelled || requestId !== requestIdRef.current) return;
      cleanupCache(currentPageIndex);
    }

    run().catch((e) => console.error("load page failed", e));

    return () => {
      cancelled = true;
    };
  }, [currentPageIndex, book.pageCount, book.id]);

  return (
    <div
      ref={containerRef}
      className={`reader ${isFullscreen ? "reader--fs" : ""}`}
    >
      {/* 上端ホバー領域（透明） */}
      <div className="reader__hotzone reader__hotzone--top" />

      {/* 下端ホバー領域（透明） */}
      <div className="reader__hotzone reader__hotzone--bottom" />
      <header className="reader__header">
        <button className="btn btn--ghost" onClick={onBackToLibrary}>
          ⬅ ライブラリ
        </button>

        <div className="reader__title" title={book.title}>
          {book.title}
        </div>

        <div className="reader__headerRight">
          <button className="btn btn--ghost" onClick={toggle}>
            {isFullscreen ? "通常表示" : "全画面"}
          </button>
          <div className="reader__pageText">
            {pageDisplayNumber} / {book.pageCount}
          </div>
        </div>
      </header>

      <main className="reader__main">
        {currentImage ? (
          <img
            className="reader__image"
            src={currentImage}
            alt={`${book.title} - page ${pageDisplayNumber}`}
          />
        ) : (
          <div className="reader__loading">画像を読み込み中...</div>
        )}
      </main>

      <footer className="reader__footer">
        <button
          className="btn"
          onClick={onPrevPage}
          disabled={currentPageIndex <= 0}
        >
          ◀ 前
        </button>

        <input
          className="reader__range"
          type="range"
          min={0}
          max={Math.max(book.pageCount - 1, 0)}
          value={currentPageIndex}
          onChange={handleChangeRange}
        />

        <button
          className="btn"
          onClick={onNextPage}
          disabled={currentPageIndex >= book.pageCount - 1}
        >
          次 ▶
        </button>
      </footer>
    </div>
  );
};

export default Reader;
