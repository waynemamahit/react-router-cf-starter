import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DrawingSummary,
  DrawingsResponse,
  Point,
  Rectangle,
  ResizeCorner,
  SavedDrawing,
} from "./canvas.models";

export function meta() {
  return [
    { title: "Canvas | Interactive Drawing Tool" },
    {
      name: "description",
      content:
        "Click to place points, drag to draw rectangles, hold Shift for squares. Select shapes to drag or resize.",
    },
  ];
}

export default function Canvas() {
  const [points, setPoints] = useState<Point[]>([]);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [savedDrawings, setSavedDrawings] = useState<DrawingSummary[]>([]);
  const [drawingName, setDrawingName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentRectangle, setCurrentRectangle] = useState<Rectangle | null>(
    null,
  );
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<ResizeCorner | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null,
  );
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift" && !isShiftPressed) {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isShiftPressed]);

  const fetchDrawings = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/drawings");
      if (!response.ok) {
        throw new Error("Failed to fetch drawings");
      }
      const data = (await response.json()) as DrawingsResponse;
      setSavedDrawings(data.drawings);
    } catch (error) {
      console.error("Error fetching drawings:", error);
      setMessage({ type: "error", text: "Failed to load saved drawings" });
    }
  }, []);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSaveDrawing = async () => {
    if (!drawingName.trim()) {
      setMessage({ type: "error", text: "Please enter a drawing name" });
      return;
    }

    if (drawingName.length > 200) {
      setMessage({
        type: "error",
        text: "Drawing name too long (max 200 characters)",
      });
      return;
    }

    setIsSaving(true);
    try {
      const drawingData = {
        name: drawingName,
        points,
        rectangles,
      };

      const response = await fetch("/api/v1/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drawingData),
      });

      if (!response.ok) {
        throw new Error("Failed to save drawing");
      }

      await response.json();
      setMessage({ type: "success", text: "Drawing saved successfully!" });
      setDrawingName("");
      await fetchDrawings();
    } catch (error) {
      console.error("Error saving drawing:", error);
      setMessage({ type: "error", text: "Failed to save drawing" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDrawing = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/drawings/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load drawing");
      }

      const drawing = (await response.json()) as SavedDrawing;
      setPoints(drawing.points);
      setRectangles(drawing.rectangles);
      setSelectedShapeId(null);
      setMessage({ type: "success", text: `Loaded "${drawing.name}"` });
    } catch (error) {
      console.error("Error loading drawing:", error);
      setMessage({ type: "error", text: "Failed to load drawing" });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRectangle = (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    constrainSquare: boolean,
  ): Rectangle => {
    let width = currentX - startX;
    let height = currentY - startY;

    if (constrainSquare) {
      const size = Math.min(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }

    return {
      id: Date.now(),
      startX,
      startY,
      width,
      height,
    };
  };

  const isPointInRectangle = (
    x: number,
    y: number,
    rect: Rectangle,
  ): boolean => {
    const displayX = rect.width >= 0 ? rect.startX : rect.startX + rect.width;
    const displayY = rect.height >= 0 ? rect.startY : rect.startY + rect.height;
    const displayWidth = Math.abs(rect.width);
    const displayHeight = Math.abs(rect.height);

    return (
      x >= displayX &&
      x <= displayX + displayWidth &&
      y >= displayY &&
      y <= displayY + displayHeight
    );
  };

  const getResizeCorner = (
    x: number,
    y: number,
    rect: Rectangle,
  ): ResizeCorner | null => {
    const displayX = rect.width >= 0 ? rect.startX : rect.startX + rect.width;
    const displayY = rect.height >= 0 ? rect.startY : rect.startY + rect.height;
    const displayWidth = Math.abs(rect.width);
    const displayHeight = Math.abs(rect.height);
    const handleSize = 8;

    if (
      Math.abs(x - displayX) <= handleSize &&
      Math.abs(y - displayY) <= handleSize
    ) {
      return "top-left";
    }
    if (
      Math.abs(x - (displayX + displayWidth)) <= handleSize &&
      Math.abs(y - displayY) <= handleSize
    ) {
      return "top-right";
    }
    if (
      Math.abs(x - displayX) <= handleSize &&
      Math.abs(y - (displayY + displayHeight)) <= handleSize
    ) {
      return "bottom-left";
    }
    if (
      Math.abs(x - (displayX + displayWidth)) <= handleSize &&
      Math.abs(y - (displayY + displayHeight)) <= handleSize
    ) {
      return "bottom-right";
    }
    return null;
  };

  const resizeRectangle = (
    rect: Rectangle,
    corner: ResizeCorner,
    newX: number,
    newY: number,
    constrainSquare: boolean,
  ): Rectangle => {
    const displayX = rect.width >= 0 ? rect.startX : rect.startX + rect.width;
    const displayY = rect.height >= 0 ? rect.startY : rect.startY + rect.height;
    const displayWidth = Math.abs(rect.width);
    const displayHeight = Math.abs(rect.height);

    let newStartX = displayX;
    let newStartY = displayY;
    let newWidth = displayWidth;
    let newHeight = displayHeight;

    if (corner === "top-left") {
      newStartX = newX;
      newStartY = newY;
      newWidth = displayX + displayWidth - newX;
      newHeight = displayY + displayHeight - newY;
    } else if (corner === "top-right") {
      newStartY = newY;
      newWidth = newX - displayX;
      newHeight = displayY + displayHeight - newY;
    } else if (corner === "bottom-left") {
      newStartX = newX;
      newWidth = displayX + displayWidth - newX;
      newHeight = newY - displayY;
    } else if (corner === "bottom-right") {
      newWidth = newX - displayX;
      newHeight = newY - displayY;
    }

    if (constrainSquare) {
      const size = Math.max(Math.abs(newWidth), Math.abs(newHeight));
      newWidth = newWidth >= 0 ? size : -size;
      newHeight = newHeight >= 0 ? size : -size;
    }

    const minSize = 10;
    if (Math.abs(newWidth) < minSize)
      newWidth = newWidth >= 0 ? minSize : -minSize;
    if (Math.abs(newHeight) < minSize)
      newHeight = newHeight >= 0 ? minSize : -minSize;

    return {
      ...rect,
      startX: newStartX,
      startY: newStartY,
      width: newWidth,
      height: newHeight,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    // Check if clicking on a resize handle of the selected shape
    if (selectedShapeId !== null) {
      const selectedShape = rectangles.find((r) => r.id === selectedShapeId);
      if (selectedShape) {
        const corner = getResizeCorner(x, y, selectedShape);
        if (corner) {
          setIsResizing(true);
          setResizeCorner(corner);
          startPointRef.current = { x, y };
          return;
        }
      }
    }

    // Check if clicking on any shape
    for (let i = rectangles.length - 1; i >= 0; i--) {
      const shape = rectangles[i];
      if (isPointInRectangle(x, y, shape)) {
        setSelectedShapeId(shape.id);
        setIsDraggingShape(true);
        const displayX =
          shape.width >= 0 ? shape.startX : shape.startX + shape.width;
        const displayY =
          shape.height >= 0 ? shape.startY : shape.startY + shape.height;
        setDragOffset({ x: x - displayX, y: y - displayY });
        startPointRef.current = { x, y };
        return;
      }
    }

    // Deselect if clicking on canvas background
    setSelectedShapeId(null);

    // Start new shape creation
    startPointRef.current = { x, y };
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const currentX = Math.round(event.clientX - rect.left);
    const currentY = Math.round(event.clientY - rect.top);

    // Handle shape resizing
    if (isResizing && resizeCorner && selectedShapeId !== null) {
      setRectangles((prevRectangles) =>
        prevRectangles.map((r) =>
          r.id === selectedShapeId
            ? resizeRectangle(
                r,
                resizeCorner,
                currentX,
                currentY,
                isShiftPressed,
              )
            : r,
        ),
      );
      return;
    }

    // Handle shape dragging
    if (isDraggingShape && dragOffset && selectedShapeId !== null) {
      setRectangles((prevRectangles) =>
        prevRectangles.map((r) => {
          if (r.id === selectedShapeId) {
            const newDisplayX = currentX - dragOffset.x;
            const newDisplayY = currentY - dragOffset.y;
            return {
              ...r,
              startX: newDisplayX,
              startY: newDisplayY,
            };
          }
          return r;
        }),
      );
      return;
    }

    // Handle new shape creation
    if (isDragging && startPointRef.current) {
      const rectangle = calculateRectangle(
        startPointRef.current.x,
        startPointRef.current.y,
        currentX,
        currentY,
        isShiftPressed,
      );
      setCurrentRectangle(rectangle);
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Handle resize completion
    if (isResizing) {
      setIsResizing(false);
      setResizeCorner(null);
      startPointRef.current = null;
      return;
    }

    // Handle shape drag completion
    if (isDraggingShape) {
      setIsDraggingShape(false);
      setDragOffset(null);
      startPointRef.current = null;
      return;
    }

    // Handle new shape creation
    if (!startPointRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const endX = Math.round(event.clientX - rect.left);
    const endY = Math.round(event.clientY - rect.top);

    const dragThreshold = 5;
    const dragDistance = Math.sqrt(
      (endX - startPointRef.current.x) ** 2 +
        (endY - startPointRef.current.y) ** 2,
    );

    if (dragDistance < dragThreshold) {
      const newPoint: Point = {
        id: Date.now(),
        x: startPointRef.current.x,
        y: startPointRef.current.y,
      };
      setPoints((prevPoints) => [...prevPoints, newPoint]);
    } else if (currentRectangle) {
      setRectangles((prevRectangles) => [...prevRectangles, currentRectangle]);
    }

    setCurrentRectangle(null);
    setIsDragging(false);
    startPointRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Interactive Canvas
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              Click to place points, drag to draw rectangles/squares (hold
              Shift). Click shapes to select, drag to move, use corner handles
              to resize.
            </p>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              Points: {points.length} | Rectangles: {rectangles.length}
            </p>

            {message && (
              <div
                className={`mb-3 md:mb-4 p-3 rounded-lg text-sm md:text-base ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="mb-3 md:mb-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={drawingName}
                onChange={(e) => setDrawingName(e.target.value)}
                placeholder="Enter drawing name..."
                className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                maxLength={200}
              />
              <button
                type="button"
                onClick={handleSaveDrawing}
                disabled={isSaving}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isSaving ? "Saving..." : "Save Drawing"}
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                data-testid="canvas-area"
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-white border-1 md:border-2 border-blue-500 rounded-lg shadow-lg hover:border-blue-600 transition-colors overflow-hidden cursor-crosshair"
              >
                {rectangles.map((rectangle) => {
                  const displayX =
                    rectangle.width >= 0
                      ? rectangle.startX
                      : rectangle.startX + rectangle.width;
                  const displayY =
                    rectangle.height >= 0
                      ? rectangle.startY
                      : rectangle.startY + rectangle.height;
                  const displayWidth = Math.abs(rectangle.width);
                  const displayHeight = Math.abs(rectangle.height);
                  const isSelected = rectangle.id === selectedShapeId;

                  return (
                    <div
                      key={rectangle.id}
                      className={`absolute border-2 bg-opacity-30 pointer-events-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-200 shadow-lg"
                          : "border-green-500 bg-green-100"
                      }`}
                      style={{
                        left: `${displayX}px`,
                        top: `${displayY}px`,
                        width: `${displayWidth}px`,
                        height: `${displayHeight}px`,
                        cursor: isSelected ? "move" : "pointer",
                      }}
                      data-testid={`rectangle-${rectangle.id}`}
                    >
                      <div
                        className={`absolute -top-5 md:-top-6 left-0 text-white text-[10px] md:text-xs font-mono px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md whitespace-nowrap ${
                          isSelected ? "bg-blue-600" : "bg-green-600"
                        }`}
                        data-testid="dimension-label"
                      >
                        W: {displayWidth}, H: {displayHeight}, Area:{" "}
                        {displayWidth * displayHeight}
                      </div>

                      {isSelected && (
                        <>
                          {/* Resize handles */}
                          <div
                            className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize pointer-events-auto"
                            style={{ left: "-5px", top: "-5px" }}
                            data-testid="resize-handle-top-left"
                          />
                          <div
                            className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize pointer-events-auto"
                            style={{ right: "-5px", top: "-5px" }}
                            data-testid="resize-handle-top-right"
                          />
                          <div
                            className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize pointer-events-auto"
                            style={{ left: "-5px", bottom: "-5px" }}
                            data-testid="resize-handle-bottom-left"
                          />
                          <div
                            className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize pointer-events-auto"
                            style={{ right: "-5px", bottom: "-5px" }}
                            data-testid="resize-handle-bottom-right"
                          />
                        </>
                      )}
                    </div>
                  );
                })}

                {currentRectangle && (
                  <div
                    className="absolute border-2 border-dashed border-purple-500 bg-purple-100 bg-opacity-20"
                    style={{
                      left: `${currentRectangle.width >= 0 ? currentRectangle.startX : currentRectangle.startX + currentRectangle.width}px`,
                      top: `${currentRectangle.height >= 0 ? currentRectangle.startY : currentRectangle.startY + currentRectangle.height}px`,
                      width: `${Math.abs(currentRectangle.width)}px`,
                      height: `${Math.abs(currentRectangle.height)}px`,
                    }}
                    data-testid="current-rectangle"
                  >
                    <div
                      className="absolute -top-5 md:-top-6 left-0 bg-purple-600 text-white text-[10px] md:text-xs font-mono px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md whitespace-nowrap"
                      data-testid="current-dimension-label"
                    >
                      W: {Math.abs(currentRectangle.width)}, H:{" "}
                      {Math.abs(currentRectangle.height)}, Area:{" "}
                      {Math.abs(currentRectangle.width) *
                        Math.abs(currentRectangle.height)}
                    </div>
                  </div>
                )}

                {points.map((point) => (
                  <div
                    key={point.id}
                    className="absolute"
                    style={{
                      left: `${point.x}px`,
                      top: `${point.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    data-testid={`point-${point.id}`}
                  >
                    <div className="relative">
                      <div
                        className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"
                        data-testid="point-marker"
                      />
                      <div
                        className="absolute left-3 md:left-4 top-0 bg-blue-600 text-white text-[10px] md:text-xs font-mono px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-md whitespace-nowrap"
                        data-testid="coordinate-label"
                      >
                        X: {point.x}, Y: {point.y}
                      </div>
                    </div>
                  </div>
                ))}

                {points.length === 0 &&
                  rectangles.length === 0 &&
                  !currentRectangle && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-gray-400 text-sm md:text-base lg:text-lg px-4 text-center">
                        Click to place points or drag to draw rectangles
                      </p>
                    </div>
                  )}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                Saved Drawings
              </h2>

              {isLoading && (
                <div className="text-center py-4 text-sm md:text-base text-gray-600">Loading...</div>
              )}

              {!isLoading && savedDrawings.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No saved drawings yet. Create and save your first drawing!
                </p>
              )}

              {!isLoading && savedDrawings.length > 0 && (
                <div className="space-y-2 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
                  {savedDrawings.map((drawing) => (
                    <button
                      key={drawing.id}
                      type="button"
                      onClick={() => handleLoadDrawing(drawing.id)}
                      className="w-full text-left p-2.5 md:p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-medium text-sm md:text-base text-gray-900 truncate">
                        {drawing.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(drawing.createdAt).toLocaleDateString()}{" "}
                        {new Date(drawing.createdAt).toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
