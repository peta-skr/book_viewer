import { ConfirmModal } from "./ComfirmModal";

type Props = {
  open: boolean;
  pickedFolder: string;
  title: string;
  setTitle: (v: string) => void;
  canSubmit: boolean;
  onPickFolder: () => void;
  onClose: () => void;
  onSubmit: () => void;

  overwriteConfirmOpen: boolean;
  onCancelOverwrite: () => void;
  onConfirmOverwrite: () => void;
};

export function AddLibraryModal(props: Props) {
  const {
    open,
    pickedFolder,
    title,
    setTitle,
    canSubmit,
    onPickFolder,
    onClose,
    onSubmit,
    overwriteConfirmOpen,
    onCancelOverwrite,
    onConfirmOverwrite,
  } = props;

  if (!open) {
    // ConfirmModal は別で出すので、ここは null
    return (
      <ConfirmModal
        open={overwriteConfirmOpen}
        title="上書き確認"
        message={
          <>
            このフォルダは既に登録されています。
            <br />
            上書きしますか？
          </>
        }
        cancelText="キャンセル"
        confirmText="上書きする"
        danger
        onCancel={onCancelOverwrite}
        onConfirm={onConfirmOverwrite}
      />
    );
  }

  return (
    <>
      <div className="modal__backdrop" onMouseDown={onClose}>
        <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal__header">
            <div className="modal__title">ライブラリ追加</div>
            <button className="btn btn--ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="modal__body">
            <div className="field">
              <div className="field__label">フォルダ</div>
              <div className="field__row">
                <button className="btn" onClick={onPickFolder}>
                  📂 フォルダ選択
                </button>
                <div className="field__value" title={pickedFolder}>
                  {pickedFolder ? pickedFolder : "未選択"}
                </div>
              </div>
            </div>

            <div className="field">
              <div className="field__label">タイトル</div>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：青年誌 / ラノベ / お気に入り"
              />
            </div>
          </div>

          <div className="modal__footer">
            <button className="btn btn--ghost" onClick={onClose}>
              キャンセル
            </button>
            <button
              className="btn btn--primary"
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              登録
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={overwriteConfirmOpen}
        title="上書き確認"
        message={
          <>
            このフォルダは既に登録されています。
            <br />
            上書きしますか？
          </>
        }
        cancelText="キャンセル"
        confirmText="上書きする"
        danger
        onCancel={onCancelOverwrite}
        onConfirm={onConfirmOverwrite}
      />
    </>
  );
}
