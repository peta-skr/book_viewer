import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;

  // UI用（任意）
  totalCount?: number; // 全件
  filteredCount?: number; // 検索後件数
  placeholder?: string;
};

export function LibrarySearchBar({
  value,
  onChange,
  totalCount,
  filteredCount,
  placeholder = "タイトルで検索",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Escでクリア
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onChange("");
        inputRef.current?.focus();
      }

      // Ctrl + F / Cmd + Fで検索欄フォーカス
      if ((e.ctrlKey || e.metaKey) && e.key.toLocaleLowerCase() === "f") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onChange]);

  const showCount = useMemo(() => {
    if (typeof totalCount !== "number") return null;
    if (typeof filteredCount !== "number") return `${totalCount}`;
    return `${filteredCount} / ${totalCount}`;
  }, [totalCount, filteredCount]);

  return (
    <div className="librarySearchBar">
      {/* 左：虫眼鏡（簡易） */}
      <span style={{ opacity: 0.7, userSelect: "none" }}>🔎</span>

      {/* 入力欄 */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="librarySearchBar__input"
      />

      {/* クリアボタン（入力がある時だけ） */}
      <button
        type="button"
        onClick={() => {
          onChange("");
          inputRef.current?.focus();
        }}
        aria-label="検索をクリア"
        className="librarySearchBar__clear"
        style={{
          visibility: value.length > 0 ? "visible" : "hidden",
          pointerEvents: value.length > 0 ? "auto" : "none",
        }}
      >
        ✕
      </button>
      {/* 件数表示（任意） */}
      {showCount && (
        <span
          style={{
            fontSize: 12,
            opacity: 0.7,
            minWidth: 64,
            textAlign: "right",
          }}
        >
          {showCount}
        </span>
      )}
    </div>
  );
}
