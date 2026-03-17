import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Converts a File to a base64-encoded string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error(`Failed to convert ${file.name} to base64.`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
};

/**
 * Renders all pages of a PDF and stitches them into a specified number of
 * composite images (vertically stacked). This is needed because Groq's
 * vision model supports a max of 5 images total.
 *
 * @param file - PDF file to process
 * @param maxImages - Maximum number of composite images to produce
 * @returns Array of base64 PNG strings
 */
export const pdfToStitchedImages = async (file: File, maxImages: number): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  // Render all pages to individual canvases first
  const scale = 1.5;
  const pageCanvases: { canvas: HTMLCanvasElement; width: number; height: number }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    pageCanvases.push({ canvas, width: viewport.width, height: viewport.height });
  }

  // If pages fit within maxImages, return them individually
  if (numPages <= maxImages) {
    return pageCanvases.map(({ canvas }) => canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
  }

  // Otherwise, stitch pages into composite images
  const pagesPerImage = Math.ceil(numPages / maxImages);
  const compositeImages: string[] = [];

  for (let g = 0; g < maxImages; g++) {
    const startIdx = g * pagesPerImage;
    const endIdx = Math.min(startIdx + pagesPerImage, numPages);
    const groupPages = pageCanvases.slice(startIdx, endIdx);

    if (groupPages.length === 0) break;

    // Calculate composite canvas dimensions
    const maxWidth = Math.max(...groupPages.map(p => p.width));
    const totalHeight = groupPages.reduce((sum, p) => sum + p.height, 0);

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = maxWidth;
    compositeCanvas.height = totalHeight;
    const ctx = compositeCanvas.getContext('2d')!;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, maxWidth, totalHeight);

    // Draw each page vertically
    let yOffset = 0;
    for (const page of groupPages) {
      ctx.drawImage(page.canvas, 0, yOffset);
      yOffset += page.height;
    }

    // Use JPEG with decent quality to keep size manageable
    const base64 = compositeCanvas.toDataURL('image/jpeg', 0.75).split(',')[1];
    compositeImages.push(base64);
  }

  return compositeImages;
};