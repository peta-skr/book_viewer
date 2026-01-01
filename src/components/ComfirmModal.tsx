import { useEffect, useRef } from "react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean; // 上書きなど破壊的操作なら true
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title = "確認",
  message,
  confirmText = "OK",
  cancelText = "キャンセル",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // 初期フォーカス
    const id = window.setTimeout(() => {
      (cancelBtnRef.current ?? confirmBtnRef.current)?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      // 簡易フォーカストラップ（Tabが外に出ないように）
      if (e.key === "Tab") {
        const focusables = [cancelBtnRef.current, confirmBtnRef.current].filter(
          Boolean
        ) as HTMLElement[];
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        // 背景クリックで閉じる（モーダル外を押した場合）
        if (e.target === e.currentTarget) onCancel();
      }}
      style={styles.backdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        style={styles.modal}
      >
        <div style={styles.header}>
          <div id="confirm-modal-title" style={styles.title}>
            {title}
          </div>
        </div>

        <div style={styles.body}>{message}</div>

        <div style={styles.footer}>
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            style={{ ...styles.btn, ...styles.btnCancel }}
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            style={{
              ...styles.btn,
              ...(danger ? styles.btnDanger : styles.btnPrimary),
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(520px, 100%)",
    background: "#111",
    color: "#fff",
    borderRadius: 14,
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  body: {
    padding: "14px 16px",
    fontSize: 14,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.85)",
    whiteSpace: "pre-wrap",
  },
  footer: {
    padding: "14px 16px",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    borderTop: "1px solid rgba(255,255,255,0.10)",
  },
  btn: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 14,
    cursor: "pointer",
    background: "transparent",
    color: "#fff",
  },
  btnCancel: {
    background: "rgba(255,255,255,0.06)",
  },
  btnPrimary: {
    background: "rgba(59,130,246,0.9)", // blue
    border: "1px solid rgba(59,130,246,0.9)",
  },
  btnDanger: {
    background: "rgba(239,68,68,0.9)", // red
    border: "1px solid rgba(239,68,68,0.9)",
  },
};
