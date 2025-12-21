import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  async function handleRegisterFolder() {
    const folder = await window.mangata.pickFolder();
    const t = toast.loading("登録中...");
    try {
      if (!folder) return;
      const ok = await window.mangata.addFolder(folder);
      if (!ok) {
        toast.error("登録できませんでした", { id: t });
        return;
      }
      toast.success("登録しました", { id: t });
    } catch (error) {
      console.error(error);
      toast.error("登録できませんでした", { id: t });
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Book Viewer</h1>
      <button onClick={handleRegisterFolder}>📂 フォルダ選択</button>
      <button onClick={() => nav("/library")} style={{ marginLeft: 12 }}>
        📚 ライブラリ
      </button>
    </div>
  );
}
