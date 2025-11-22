import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./screens/Home";
import Library from "./screens/Library";
import Reader from "./screens/Reader";

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
