import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import type { BookInfo } from "../../types/book";
import { BookList } from "../components/BookList";
import { LibrarySearchBar } from "../components/SearchBar";
import { LibrarySortControl } from "../components/LibrarySortControl";

import { useBooks } from "../hooks/useBooks";
import { useLibraryView } from "../hooks/useLibraryView";
import { useAddLibrary } from "../hooks/useAddLibrary";
import { useRenameLibrary } from "../hooks/useRenameLibrary";
import { useRemoveLibrary } from "../hooks/useRemoveLibrary";

import { AddLibraryModal } from "../components/AddLibraryModal";
import { RenameLibraryModal } from "../components/RenameLibraryModal.tsx";
import { RemoveLibraryModal } from "../components/RemoveLibraryModal.tsx";

export default function LibraryPage() {
  const nav = useNavigate();

  const { bookList, loading, reload } = useBooks();
  const view = useLibraryView(bookList, loading);

  const { add, overwrite } = useAddLibrary({ reload });
  const { rename } = useRenameLibrary({ reload });
  const { remove } = useRemoveLibrary({ reload });

  const onClickBook = useCallback(
    (book: BookInfo) => {
      nav(`/book/${book.id}`, { state: { book } });
    },
    [nav]
  );

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__headerLeft">
          <LibrarySearchBar
            value={view.search}
            onChange={view.setSearch}
            placeholder="タイトルで検索"
            totalCount={bookList.length}
            filteredCount={view.filteredBooks.length}
          />
          <div className="library__subtitle">{view.bookCountText}</div>
        </div>

        <div className="library__headerRight">
          <LibrarySortControl value={view.sort} onChange={view.setSort} />
          <button className="btn btn--primary" onClick={add.openModal}>
            ＋ ライブラリ追加
          </button>
        </div>
      </header>

      <section className="library__content">
        {loading && <p className="library__message">読み込み中...</p>}

        {!loading && bookList.length === 0 && (
          <div className="library__empty">
            <p className="library__message">まだ本が登録されていません。</p>
            <button className="btn" onClick={add.openModal}>
              ＋ ライブラリ追加
            </button>
          </div>
        )}

        {!loading && bookList.length > 0 && view.filteredBooks.length === 0 && (
          <p className="library__message">
            「{view.search}」に一致する本はありません
          </p>
        )}

        {!loading && view.filteredBooks.length > 0 && (
          <BookList
            books={view.sortedBooks}
            onClickBook={onClickBook}
            onRenameBook={rename.open}
            onRemoveBook={remove.open}
          />
        )}
      </section>

      <AddLibraryModal
        open={add.open}
        pickedFolder={add.pickedFolder}
        title={add.title}
        setTitle={add.setTitle}
        canSubmit={add.canSubmit}
        onPickFolder={add.pickFolder}
        onClose={add.closeModal}
        onSubmit={add.submit}
        overwriteConfirmOpen={overwrite.open}
        onCancelOverwrite={overwrite.cancel}
        onConfirmOverwrite={overwrite.confirm}
      />

      <RenameLibraryModal
        open={!!rename.target}
        title={rename.title}
        setTitle={rename.setTitle}
        onClose={rename.close}
        onSubmit={rename.submit}
      />

      <RemoveLibraryModal
        target={remove.target}
        onClose={remove.close}
        onSubmit={remove.submit}
      />
    </div>
  );
}
