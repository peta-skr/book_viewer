import { useMemo, useState } from "react";
import type { BookInfo, LibrarySortValue } from "../../types/book";
import { sortBooks } from "../utils/sort";

export function useLibraryView(bookList: BookInfo[], loading: boolean) {
  const [sort, setSort] = useState<LibrarySortValue>("created_desc");
  const [search, setSearch] = useState("");

  const bookCountText = useMemo(() => {
    if (loading) return "読み込み中…";
    return `${bookList.length} 冊`;
  }, [loading, bookList.length]);

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookList;
    return bookList.filter((b) => (b.title ?? "").toLowerCase().includes(q));
  }, [bookList, search]);

  const sortedBooks = useMemo(() => {
    return sortBooks(filteredBooks, sort);
  }, [filteredBooks, sort]);

  return {
    sort,
    setSort,
    search,
    setSearch,
    bookCountText,
    filteredBooks,
    sortedBooks,
  };
}
