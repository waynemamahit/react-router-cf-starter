import { CanvasContainer } from "~/components/interactive-canvas/CanvasContainer";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Interactive Canvas | React Router App" },
    { name: "description", content: "Create and manipulate shapes on an interactive canvas." },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  // Keeping context access pattern if needed for future, but returning empty or basic data
  return { };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
       <CanvasContainer />
    </div>
  );
}
