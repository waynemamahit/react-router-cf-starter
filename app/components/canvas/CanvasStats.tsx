import type { CanvasStats as Stats } from "~/types/canvas";

interface CanvasStatsProps {
  stats: Stats;
}

export default function CanvasStats({ stats }: CanvasStatsProps) {
  return (
    <div className="flex items-center gap-4 p-3 text-sm">
      <span className="stat">
        <span className="stat-title text-xs">Points</span>
        <span className="stat-value text-lg">{stats.points}</span>
      </span>
      <span className="stat">
        <span className="stat-title text-xs">Rectangles</span>
        <span className="stat-value text-lg">{stats.rectangles}</span>
      </span>
      <span className="stat">
        <span className="stat-title text-xs">Squares</span>
        <span className="stat-value text-lg">{stats.squares}</span>
      </span>
    </div>
  );
}
