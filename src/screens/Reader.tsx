// Reader.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { BookInfo, ImageInfo } from "../../types/book";
import useFullscreen from "../hooks/useFullscreen";

const Reader: React.FC = () => {
  const { id } = useParams(); // urlのパラメータ取得
  const nav = useNavigate();
  const location = useLocation(); // 遷移元が渡した状態を取得
  const book = location.state?.book;

  const [currentImage, setCurrentImage] = useState<ImageInfo>(); // 現在のImage情報を保持
  const [currentPageIndex, setCurrentPageIndex] = useState(
    book?.currentPageIndex ?? 0
  );

  let cacheRef = useRef(new Map<number, ImageInfo>()); // key: image.pageOrder value: image情報
  const pageDisplayNumber = currentPageIndex + 1;

  const handleChangeRange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!onChangePage) return;
    const nextIndex = Number(e.target.value);
    onChangePage(nextIndex);
  };

  const onChangePage = (index: number) => {
    console.log(cacheRef.current.get(index));
    console.log(cacheRef.current);

    setCurrentPageIndex(index);
    setCurrentImage(cacheRef.current.get(index));
  };

  // 前のページ遷移メソッド
  const onPrevPage = () => {
    onChangePage(Math.max(currentPageIndex - 1, 0));
  };

  // 次のページ遷移メソッド
  const onNextPage = () => {
    onChangePage(Math.min(currentPageIndex + 1, book?.pageCount));
  };

  const {
    ref: containerRef,
    isFullscreen,
    toggle,
  } = useFullscreen<HTMLDivElement>();

  useEffect(() => {
    console.log(currentImage);
  }, [currentImage]);

  // 初期処理
  useEffect(() => {
    const run = async () => {
      if (id !== undefined) {
        const imgs = await window.mangata.loadBook(id);
        console.log(imgs);

        for (let img of imgs) {
          cacheRef.current.set(img.pageOrder, img);
        }

        setCurrentImage(cacheRef.current.get(currentPageIndex));
      }
    };

    run();
  }, []);

  // キーボードイベント
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNextPage, onPrevPage]);

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
        {currentImage?.imagePath ? (
          <img
            src={currentImage.imagePath}
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
          max={Math.max(book.totalPages - 1, 0)}
          value={currentPageIndex}
          onChange={handleChangeRange}
          style={{ flex: 1 }}
        />

        <button
          onClick={onNextPage}
          disabled={currentPageIndex >= book.totalPages - 1}
        >
          次のページ ▶
        </button>

        <div style={{ width: 90, textAlign: "right", fontSize: 12 }}>
          {pageDisplayNumber} / {book.totalPages}
        </div>
      </footer>
    </div>
  );
};

export default Reader;
