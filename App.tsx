import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateImage } from './services/geminiService';
import type { OriginalImage, GeneratedImage } from './types';

// --- Helper & Icon Components ---

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.44 4.06a.75.75 0 01.92.24l.8 1.38a.75.75 0 11-1.3 0l-.8-1.38a.75.75 0 01.38-1.16zm9.12 0a.75.75 0 01.38 1.16l-.8 1.38a.75.75 0 11-1.3-.76l.8-1.38a.75.75 0 01.92-.24zM10 15.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.06 14.56a.75.75 0 011.16-.38l1.38.8a.75.75 0 11-.76 1.3l-1.38-.8a.75.75 0 01-.38-1.16zm11.88 0a.75.75 0 01-.38 1.16l-1.38.8a.75.75 0 11-.76-1.3l1.38-.8a.75.75 0 011.16.38zM2.75 10a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5h-1.5zm13 0a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5h-1.5zM10 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" clipRule="evenodd" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);


const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
);

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .substring(0, 50);
};

const App: React.FC = () => {
  const [baseImage, setBaseImage] = useState<OriginalImage | null>(null);
  const [sheetPrompts, setSheetPrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [isFetchingSheet, setIsFetchingSheet] = useState<boolean>(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setIsFetchingSheet(true);
        setError(null);
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1eYW1NrfVQw-rWdxRdgC_rqMvFwgKdWPuE3hMWTODtt0/values/Sheet5!D2:AD999?key=AIzaSyAgFxAhd_MeOmgiVUJtRFqBs17y8wWPaJw');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.values && data.values.length > 0) {
            const promptsFromSheet = data.values.flat().filter((p: any) => typeof p === 'string' && p.trim() !== '');
            if (promptsFromSheet.length === 0) throw new Error("No valid prompts found in the sheet.");
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

  const handleDownload = useCallback((url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(prompt)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  const performGeneration = useCallback(async (prompt: string, imageFile?: File) => {
      setIsLoading(true);
      setError(null);
      try {
          const generatedImageUrl = await generateImage(prompt, imageFile);
          const response = await fetch(generatedImageUrl);
          const blob = await response.blob();
          const newFile = new File([blob], `${slugify(prompt)}.png`, { type: blob.type || 'image/png' });

          setBaseImage({ file: newFile, url: generatedImageUrl });
          setGeneratedImages(prev => [{ prompt, url: generatedImageUrl }, ...prev]);
          handleDownload(generatedImageUrl, prompt);
      } catch (e: any) {
          setError(`Generation failed: ${e.message}`);
          if (isAutoMode) {
              setIsAutoMode(false); // Stop auto mode on error
          }
      } finally {
          setIsLoading(false);
      }
  }, [handleDownload, isAutoMode]);

  useEffect(() => {
      if (isAutoMode) {
          timerRef.current = window.setInterval(() => {
              if (isLoading) return; // Skip if a generation is already in progress
              
              setCurrentPromptIndex(prevIndex => {
                  const nextIndex = (prevIndex + 1) % sheetPrompts.length;
                  performGeneration(sheetPrompts[nextIndex], baseImage?.file);
                  return nextIndex;
              });

          }, 10000); // 1 minute
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
      }
      return () => { // Cleanup
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [isAutoMode, isLoading, sheetPrompts, baseImage, performGeneration]);

  const handleGenerateClick = () => {
    if (sheetPrompts.length > 0) {
      performGeneration(sheetPrompts[currentPromptIndex], baseImage?.file);
    }
  };

  const handlePrevPrompt = () => {
    setCurrentPromptIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextPrompt = () => {
    setCurrentPromptIndex(prev => Math.min(sheetPrompts.length - 1, prev + 1));
  };
  
  const toggleAutoMode = () => {
    if (isAutoMode) {
        setIsAutoMode(false);
    } else {
        if (!baseImage) {
            alert("Please generate at least one image manually before starting Auto-Generate mode.");
            return;
        }
        setIsAutoMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Gemini Image Generator
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Choose an editing instruction and let Gemini bring your vision to life, evolving the image with each step.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col space-y-6 h-fit">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">1. Choose Prompt</h2>
            {isFetchingSheet ? (
                <div className="flex items-center space-x-2 text-gray-400">
                    <Spinner />
                    <span>Loading creative prompts...</span>
                </div>
            ) : (
              <div className="flex items-center justify-between space-x-2">
                <button
                  onClick={handlePrevPrompt}
                  disabled={currentPromptIndex === 0 || isLoading || isAutoMode}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous prompt"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <p className="flex-grow text-center text-sm bg-gray-900/50 border border-gray-600 rounded-lg p-3 h-full min-h-[50px] flex items-center justify-center">
                  {sheetPrompts.length > 0 ? sheetPrompts[currentPromptIndex] : 'No prompts loaded.'}
                </p>
                <button
                  onClick={handleNextPrompt}
                  disabled={currentPromptIndex === sheetPrompts.length - 1 || isLoading || isAutoMode}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next prompt"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">2. Generate Image</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGenerateClick}
                disabled={isLoading || isFetchingSheet || isAutoMode}
                className="flex-1 flex items-center justify-center p-4 text-lg font-bold bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                {isLoading && !isAutoMode ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                Generate
              </button>
               <button
                onClick={toggleAutoMode}
                disabled={isLoading || isFetchingSheet || (!isAutoMode && !baseImage)}
                className={`flex-1 flex items-center justify-center p-4 text-lg font-bold rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none ${isAutoMode ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}
              >
                {isLoading && isAutoMode ? <Spinner/> : <ClockIcon className="w-6 h-6 mr-2"/>}
                {isAutoMode ? 'Stop Auto' : 'Auto-Generate'}
              </button>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3 mb-6">Results</h2>
            {error && <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4">{error}</div>}
            {generatedImages.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                    <p>Your generated images will appear here.</p>
                    {!isLoading && !isFetchingSheet && <p className="text-sm mt-2">Click "Generate" to create the first image.</p>}
                </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {generatedImages.map((image, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    <img src={image.url} alt={`Generated with prompt: ${image.prompt}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-center text-sm text-white">{image.prompt}</p>
                    </div>
                    <button 
                        onClick={() => handleDownload(image.url, image.prompt)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-cyan-500 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        aria-label="Download image"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
