
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Converts a File object to a base64 encoded string and its MIME type.
 * @param file The File object to convert.
 * @returns A promise that resolves to an object with mimeType and base64 data.
 */
const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string; }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as data URL."));
      }
      // The result is a data URL: "data:image/jpeg;base64,..."
      // We need to extract the mimeType and the base64 data.
      const [header, data] = reader.result.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      if (!data) {
        return reject(new Error("Could not extract base64 data from file."));
      }
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Generates an image by editing an existing one based on a text prompt.
 * @param originalImageFile The original image as a File object.
 * @param prompt The text prompt describing the desired edit.
 * @returns A promise that resolves to a data URL (string) of the generated image.
 */
export const generateImage = async (originalImageFile: File, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { mimeType, data: base64Data } = await fileToGenerativePart(originalImageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // Extract the generated image data
  const generatedPart = response.candidates?.[0]?.content?.parts?.[0];
  if (generatedPart && generatedPart.inlineData) {
    const { data, mimeType } = generatedPart.inlineData;
    return `data:${mimeType};base64,${data}`;
  }

  throw new Error("Failed to generate image or response format is invalid.");
};
