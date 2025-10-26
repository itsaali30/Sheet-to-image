
import React, { useState, useCallback, useEffect } from 'react';
import { generateImage } from './services/geminiService';
import type { OriginalImage, GeneratedImage } from './types';

// --- Helper & Icon Components (defined outside main component to prevent re-creation on re-renders) ---

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.44 4.06a.75.75 0 01.92.24l.8 1.38a.75.75 0 11-1.3 0l-.8-1.38a.75.75 0 01.38-1.16zm9.12 0a.75.75 0 01.38 1.16l-.8 1.38a.75.75 0 11-1.3-.76l.8-1.38a.75.75 0 01.92-.24zM10 15.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.06 14.56a.75.75 0 011.16-.38l1.38.8a.75.75 0 11-.76 1.3l-1.38-.8a.75.75 0 01-.38-1.16zm11.88 0a.75.75 0 01-.38 1.16l-1.38.8a.75.75 0 11-.76-1.3l1.38-.8a.75.75 0 011.16.38zM2.75 10a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5h-1.5zm13 0a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5h-1.5zM10 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" clipRule="evenodd" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
);

const ImageUploader: React.FC<{ onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({ onImageChange }) => (
  <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors duration-300">
    <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
    <label htmlFor="file-upload" className="relative cursor-pointer">
      <span className="block text-sm font-semibold text-cyan-400 mt-2">
        Upload an image
      </span>
      <span className="block text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onImageChange} accept="image/*" />
    </label>
  </div>
);

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [sheetPrompts, setSheetPrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [isFetchingSheet, setIsFetchingSheet] = useState<boolean>(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setIsFetchingSheet(true);
        setError(null);
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1eYW1NrfVQw-rWdxRdgC_rqMvFwgKdWPuE3hMWTODtt0/values/Sheet5!D:AD?key=AIzaSyAgFxAhd_MeOmgiVUJtRFqBs17y8wWPaJw');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.values && data.values.length > 0) {
            const promptsFromSheet = data.values.flat().filter((p: any) => typeof p === 'string' && p.trim() !== '');
            if (promptsFromSheet.length === 0) {
                throw new Error("No valid prompts found in the sheet.");
            }
            setSheetPrompts(promptsFromSheet);
        } else {
            throw new Error("Sheet is empty or contains no data.");
        }
      } catch (e: any) {
        setError(`Failed to load prompts: ${e.message}`);
        console.error(e);
      } finally {
        setIsFetchingSheet(false);
      }
    };
    fetchSheetData();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setOriginalImage({
        file,
        url: URL.createObjectURL(file),
      });
      setGeneratedImages([]);
      setError(null);
    }
  };

  const handlePrevPrompt = () => {
    setCurrentPromptIndex(prev => Math.max(0, prev - 1));
  }
  
  const handleNextPrompt = () => {
    setCurrentPromptIndex(prev => Math.min(sheetPrompts.length - 1, prev + 1));
  }

  const handleGenerate = useCallback(async () => {
    if (!originalImage?.file || sheetPrompts.length === 0) {
      setError('Please upload an image and ensure prompts are loaded.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const prompt = sheetPrompts[currentPromptIndex];
    
    try {
      const resultUrl = await generateImage(originalImage.file, prompt);
      setGeneratedImages(prev => [...prev, { prompt, url: resultUrl }]);
      // Auto-advance to next prompt on success
      if (currentPromptIndex < sheetPrompts.length - 1) {
          setCurrentPromptIndex(prev => prev + 1);
      }
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, sheetPrompts, currentPromptIndex]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10" />
            Gemini Image Editor
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Edit images with a list of prompts from Google Sheets.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- Controls Column --- */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Upload Image</h2>
              {!originalImage ? (
                <ImageUploader onImageChange={handleImageChange} />
              ) : (
                <div className="relative group">
                  <img src={originalImage.url} alt="Original" className="w-full h-auto max-h-80 object-contain rounded-lg" />
                  <button
                    onClick={() => {
                      setOriginalImage(null);
                      setGeneratedImages([]);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">2. Select Prompt</h2>
              {isFetchingSheet ? (
                  <div className="flex items-center gap-2 text-gray-400 p-4 justify-center">
                    <Spinner />
                    <span>Loading prompts from sheet...</span>
                  </div>
              ) : sheetPrompts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 h-24 overflow-y-auto">
                      <p>{sheetPrompts[currentPromptIndex]}</p>
                  </div>
                  <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400">
                          Prompt {currentPromptIndex + 1} of {sheetPrompts.length}
                      </p>
                      <div className="flex gap-2">
                          <button onClick={handlePrevPrompt} disabled={currentPromptIndex === 0} className="px-4 py-2 text-sm font-semibold bg-gray-700 rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                              Prev
                          </button>
                          <button onClick={handleNextPrompt} disabled={currentPromptIndex >= sheetPrompts.length - 1} className="px-4 py-2 text-sm font-semibold bg-gray-700 rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                              Next
                          </button>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  Could not load prompts. Please check the sheet or the network connection.
                </div>
              )}
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !originalImage || isFetchingSheet || sheetPrompts.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          {/* --- Results Column --- */}
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 min-h-[400px]">
             <h2 className="text-xl font-semibold mb-4">Results</h2>
             {isLoading && generatedImages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <p className="mt-4">Generating your first image, please wait...</p>
                </div>
            )}
            {!isLoading && generatedImages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <SparklesIcon className="w-16 h-16" />
                    <p className="mt-4">Your generated images will appear here.</p>
                </div>
            )}
            {generatedImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                        <div key={index} className="bg-gray-900 p-2 rounded-lg">
                            <img src={image.url} alt={`Generated for prompt: ${image.prompt}`} className="w-full h-auto object-contain rounded" />
                            <p className="text-xs text-gray-400 mt-2 p-1 truncate" title={image.prompt}>{image.prompt}</p>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="bg-gray-900 p-2 rounded-lg flex items-center justify-center aspect-square">
                            <div className="flex flex-col items-center text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                                <p className="text-sm mt-2">Generating next...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
