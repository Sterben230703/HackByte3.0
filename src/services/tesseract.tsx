// Replace with your OCR.space API key
const API_KEY = 'YOUR_API_KEY';

export const performOCR = async (file: File | string) => {
  try {
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('url', file);
    }

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.OCRExitCode === 1) {
      return result.ParsedResults[0].ParsedText;
    } else {
      throw new Error('OCR processing failed');
    }
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
};
