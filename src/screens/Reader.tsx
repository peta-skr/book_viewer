// Reader.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { data, useLocation, useNavigate, useParams } from "react-router-dom";
import type { BookInfo, CacheEntry, ImageInfo } from "../../types/book";
import useFullscreen from "../hooks/useFullscreen";

const Reader: React.FC = () => {
  const { id } = useParams(); // urlのパラメータ取得
  const nav = useNavigate();
  const location = useLocation(); // 遷移元が渡した状態を取得
  const book = location.state?.book;

  const [currentImage, setCurrentImage] = useState<string>(); // 現在のImage情報を保持
  const [currentPageIndex, setCurrentPageIndex] = useState(
    book?.lastPageIndex ?? 0
  );
  const saveTimer = useRef<number | null>(null);

  const cacheRef = useRef(new Map<number, CacheEntry>()); // key: image.pageOrder value: image情報
  const CACHE_RANGE = 3;

  const pageDisplayNumber = currentPageIndex + 1;

  function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    // bytes が SharedArrayBuffer を参照してても、ArrayBuffer にコピーして返す
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
  }

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
    console.log(objectUrl);

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

  const handleChangeRange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!onChangePage) return;
    const nextIndex = Number(e.target.value);
    onChangePage(nextIndex);
  };

  const onChangePage = async (index: number) => {
    setCurrentPageIndex(index);
  };

  // 読んだページの保存処理
  const saveProgress = (nextIndex: number) => {
    window.mangata.updateLastPage(book.id, nextIndex);
  };

  // 前のページ遷移メソッド
  const onPrevPage = useCallback(() => {
    setCurrentPageIndex((i: number) => Math.max(i - 1, 0));
  }, []);

  // 次のページ遷移メソッド
  const onNextPage = useCallback(() => {
    setCurrentPageIndex((i: number) => Math.min(i + 1, book.pageCount - 1));
  }, [book.pageCount]);

  const {
    ref: containerRef,
    isFullscreen,
    toggle,
  } = useFullscreen<HTMLDivElement>();

  useEffect(() => {}, [currentImage]);

  // 初期処理
  useEffect(() => {
    const run = async () => {
      if (id !== undefined) {
        const objectUrl = await getOrLoadObjectUrl(id, currentPageIndex);

        setCurrentImage(objectUrl);
      }
    };

    run();
  }, []);

  // アンマウント時に全解放
  useEffect(() => {
    return () => {
      for (const [, entry] of cacheRef.current)
        URL.revokeObjectURL(entry.objectUrl);
      cacheRef.current.clear();
    };
  }, []);

  // キーボードイベント
  useEffect(() => {
    console.log("keyborad event");

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNextPage, onPrevPage]);

  // pageIndexが変わるたびにでバウンスして保存
  useEffect(() => {
    // 直前のタイマーをクリア
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    //デバウンス：300ミリ秒後に保存
    saveTimer.current = setTimeout(() => {
      saveProgress(currentPageIndex);
    }, 300);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [currentPageIndex]);

  // ページの画像をロード
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const bookId = book.id;

      // 1) 現在ページを表示
      const currentUrl = await getOrLoadObjectUrl(book.id, currentPageIndex);
      if (!cancelled) setCurrentImage(currentUrl);

      // 2) 前後は先読み
      const prefetch = [currentPageIndex - 1, currentPageIndex + 1].filter(
        (i) => i >= 0 && book.pageCount
      );

      await Promise.all(prefetch.map((i) => getOrLoadObjectUrl(bookId, i)));

      // 3) 掃除
      cleanupCache(currentPageIndex);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [currentPageIndex, book.pageCount]);

  useEffect(() => {
    cleanupCache(currentPageIndex);
  }, [currentPageIndex]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111",
        color: "#f5f5f5",
      }}
    >
      {/* 上部バー */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid #333",
          gap: 12,
        }}
      >
        <button onClick={() => nav("/")} style={{ padding: "4px 8px" }}>
          ⬅ Home
        </button>
        <button style={{ marginLeft: 16 }} onClick={toggle}>
          {isFullscreen ? "通常表示" : "全画面"}
        </button>
        <div
          style={{
            fontWeight: "bold",
            fontSize: 16,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={book.title}
        >
          {book.title}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 14 }}>
          {pageDisplayNumber} / {book.pageCount} ページ
        </div>
      </header>

      {/* メイン画像エリア */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: 16,
        }}
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt={`${book.title} - page ${pageDisplayNumber}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              boxShadow: "0 0 16px rgba(0,0,0,0.7)",
              borderRadius: 4,
            }}
          />
        ) : (
          <div style={{ color: "#888" }}>画像を読み込み中...</div>
        )}
      </main>

      {/* 下部コントロールバー */}
      <footer
        style={{
          borderTop: "1px solid #333",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button onClick={onPrevPage} disabled={currentPageIndex <= 0}>
          ◀ 前のページ
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(book.pageCount - 1, 0)}
          value={currentPageIndex}
          onChange={handleChangeRange}
          style={{ flex: 1 }}
        />

        <button
          onClick={onNextPage}
          disabled={currentPageIndex >= book.pageCount - 1}
        >
          次のページ ▶
        </button>

        <div style={{ width: 90, textAlign: "right", fontSize: 12 }}>
          {pageDisplayNumber} / {book.pageCount}
        </div>
      </footer>
    </div>
  );
};

export default Reader;
