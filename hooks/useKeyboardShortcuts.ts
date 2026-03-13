import { useEffect } from "react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useAnnotationActions } from "./useAnnotationActions";

export const useKeyboardShortcuts = () => {
  const { nextImage, prevImage, isEditing, showShortcuts, setShowShortcuts, setEditing } = useDatasetStore();
  const { onApprove, onUnclear, onReject } = useAnnotationActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts with F1 regardless of focus
      if (e.key === "F1") {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
        return;
      }

      if (e.key === "Escape" && showShortcuts) {
        setShowShortcuts(false);
        return;
      }

      // Disable shortcuts when typing in an input or if editing is active (except for Escape to cancel editing)
      const isInputFocused = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA";
      if (isInputFocused || isEditing || showShortcuts) return;

      const key = e.key.toLowerCase();

      // F2 specifically for renaming
      if (e.key === "F2") {
        e.preventDefault();
        setEditing(true);
        return;
      }

      switch (key) {
        case "w":
        case "enter":
          onApprove();
          break;
        case "u":
          onUnclear();
          break;
        case "s":
        case "r":
          onReject();
          break;
        case "d":
        case "arrowright":
          nextImage();
          break;
        case "a":
        case "arrowleft":
          prevImage();
          break;
        case "e":
          e.preventDefault();
          setEditing(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onApprove, onUnclear, onReject, nextImage, prevImage, isEditing, showShortcuts, setShowShortcuts, setEditing]);
};
