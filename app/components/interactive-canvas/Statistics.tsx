import type { Shape } from "~/models/canvas";
import { isSquare } from "~/utils/geometry";

interface StatisticsProps {
  shapes: Shape[];
}

export function Statistics({ shapes }: StatisticsProps) {
  const points = shapes.filter(s => s.type === 'point').length;
  // Distinguish squares from rectangles
  const rectangles = shapes.filter(s => 
    s.type === 'rectangle' && !isSquare((s as any).width, (s as any).height)
  ).length;
  const squares = shapes.filter(s => 
    s.type === 'rectangle' && isSquare((s as any).width, (s as any).height)
  ).length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full">
      <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Statistics</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
            <span className="text-gray-600">Points:</span>
            <span className="font-mono font-medium">{points}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-600">Rectangles:</span>
            <span className="font-mono font-medium">{rectangles}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-600">Squares:</span>
            <span className="font-mono font-medium">{squares}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between font-medium">
            <span className="text-gray-800">Total:</span>
            <span className="font-mono">{shapes.length}</span>
        </div>
      </div>
    </div>
  );
}
