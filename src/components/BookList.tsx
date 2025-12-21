import type { BookInfo } from "../../types/book";
import { BookCard } from "./BookCard";

export function BookList({
  books,
  onClickBook,
}: {
  books: BookInfo[];
  onClickBook: (book: BookInfo) => void;
}) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={() => onClickBook(book)} />
      ))}
    </div>
  );
}
