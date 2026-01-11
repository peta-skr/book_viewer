type Props = {
  open: boolean;
  title: string;
  setTitle: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function RenameLibraryModal(props: Props) {
  const { open, title, setTitle, onClose, onSubmit } = props;
  if (!open) return null;

  return (
    <div className="modal__backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">ライブラリ名の変更</div>
          <button className="btn btn--ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal__body">
          <div className="field">
            <div className="field__label">新しいタイトル</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>
            キャンセル
          </button>
          <button
            className="btn btn--primary"
            onClick={onSubmit}
            disabled={!title.trim()}
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
}
