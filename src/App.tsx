import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Library from "./screens/Library";
import Reader from "./screens/Reader";
import "./App.css";

function App() {
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
