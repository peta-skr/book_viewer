import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  async function onAdd() {
    const folder = await window.mangata.pickFolder();

    if (!folder) return;
    await window.mangata.addFolder(folder);

    console.log("登録しました");
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Book Viewer</h1>
      <button onClick={onAdd}>📂 フォルダ選択</button>
      <button onClick={() => nav("/library")} style={{ marginLeft: 12 }}>
        📚 ライブラリ
      </button>
    </div>
  );
}
