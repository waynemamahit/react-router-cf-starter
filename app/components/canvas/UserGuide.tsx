import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const ignoreBackdropRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    ignoreBackdropRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropRef.current = false;
    }, 200);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-default"
        tabIndex={-1}
        aria-label="Dismiss canvas guide"
        onClick={() => {
          if (ignoreBackdropRef.current) return;
          onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="canvas-guide-title"
        className="relative bg-base-100 border border-base-300 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h2 id="canvas-guide-title" className="text-lg font-bold">
            Canvas Guide
          </h2>
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-square"
            aria-label="Close guide"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-1">Creating Shapes</h3>
            <ul className="list-disc list-inside space-y-1 text-base-content/70">
              <li>
                <strong>Point:</strong> Click on an empty area
              </li>
              <li>
                <strong>Rectangle:</strong> Click and drag on empty area
              </li>
              <li>
                <strong>Square:</strong> Hold{" "}
                <kbd className="kbd kbd-xs">Shift</kbd> while dragging
              </li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">Selecting</h3>
            <ul className="list-disc list-inside space-y-1 text-base-content/70">
              <li>Click on a shape to select it</li>
              <li>Click on empty area to deselect</li>
              <li>Selected shapes show orange highlights</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">Modifying</h3>
            <ul className="list-disc list-inside space-y-1 text-base-content/70">
              <li>
                <strong>Move:</strong> Drag a selected rectangle/square
              </li>
              <li>
                <strong>Resize:</strong> Drag corner handles of selected
                rectangle/square
              </li>
              <li>
                <strong>Delete:</strong> Press{" "}
                <kbd className="kbd kbd-xs">Delete</kbd> or click Delete button
              </li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">Undo / Redo</h3>
            <ul className="list-disc list-inside space-y-1 text-base-content/70">
              <li>
                <strong>Undo:</strong> <kbd className="kbd kbd-xs">Ctrl</kbd> +{" "}
                <kbd className="kbd kbd-xs">Z</kbd> or click Undo
              </li>
              <li>
                <strong>Redo:</strong> <kbd className="kbd kbd-xs">Ctrl</kbd> +{" "}
                <kbd className="kbd kbd-xs">Shift</kbd> +{" "}
                <kbd className="kbd kbd-xs">Z</kbd> or click Redo
              </li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">Export</h3>
            <ul className="list-disc list-inside space-y-1 text-base-content/70">
              <li>
                Export your canvas as PNG, JPG, or SVG using the Export menu
              </li>
              <li>Selection highlights and labels are excluded from export</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">Persistence</h3>
            <ul className="list-disc list-inside space-y-1 text-base-content/70">
              <li>Canvas state is auto-saved to your browser</li>
              <li>Your work will be restored when you revisit</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
