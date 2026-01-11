import type { BookInfo, LibrarySortValue } from "../../types/book";

export function sortBooks(list: BookInfo[], sort: LibrarySortValue) {
  const copy = [...list];

  switch (sort) {
    case "title_asc":
      return copy.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    case "title_desc":
      return copy.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""));
    case "created_asc":
      return copy.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    case "created_desc":
      return copy.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    default:
      return copy;
  }
}
