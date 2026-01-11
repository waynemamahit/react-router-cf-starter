import { useEffect, useRef, useState } from "react";
import type { CanvasState, Corner, Point, Rectangle, Shape } from "~/models/canvas";
import { renderCanvas } from "~/utils/canvas-render";
import {
  getDistance,
  hitTestResizeHandle,
  hitTestShape,
  sortShapesForHitTest,
  sortShapesForRendering
} from "~/utils/geometry";

const CURSORS = {
  CROSSHAIR: `url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V22M2 12H22" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M12 2V22M2 12H22" stroke="black" stroke-width="1" stroke-linecap="round"/></svg>') 12 12, crosshair`,
  MOVE: `url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V22M2 12H22M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M12 2V22M2 12H22M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15" stroke="black" stroke-width="1" stroke-linecap="round"/></svg>') 12 12, move`,
  POINTER: `url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2L17.5 12.5L13 13.5L16 19.5L13.5 21L10.5 15L6 19.5V2Z" fill="white" stroke="white" stroke-width="2"/><path d="M7 2L17.5 12.5L13 13.5L16 19.5L13.5 21L10.5 15L6 19.5V2Z" fill="black"/></svg>') 4 2, pointer`,
  RESIZE: 'nwse-resize'
};

interface CanvasProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[], isTransient: boolean) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function Canvas({ shapes, onShapesChange, selectedId, onSelect }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [interactionStart, setInteractionStart] = useState<{x: number, y: number} | null>(null);
  const [activeShapeId, setActiveShapeId] = useState<string | null>(null); // For creating/dragging
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<Corner | null>(null);
  
  // Snapshot of shape before interaction (for resize/move calculations)
  const [initialShapeState, setInitialShapeState] = useState<Shape | null>(null);
  
  // Canvas dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions(prev => {
          // Avoid tiny updates that might cause loops
          if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
            return prev;
          }
          return { width, height };
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  // No manual ref-based cursor management needed anymore.
  // We use the 'cursor' state bound to the style prop.


  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.round(dimensions.width * dpr);
    const targetHeight = Math.round(dimensions.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${dimensions.width}px`;
      canvas.style.height = `${dimensions.height}px`;
    }
    
    // Sort shapes: Points on top
    const sortedShapes = sortShapesForRendering(shapes);
    
    const state: CanvasState = {
      shapes: sortedShapes,
      selectedId,
      hoveredShapeId, // Pass hovered ID to render for potential future effects
      isDragging,
      isResizing,
      resizeCorner
    };
    
    renderCanvas(ctx, state, dimensions.width, dimensions.height);
  }, [dimensions, shapes, selectedId, hoveredShapeId, isDragging, isResizing, resizeCorner]);
  
  // Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Set pointer capture to handle dragging outside canvas bounds
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // 1. Resize Handle Hit Test
    if (selectedId) {
      const selectedShape = shapes.find(s => s.id === selectedId);
      if (selectedShape && selectedShape.type === 'rectangle') {
        const handle = hitTestResizeHandle(selectedShape as Rectangle, offsetX, offsetY);
        if (handle) {
          setIsResizing(true);
          setResizeCorner(handle);
          setInteractionStart({ x: offsetX, y: offsetY });
          setActiveShapeId(selectedId);
          setInitialShapeState({ ...selectedShape });
          return;
        }
      }
    }
    
    // 2. Shape Hit Test
    const hitCandidates = sortShapesForHitTest(shapes);
    const hitShape = hitCandidates.find(s => hitTestShape(s, offsetX, offsetY));
    
    if (hitShape) {
      onSelect(hitShape.id);
      setIsDragging(true);
      setInteractionStart({ x: offsetX, y: offsetY });
      setActiveShapeId(hitShape.id);
      setInitialShapeState({ ...hitShape });
      return;
    }
    
    // 3. New Shape Start
    onSelect(null);
    setIsDragging(false);
    setActiveShapeId(null);
    setInitialShapeState(null);
    setInteractionStart({ x: offsetX, y: offsetY });
  };
  
  const updateCursor = (offsetX: number, offsetY: number) => {
    if (!canvasRef.current) return;
    
    if (isResizing) {
      canvasRef.current.style.cursor = CURSORS.RESIZE;
      return;
    }
    
    if (isDragging) {
      canvasRef.current.style.cursor = CURSORS.MOVE;
      return;
    }

    const hitCandidates = sortShapesForHitTest(shapes);
    const hitShape = hitCandidates.find(s => hitTestShape(s, offsetX, offsetY));
    
    const selectedShape = selectedId ? shapes.find(s => s.id === selectedId) : null;
    const isOverHandle = selectedShape?.type === 'rectangle' && 
                         hitTestResizeHandle(selectedShape as Rectangle, offsetX, offsetY);

    if (isOverHandle) {
      canvasRef.current.style.cursor = CURSORS.POINTER;
    } else if (hitShape) {
      canvasRef.current.style.cursor = CURSORS.MOVE;
    } else {
      canvasRef.current.style.cursor = CURSORS.CROSSHAIR;
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updateCursor(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY, shiftKey } = e.nativeEvent;
    
    // Always update cursor feel
    updateCursor(offsetX, offsetY);
    
    // Hover Logic (when not interacting)
    if (!interactionStart) {
      const hitCandidates = sortShapesForHitTest(shapes);
      const hitShape = hitCandidates.find(s => hitTestShape(s, offsetX, offsetY));
      setHoveredShapeId(hitShape ? hitShape.id : null);
      return;
    }
    
    if (!interactionStart) return;
    const dx = offsetX - interactionStart.x;
    const dy = offsetY - interactionStart.y;
    
    // Creating New Shape (Drag)
    if (!activeShapeId && !initialShapeState) {
        if (getDistance(offsetX, offsetY, interactionStart.x, interactionStart.y) > 5) {
            // Start creating rectangle
            const newId = crypto.randomUUID();
            const newRect: Rectangle = {
                id: newId,
                type: 'rectangle',
                x: interactionStart.x,
                y: interactionStart.y,
                width: dx,
                height: dy,
                createdAt: Date.now()
            };
            onShapesChange([...shapes, newRect], true); // Transient update
            setActiveShapeId(newId);
            onSelect(newId);
            setInitialShapeState(newRect); // Treat the new rect as the one being modified
        }
        return;
    }
    
    // Modifying Shape
    if (activeShapeId && initialShapeState) {
        const currentShapes = shapes.map(s => {
             if (s.id !== activeShapeId) return s;
             
             if (isResizing && resizeCorner && initialShapeState.type === 'rectangle') {
                 // RESIZE LOGIC (Anchor Point Approach)
                 const r = initialShapeState as Rectangle;
                 
                 // 1. Get Normalized Bounds of the Initial Shape
                 // This ensures we always work with physical top/left/width/height locally
                 const initX = r.width >= 0 ? r.x : r.x + r.width;
                 const initY = r.height >= 0 ? r.y : r.y + r.height;
                 const initW = Math.abs(r.width);
                 const initH = Math.abs(r.height);

                 // 2. Identify the fixed Anchor Point (Opposite to the dragged handle)
                 // And the Starting Point of the handle being dragged
                 let anchorX = 0;
                 let anchorY = 0;
                 let startHandleX = 0;
                 let startHandleY = 0;

                 if (resizeCorner === 'tl') {
                     anchorX = initX + initW; anchorY = initY + initH;
                     startHandleX = initX; startHandleY = initY;
                 } else if (resizeCorner === 'tr') {
                     anchorX = initX; anchorY = initY + initH;
                     startHandleX = initX + initW; startHandleY = initY;
                 } else if (resizeCorner === 'bl') {
                     anchorX = initX + initW; anchorY = initY;
                     startHandleX = initX; startHandleY = initY + initH;
                 } else if (resizeCorner === 'br') {
                     anchorX = initX; anchorY = initY;
                     startHandleX = initX + initW; startHandleY = initY + initH;
                 }

                 // 3. Calculate New Handle Position
                 const currentHandleX = startHandleX + dx;
                 const currentHandleY = startHandleY + dy;

                 // 4. Calculate New Raw Dimensions relative to Anchor
                 // Note: These can be negative if we cross the anchor (flip)
                 let rawNewW = currentHandleX - anchorX;
                 let rawNewH = currentHandleY - anchorY;

                 // 5. Apply Aspect Ratio Constraint (Square)
                 if (shiftKey) {
                     // Use the larger dimension to drive the size
                     const size = Math.max(Math.abs(rawNewW), Math.abs(rawNewH));
                     // Preserve direction relative to anchor
                     const signW = rawNewW < 0 ? -1 : 1;
                     const signH = rawNewH < 0 ? -1 : 1;
                     
                     rawNewW = size * signW;
                     rawNewH = size * signH;
                 }

                 // 6. Final Normalize
                 // We convert back to standard x, y (top-left) + positive width/height
                 const finalW = Math.abs(rawNewW);
                 const finalH = Math.abs(rawNewH);
                 
                 // If raw width is negative, it means we are to the left of anchor
                 // So the new Top-Left X is (AnchorX + rawNewW)
                 // If raw width is positive, we are to the right, so Top-Left X is AnchorX
                 const finalX = rawNewW < 0 ? anchorX + rawNewW : anchorX;
                 const finalY = rawNewH < 0 ? anchorY + rawNewH : anchorY;

                 return { ...s, x: finalX, y: finalY, width: finalW, height: finalH };
                 
             } else if (isDragging) {
                 // MOVE LOGIC
                 return { 
                     ...s, 
                     x: initialShapeState.x + dx, 
                     y: initialShapeState.y + dy 
                 };
             } else {
                 // CREATION RESIZE LOGIC (bottom-right only effectively)
                 const r = initialShapeState as Rectangle; // Assuming creation is always rect for now
                 if (r.type !== 'rectangle') return s;
                 
                 // Start is always top-left of creation
                 let width = offsetX - r.x;
                 let height = offsetY - r.y; // using r.x/y as origin since it was set at start
                 
                 if (shiftKey) {
                     const size = Math.max(Math.abs(width), Math.abs(height));
                     width = (width < 0 ? -1 : 1) * size;
                     height = (height < 0 ? -1 : 1) * size;
                 }
                 return { ...s, width, height };
             }
        });
        
        onShapesChange(currentShapes, true); // Transient
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Click Creation (Point)
    if (interactionStart && !activeShapeId) {
      if (getDistance(offsetX, offsetY, interactionStart.x, interactionStart.y) < 5) {
         const newPoint: Point = {
             id: crypto.randomUUID(),
             type: 'point',
             x: offsetX,
             y: offsetY,
             createdAt: Date.now()
         };
         // Final commit
         onShapesChange([...shapes, newPoint], false);
      }
    } else if (activeShapeId) {
        // Finished Drag/Resize - Commit
        onShapesChange(shapes, false); // Commit the current state
    }
    
    setInteractionStart(null);
    setActiveShapeId(null);
    setInitialShapeState(null);
    setIsDragging(false);
    setIsResizing(false);
    setResizeCorner(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative select-none">
      <canvas
        ref={canvasRef}
        className="block touch-none w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerEnter={handlePointerEnter}
      />
    </div>
  );
}
