import type { LibrarySortValue } from "../../types/book";

type Props = {
  value: LibrarySortValue;
  onChange: (next: LibrarySortValue) => void;
};

export function LibrarySortControl({ value, onChange }: Props) {
  return (
    <div className="librarySort">
      <span className="librarySort__label">並び替え</span>

      <select
        className="librarySort__select"
        value={value}
        onChange={(e) => onChange(e.target.value as LibrarySortValue)}
        aria-label="並び替え"
      >
        <option value="created_desc">追加日：新しい順</option>
        <option value="created_asc">追加日：古い順</option>
        <option value="title_asc">タイトル：昇順</option>
        <option value="title_desc">タイトル：降順</option>
      </select>
    </div>
  );
}
