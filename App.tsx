
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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
);
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
);
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
);
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400 ${className}`}></div>
);
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-6 h-6 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.22 1.02.684 1.11 1.226M10.01 19.344c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.22 1.02.684 1.11 1.226M10.01 4.482c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.22 1.02.684 1.11 1.226M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-6 h-6 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
const SheetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-6 h-6 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
);
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-6 h-6 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.967-.63 1.563-.63h2.25z" /></svg>
);


const App: React.FC = () => {
  // --- State ---
  const [baseImage, setBaseImage] = useState<OriginalImage | null>(null);
  const [sheetPrompts, setSheetPrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isFetchingSheet, setIsFetchingSheet] = useState(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isAutoDownload, setIsAutoDownload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [sheetConfig, setSheetConfig] = useState({
    id: '1eYW1NrfVQw-rWdxRdgC_rqMvFwgKdWPuE3hMWTODtt0',
    name: 'Sheet5',
    range: 'D2:AD999'
  });
  const [tempSheetConfig, setTempSheetConfig] = useState({ id: '', name: '', startCell: '', endCell: '' });
  const [isSubmittingSheet, setIsSubmittingSheet] = useState(false);
  const [sheetModalError, setSheetModalError] = useState<string | null>(null);
  const googleSignInButtonRef = useRef<HTMLDivElement>(null);

  const [sheetApiKey, setSheetApiKey] = useState('');
  const [isSheetKeyModalOpen, setIsSheetKeyModalOpen] = useState(false);
  const [tempSheetApiKey, setTempSheetApiKey] = useState('');

  // --- Methods ---
  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .substring(0, 50);
  };

  const handleDownload = (url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(prompt)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      if (isAutoDownload) {
        handleDownload(generatedImageUrl, prompt);
      }
    } catch (e: any) {
      setError(`Generation failed: ${e.message}`);
      if (isAutoMode) {
        setIsAutoMode(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAutoDownload, isAutoMode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBaseImage({ file, url: imageUrl });
      setGeneratedImages([]);
      setError(null);
    }
  };

  const handleGenerateClick = () => {
    if (sheetPrompts.length > 0) {
      performGeneration(sheetPrompts[currentPromptIndex], baseImage?.file);
    }
  };
  
  const handlePrevPrompt = () => setCurrentPromptIndex(prev => Math.max(0, prev - 1));
  const handleNextPrompt = () => setCurrentPromptIndex(prev => Math.min(sheetPrompts.length - 1, prev + 1));
  
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

  const fetchPrompts = useCallback(async () => {
    if (!sheetApiKey) {
      setError("Google Sheets API Key is not set. Please set it in the settings sidebar.");
      setIsFetchingSheet(false);
      return;
    }
    setIsFetchingSheet(true);
    setError(null);
    setSheetPrompts([]);
    setCurrentPromptIndex(0);
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.id}/values/${encodeURIComponent(sheetConfig.name)}!${sheetConfig.range}?key=${sheetApiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}. Check Sheet ID, Name, Range, and API Key.`);
      const data = await response.json();
      if (data.values && data.values.length > 0) {
        const promptsFromSheet = data.values.flat().filter((p: any) => typeof p === 'string' && p.trim() !== '');
        if (promptsFromSheet.length === 0) throw new Error("No valid prompts found in the specified range.");
        setSheetPrompts(promptsFromSheet);
      } else {
        throw new Error("Sheet is empty or contains no data in the specified range.");
      }
    } catch (e: any) {
      const errorMessage = `Failed to load prompts: ${e.message}`;
      setError(errorMessage);
      console.error(e);
      throw e;
    } finally {
      setIsFetchingSheet(false);
    }
  }, [sheetApiKey, sheetConfig.id, sheetConfig.name, sheetConfig.range]);

  const openSheetModal = () => {
    setTempSheetConfig({
      id: sheetConfig.id,
      name: sheetConfig.name,
      startCell: sheetConfig.range.split(':')[0] || '',
      endCell: sheetConfig.range.split(':')[1] || ''
    });
    setSheetModalError(null);
    setIsSheetModalOpen(true);
    setIsSidebarOpen(false);
  };

  const handleSheetConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSheetModalError(null);
    setIsSubmittingSheet(true);

    const { id, name, startCell, endCell } = tempSheetConfig;
    if (!id.trim() || !name.trim() || !startCell.trim() || !endCell.trim()) {
      setSheetModalError("All fields are required.");
      setIsSubmittingSheet(false);
      return;
    }

    const newConfig = {
      id: id.trim(),
      name: name.trim(),
      range: `${startCell.trim()}:${endCell.trim()}`
    };

    setSheetConfig(newConfig);
    localStorage.setItem('sheet-id', newConfig.id);
    localStorage.setItem('sheet-name', newConfig.name);
    localStorage.setItem('sheet-range', newConfig.range);
    
    setIsSheetModalOpen(false);
    setIsSubmittingSheet(false);
  };
  
  const handleSheetKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSheetApiKey.trim()) {
      setSheetApiKey(tempSheetApiKey);
      localStorage.setItem('sheet-api-key', tempSheetApiKey);
    }
    setIsSheetKeyModalOpen(false);
  };

  // --- Lifecycle & Watchers ---
  useEffect(() => {
    const storedKey = localStorage.getItem('sheet-api-key');
    if (storedKey) {
      setSheetApiKey(storedKey);
    }
    setSheetConfig({
      id: localStorage.getItem('sheet-id') || sheetConfig.id,
      name: localStorage.getItem('sheet-name') || sheetConfig.name,
      range: localStorage.getItem('sheet-range') || sheetConfig.range,
    });
  }, []); 
  
  useEffect(() => {
    fetchPrompts().catch(() => {});
  }, [fetchPrompts, sheetConfig]);

  useEffect(() => {
    if (isAutoMode) {
      timerRef.current = window.setInterval(() => {
        if (isLoading) return;
        setCurrentPromptIndex(prev => {
          const nextIndex = (prev + 1) % sheetPrompts.length;
          performGeneration(sheetPrompts[nextIndex], baseImage?.file);
          return nextIndex;
        });
      }, 10000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoMode, isLoading, sheetPrompts, baseImage, performGeneration]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Gemini Image Editor
          </h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Open settings">
            <SettingsIcon />
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
                Welcome to the Editor
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Upload your image or generate one, then choose an editing instruction to evolve it with each step.
            </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col space-y-6 h-fit">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">1. Upload Image</h2>
            <div className="flex flex-col">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" id="imageUpload" />
              <label htmlFor="imageUpload" className="flex items-center justify-center p-4 text-lg font-bold bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300 cursor-pointer">
                  <UploadIcon className="w-6 h-6 mr-2" />
                  Choose an image to edit...
              </label>
              <p className="text-sm text-gray-500 mt-2 text-center">Or, start with a text prompt to generate the first image.</p>
            </div>

            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">2. Choose Prompt</h2>
            {isFetchingSheet ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <Spinner />
                <span>Loading creative prompts...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between space-x-2">
                <button onClick={handlePrevPrompt} disabled={currentPromptIndex === 0 || isLoading || isAutoMode} className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous prompt">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <p className="flex-grow text-center text-sm bg-gray-900/50 border border-gray-600 rounded-lg p-3 h-full min-h-[50px] flex items-center justify-center">
                  {sheetPrompts.length > 0 ? sheetPrompts[currentPromptIndex] : 'No prompts loaded.'}
                </p>
                <button onClick={handleNextPrompt} disabled={currentPromptIndex >= sheetPrompts.length - 1 || isLoading || isAutoMode} className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next prompt">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">3. Generate Image</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleGenerateClick} disabled={isLoading || isFetchingSheet || isAutoMode} className="flex-1 flex items-center justify-center p-4 text-lg font-bold bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none">
                {isLoading && !isAutoMode ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                Generate
              </button>
               <button onClick={toggleAutoMode} disabled={isLoading || isFetchingSheet || (!isAutoMode && !baseImage)} className={`flex-1 flex items-center justify-center p-4 text-lg font-bold rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none ${isAutoMode ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}>
                {isLoading && isAutoMode ? <Spinner/> : <ClockIcon className="w-6 h-6 mr-2"/>}
                {isAutoMode ? 'Stop Auto' : 'Auto-Generate'}
              </button>
            </div>
            <div className="flex items-center justify-center pt-2 space-x-3">
              <span className="text-sm font-medium text-gray-400">Auto Download File</span>
              <label htmlFor="autoDownloadToggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                      <input type="checkbox" id="autoDownloadToggle" className="sr-only" checked={isAutoDownload} onChange={() => setIsAutoDownload(prev => !prev)} />
                      <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div>
                  </div>
              </label>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3 mb-6">Image Canvas</h2>
            {error && <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4">{error}</div>}
            <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-700">
              {baseImage ? (
                <img src={baseImage.url} alt="Current base for editing" className="w-full h-auto object-contain max-h-[40vh]" />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-900/50 text-center text-gray-500">
                  <div>
                    <p>Upload an image or generate one to start.</p>
                    <p className="text-sm mt-1">Your current image will appear here.</p>
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Generation History</h3>
            {generatedImages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 flex-grow flex items-center justify-center">
                    <p>Your generated images will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto flex-grow pr-2">
                    {generatedImages.map((image, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden aspect-square">
                            <img src={image.url} alt={`Generated with prompt: ${image.prompt}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-center text-sm text-white">{image.prompt}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => handleDownload(image.url, image.prompt)} className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-cyan-500 transition-all duration-300" aria-label="Download image" title="Download image">
                                    <DownloadIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 transition-all duration-300">
          <aside onClick={(e) => e.stopPropagation()} className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-800 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-2xl font-semibold">Settings</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close settings">
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-y-6">
              {/* User Profile Section */}
              <div className="bg-gray-700/50 p-4 rounded-xl">
                  <h3 className="text-lg font-medium text-center mb-4">User Profile</h3>
                  <div className="flex flex-col items-center space-y-4">
                  {userProfile ? (
                    <>
                      <img src={userProfile.picture} alt="User profile" className="w-20 h-20 rounded-full"/>
                      <div className="text-center">
                        <p className="font-semibold">{userProfile.name}</p>
                        <p className="text-sm text-gray-400">{userProfile.email}</p>
                      </div>
                      <button onClick={() => setUserProfile(null)} className="w-full p-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-400">Sign in to sync your settings.</p>
                      <div ref={googleSignInButtonRef}></div>
                    </>
                  )}
                </div>
              </div>

              {/* Prompts Source Section */}
              <div className="bg-gray-700/50 p-4 rounded-xl">
                <h3 className="text-lg font-medium text-center mb-4">Prompts Source</h3>
                <button onClick={openSheetModal} className="w-full flex items-center justify-center p-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors">
                  <SheetIcon className="w-5 h-5 mr-2"/>
                  Change Sheet Source
                </button>
              </div>

              {/* API Keys Section */}
              <div className="bg-gray-700/50 p-4 rounded-xl">
                <h3 className="text-lg font-medium text-center mb-4">API Keys</h3>
                <div className="space-y-4">
                    <div className="relative group">
                        <button 
                            disabled 
                            className="w-full flex items-center justify-center p-3 bg-gray-600 rounded-lg font-semibold transition-colors cursor-not-allowed opacity-50"
                        >
                            <KeyIcon className="w-5 h-5 mr-2"/>
                            Set Gemini API Key
                        </button>
                        <div className="absolute bottom-full mb-2 w-full px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-gray-900 text-gray-200 text-xs rounded py-2 px-3 shadow-lg text-center">
                                For security, the Gemini API key is managed via environment variables.
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setTempSheetApiKey(sheetApiKey);
                            setIsSheetKeyModalOpen(true);
                            setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center justify-center p-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors"
                    >
                        <KeyIcon className="w-5 h-5 mr-2"/>
                        Set Sheet API Key
                    </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {isSheetModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
                <button onClick={() => setIsSheetModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close sheet settings">
                    <CloseIcon />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">Set Google Sheet Source</h2>
                <p className="text-gray-400 mb-6 text-center">
                    Provide the ID, Sheet Name, and Cell Range for your public Google Sheet.
                </p>
                {sheetModalError && <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4 text-sm">{sheetModalError}</div>}
                <form onSubmit={handleSheetConfigSubmit} className="flex flex-col space-y-4">
                    <div>
                        <label htmlFor="sheetId" className="block text-sm font-medium text-gray-300 mb-1">Spreadsheet ID</label>
                        <input id="sheetId" type="text" value={tempSheetConfig.id} onChange={e => setTempSheetConfig({...tempSheetConfig, id: e.target.value})} placeholder="e.g., 1eYW1NrfVQw-rWdxRdgC_rqMvFwgKdWPuE3hMWTODtt0" className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="Spreadsheet ID" required />
                    </div>
                      <div>
                        <label htmlFor="sheetName" className="block text-sm font-medium text-gray-300 mb-1">Sheet Name</label>
                        <input id="sheetName" type="text" value={tempSheetConfig.name} onChange={e => setTempSheetConfig({...tempSheetConfig, name: e.target.value})} placeholder="e.g., Sheet1" className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="Sheet Name" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sheetStartCell" className="block text-sm font-medium text-gray-300 mb-1">From Cell</label>
                            <input id="sheetStartCell" type="text" value={tempSheetConfig.startCell} onChange={e => setTempSheetConfig({...tempSheetConfig, startCell: e.target.value})} placeholder="e.g., D2" className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="Start Cell" required />
                        </div>
                        <div>
                            <label htmlFor="sheetEndCell" className="block text-sm font-medium text-gray-300 mb-1">To Cell</label>
                            <input id="sheetEndCell" type="text" value={tempSheetConfig.endCell} onChange={e => setTempSheetConfig({...tempSheetConfig, endCell: e.target.value})} placeholder="e.g., AD999" className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="End Cell" required />
                        </div>
                    </div>
                    <button type="submit" className="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-600 flex items-center justify-center" disabled={isSubmittingSheet || !tempSheetConfig.id.trim() || !tempSheetConfig.name.trim() || !tempSheetConfig.startCell.trim() || !tempSheetConfig.endCell.trim()}>
                        {isSubmittingSheet ? <Spinner className="mr-2" /> : null}
                        {isSubmittingSheet ? 'Verifying...' : 'Save & Fetch Prompts'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {isSheetKeyModalOpen && (
          <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                  <button onClick={() => setIsSheetKeyModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close API key settings">
                      <CloseIcon />
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-center">Set Google Sheets API Key</h2>
                  <p className="text-gray-400 mb-6 text-center">
                      Enter your Google Sheets API key to fetch prompts. This key is stored locally in your browser.
                  </p>
                  <form onSubmit={handleSheetKeySubmit} className="flex flex-col space-y-4">
                      <div>
                          <label htmlFor="sheetApiKeyInput" className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                          <input 
                              id="sheetApiKeyInput"
                              type="password"
                              value={tempSheetApiKey}
                              onChange={(e) => setTempSheetApiKey(e.target.value)}
                              placeholder="Enter your API key"
                              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                              aria-label="Google Sheets API Key"
                              required
                          />
                      </div>
                      <button type="submit" className="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-600" disabled={!tempSheetApiKey.trim()}>
                          Save Key
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
