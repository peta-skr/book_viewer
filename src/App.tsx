import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./screens/Home";
import Library from "./screens/Library";
import Reader from "./screens/Reader";

async function onSelectFolder() {
  const result = await window.mangata.pickFolder();

  if (!result) {
    alert("キャンセルされました");
    return;
  }

  console.log("選択フォルダ:", result);

  const addResult = await window.mangata.addFolder(result);

  console.log(addResult);
}

async function onListFolder() {
  const result = await window.mangata.listFolder();

  console.log(result);
}

function App() {
  const [msg, setMsg] = useState("...");

  useEffect(() => {
    setMsg(window.mangata?.ping() ?? "no preload");
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/book/:id" element={<Reader />} />
      </Routes>
    </HashRouter>
  );
}
export default App;
