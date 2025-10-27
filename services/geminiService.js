
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Converts a File object to a base64 encoded string and its MIME type.
 * @param {File} file The File object to convert.
 * @returns {Promise<{mimeType: string, data: string}>} A promise that resolves to an object with mimeType and base64 data.
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as data URL."));
      }
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
 * Generates an image from a text prompt, optionally editing an existing image.
 * @param {string} prompt The text prompt describing the desired image or edit.
 * @param {File} [originalImageFile] The optional original image as a File object to be edited.
 * @returns {Promise<string>} A promise that resolves to a data URL (string) of the generated image.
 */
export const generateImage = async (prompt, originalImageFile) => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // The parts array will always contain the text prompt.
  const parts = [
    { text: prompt },
  ];

  // If an original image is provided, convert it and add it to the parts array.
  if (originalImageFile) {
    const { mimeType, data: base64Data } = await fileToGenerativePart(originalImageFile);
    parts.unshift({ // Add image part before the prompt
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // Check if the API returned any candidates. If not, it's an error.
  if (!response.candidates || response.candidates.length === 0) {
    let message = "Image generation failed. The API returned no content.";
    if (response.promptFeedback?.blockReason) {
        message += `\nReason: Request was blocked for ${response.promptFeedback.blockReason}.`;
        if (response.promptFeedback.blockReasonMessage) {
            message += ` ${response.promptFeedback.blockReasonMessage}`;
        }
    }
    console.error("Invalid response from Gemini API (no candidates):", JSON.stringify(response, null, 2));
    throw new Error(message);
  }

  // Extract the generated image data by iterating through the response parts
  const responseParts = response.candidates[0]?.content?.parts;
  if (responseParts) {
    for (const part of responseParts) {
      if (part.inlineData) {
        const { data, mimeType } = part.inlineData;
        return `data:${mimeType};base64,${data}`;
      }
    }
  }
  
  // If no image part was found, the model might have responded with text instead.
  if (response.text) {
      throw new Error(`Image generation failed. The model responded with text: "${response.text}"`);
  }

  // Fallback error if no image or text is found.
  console.error("Invalid response from Gemini API:", JSON.stringify(response, null, 2));
  throw new Error("Failed to generate image. The API response was in an unexpected format.");
};
