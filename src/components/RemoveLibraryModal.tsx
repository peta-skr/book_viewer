import type { BookInfo } from "../../types/book";

type Props = {
  target: BookInfo | null;
  onClose: () => void;
  onSubmit: () => void;
};

export function RemoveLibraryModal(props: Props) {
  const { target, onClose, onSubmit } = props;
  if (!target) return null;

  return (
    <div className="modal__backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">ライブラリの登録解除</div>
          <button className="btn btn--ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal__body">
          <p className="library__message">
            「{target.title}」を登録解除します。
            <br />
            <strong>PC内のファイルは削除されません。</strong>
          </p>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn btn--primary" onClick={onSubmit}>
            登録解除
          </button>
        </div>
      </div>
    </div>
  );
}
