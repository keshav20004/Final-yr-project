import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdf.js to ensure it works in a web environment.
// The URL points to a trusted CDN (esm.sh) for the worker script.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

export interface PdfContent {
  text: string;
  images: {
    mimeType: 'image/jpeg';
    data: string; // base64 encoded string without the data URL prefix
  }[];
}


/**
 * Extracts text and images from each page of a PDF file.
 * @param file The PDF file to process.
 * @returns A promise that resolves to an object containing the full text and an array of base64-encoded images.
 */
export const extractTextAndImagesFromPdf = async (file: File): Promise<PdfContent> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    const images: { mimeType: 'image/jpeg'; data: string }[] = [];
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Could not create canvas context');
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // 1. Extract Text
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter(item => 'str' in item)
        .map(item => (item as { str: string }).str)
        .join(' ');
      fullText += pageText + '\n\n';

      // 2. Extract Image
      const viewport = page.getViewport({ scale: 1.5 }); // Use a higher scale for better image quality
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
      // Strip the data URL prefix to get the pure base64 string
      const base64Data = dataUrl.split(',')[1];
      if (base64Data) {
        images.push({
            mimeType: 'image/jpeg',
            data: base64Data
        });
      }
    }
    
    // Cleanup canvas
    canvas.remove();

    return { text: fullText.trim(), images };
  } catch (error) {
    console.error('Error extracting content from PDF:', error);
    throw new Error(`Failed to read the PDF file: ${file.name}. It might be corrupted or protected.`);
  }
};