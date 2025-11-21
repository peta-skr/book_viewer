import { useEffect, useRef, useState } from "react";

function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = async () => {
    if (!ref.current) return;
    if (!document.fullscreenElement) {
      try {
        await ref.current.requestFullscreen();
      } catch (e) {
        console.error("Failed to enter fullscreen:", e);
      }
    }
  };

  const exit = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.error("Failed to exit fullscreen:", e);
      }
    }
  };

  const toggle = () => {
    if (document.fullscreenElement) {
      exit();
    } else {
      enter();
    }
  };

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  return { ref, isFullscreen, enter, exit, toggle };
}

export default useFullscreen;
