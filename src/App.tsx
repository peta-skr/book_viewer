import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("...");

  useEffect(() => {
    setMsg(window.mangata?.ping() ?? "no preload");
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Mangata</h1>
      <p>IPC test: {msg}</p>
      <p>ここにライブラリやリーダーUIを後で足していきます。</p>
    </div>
  );
}
export default App;
