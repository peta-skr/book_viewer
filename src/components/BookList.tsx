import type { BookInfo } from "../../types/book";
import { BookCard } from "./BookCard";

type Props = {
  books: BookInfo[];
  onClickBook: (book: BookInfo) => void;
  onRenameBook: (book: BookInfo) => void;
  onRemoveBook: (book: BookInfo) => void;
};

export function BookList({
  books,
  onClickBook,
  onRenameBook,
  onRemoveBook,
}: Props) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onClickBook(book)}
          onRename={() => onRenameBook(book)}
          onRemove={() => onRemoveBook(book)}
        />
      ))}
    </div>
  );
}
