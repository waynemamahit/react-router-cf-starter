import type { Shape } from "~/models/canvas";
import { renderCanvas } from "./canvas-render";

export function exportToImage(
    shapes: Shape[], 
    width: number, 
    height: number, 
    format: 'png' | 'jpg'
) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Render without selection state
    renderCanvas(ctx, { shapes, selectedId: null }, width, height);
    
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, format === 'jpg' ? 0.9 : undefined);
    
    downloadFile(dataUrl, `canvas-export.${format}`);
}

export function exportToSvg(shapes: Shape[], width: number, height: number) {
    const svgContent = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    ${shapes.map(s => {
        if (s.type === 'point') {
            return `<circle cx="${s.x}" cy="${s.y}" r="5" fill="#3b82f6" />`;
        }
        if (s.type === 'rectangle') {
            const isSquare = Math.abs(Math.abs(s.width) - Math.abs(s.height)) < 0.5;
            const color = isSquare ? '#8b5cf6' : '#10b981';
            return `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1" />`;
        }
        return '';
    }).join('\n')}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'canvas-export.svg');
    URL.revokeObjectURL(url);
}

function downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
