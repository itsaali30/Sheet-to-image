
import { ref, onMounted, watch, reactive } from 'vue';
import { generateImage } from './services/geminiService.js';

// --- Components ---
const SparklesIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.44 4.06a.75.75 0 01.92.24l.8 1.38a.75.75 0 11-1.3 0l-.8-1.38a.75.75 0 01.38-1.16zm9.12 0a.75.75 0 01.38 1.16l-.8 1.38a.75.75 0 11-1.3-.76l.8-1.38a.75.75 0 01.92-.24zM10 15.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.06 14.56a.75.75 0 011.16-.38l1.38.8a.75.75 0 11-.76 1.3l-1.38-.8a.75.75 0 01-.38-1.16zm11.88 0a.75.75 0 01-.38 1.16l-1.38.8a.75.75 0 11-.76-1.3l1.38-.8a.75.75 0 011.16.38zM2.75 10a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5h-1.5zm13 0a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5h-1.5zM10 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" clip-rule="evenodd" /></svg>`
};
const ClockIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
};
const DownloadIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`
};
const UploadIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>`
};
const ChevronLeftIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`
};
const ChevronRightIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`
};
const Spinner = {
  template: `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>`
};
const SettingsIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.22 1.02.684 1.11 1.226M10.01 19.344c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.22 1.02.684 1.11 1.226M10.01 4.482c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.22 1.02.684 1.11 1.226M12 21a9 9 0 100-18 9 9 0 000 18z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>`
};
const CloseIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`
};
const KeyIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.967-.63 1.563-.63h2.25z" /></svg>`
};
const SheetIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>`
};

export default {
  components: {
    SparklesIcon, ClockIcon, DownloadIcon, UploadIcon, ChevronLeftIcon, ChevronRightIcon, Spinner, SettingsIcon, CloseIcon, KeyIcon, SheetIcon
  },
  setup() {
    // --- State ---
    const baseImage = ref(null);
    const sheetPrompts = ref([]);
    const currentPromptIndex = ref(0);
    const isFetchingSheet = ref(true);
    const generatedImages = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isAutoMode = ref(false);
    const isAutoDownload = ref(false);
    const fileInputRef = ref(null);
    let timerRef = null;

    const isSidebarOpen = ref(false);
    const isSheetModalOpen = ref(false);
    const userProfile = ref(null);

    const sheetConfig = reactive({
        id: '1eYW1NrfVQw-rWdxRdgC_rqMvFwgKdWPuE3hMWTODtt0',
        name: 'Sheet5',
        range: 'D2:AD999'
    });
    const tempSheetConfig = reactive({ id: '', name: '', startCell: '', endCell: '' });
    const isSubmittingSheet = ref(false);
    const sheetModalError = ref(null);

    const geminiApiKey = ref('');
    const isGeminiKeyModalOpen = ref(false);
    const tempGeminiApiKey = ref('');

    const sheetApiKey = ref('');
    const isSheetKeyModalOpen = ref(false);
    const tempSheetApiKey = ref('');

    // --- Methods ---
    const decodeJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT", e);
            return null;
        }
    };
    
    const handleCredentialResponse = (response) => {
        const profile = decodeJwt(response.credential);
        if (profile) {
            userProfile.value = profile;
            localStorage.setItem('user-profile', JSON.stringify(profile));
        }
    };

    const handleLogout = () => {
        userProfile.value = null;
        localStorage.removeItem('user-profile');
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        isSidebarOpen.value = false;
    };
    
    const handleDownload = (url, row, col) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `img${row}-${col}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const performGeneration = async (promptInfo, imageFile) => {
        if (!geminiApiKey.value) {
            error.value = "Gemini API Key is not set. Please set it in the settings sidebar.";
            isLoading.value = false;
            if (isAutoMode.value) {
                isAutoMode.value = false;
            }
            return;
        }
        isLoading.value = true;
        error.value = null;
        try {
            const { text: prompt, row, col } = promptInfo;
            const generatedImageUrl = await generateImage(prompt, geminiApiKey.value, imageFile);
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const newFile = new File([blob], `img${row}-${col}.png`, { type: blob.type || 'image/png' });

            baseImage.value = { file: newFile, url: generatedImageUrl };
            generatedImages.value.unshift({ prompt, url: generatedImageUrl, row, col });

            if (isAutoDownload.value) {
                handleDownload(generatedImageUrl, row, col);
            }
        } catch (e) {
            error.value = `Generation failed: ${e.message}`;
            if (isAutoMode.value) {
                isAutoMode.value = false;
            }
        } finally {
            isLoading.value = false;
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            baseImage.value = { file, url: imageUrl };
            generatedImages.value = [];
            error.value = null;
        }
    };

    const handleGenerateClick = () => {
        if (sheetPrompts.value.length > 0) {
            performGeneration(sheetPrompts.value[currentPromptIndex.value], baseImage.value?.file);
        }
    };

    const handlePrevPrompt = () => {
        currentPromptIndex.value = Math.max(0, currentPromptIndex.value - 1);
    };

    const handleNextPrompt = () => {
        currentPromptIndex.value = Math.min(sheetPrompts.value.length - 1, currentPromptIndex.value + 1);
    };
    
    const toggleAutoMode = () => {
        if (isAutoMode.value) {
            isAutoMode.value = false;
        } else {
            if (!baseImage.value) {
                alert("Please generate at least one image manually before starting Auto-Generate mode.");
                return;
            }
            isAutoMode.value = true;
        }
    };

    const fetchPrompts = async () => {
        if (!sheetApiKey.value) {
            error.value = "Google Sheets API Key is not set. Please set it in the settings sidebar.";
            isFetchingSheet.value = false;
            return;
        }
        isFetchingSheet.value = true;
        error.value = null;
        sheetPrompts.value = [];
        currentPromptIndex.value = 0;
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.id}/values/${encodeURIComponent(sheetConfig.name)}!${sheetConfig.range}?key=${sheetApiKey.value}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}. Check Sheet ID, Name, Range, and API Key.`);
            const data = await response.json();
            if (data.values && data.values.length > 0) {
                const columnLetterToNumber = (column) => {
                    let result = 0;
                    column = column.toUpperCase();
                    for (let i = 0; i < column.length; i++) {
                        result = result * 26 + (column.charCodeAt(i) - 65 + 1);
                    }
                    return result;
                };

                const parseStartCell = (range) => {
                    const startCell = range.split(':')[0];
                    const colLetters = startCell.match(/[A-Z]+/)?.[0] || 'A';
                    const rowNumber = parseInt(startCell.match(/\d+/)?.[0] || '1', 10);
                    return { startCol: columnLetterToNumber(colLetters), startRow: rowNumber };
                }
                
                const { startCol, startRow } = parseStartCell(sheetConfig.range);

                const promptsFromSheet = data.values.flatMap((row, rowIndex) => 
                    row.map((cell, colIndex) => ({
                        text: cell,
                        row: startRow + rowIndex,
                        col: startCol + colIndex,
                    })).filter(p => typeof p.text === 'string' && p.text.trim() !== '')
                );

                if (promptsFromSheet.length === 0) throw new Error("No valid prompts found in the specified range.");
                sheetPrompts.value = promptsFromSheet;
            } else {
                throw new Error("Sheet is empty or contains no data in the specified range.");
            }
        } catch (e) {
            const errorMessage = `Failed to load prompts: ${e.message}`;
            error.value = errorMessage;
            console.error(e);
            throw e; // Re-throw so modal can catch it
        } finally {
            isFetchingSheet.value = false;
        }
    };

    const openSheetModal = () => {
        tempSheetConfig.id = sheetConfig.id;
        tempSheetConfig.name = sheetConfig.name;
        const [start, end] = sheetConfig.range.split(':');
        tempSheetConfig.startCell = start || '';
        tempSheetConfig.endCell = end || '';
        sheetModalError.value = null;
        isSheetModalOpen.value = true;
        isSidebarOpen.value = false;
    };

    const handleSheetConfigSubmit = async (e) => {
        e.preventDefault();
        sheetModalError.value = null;
        isSubmittingSheet.value = true;

        const { id, name, startCell, endCell } = tempSheetConfig;
        
        if (!id.trim() || !name.trim() || !startCell.trim() || !endCell.trim()) {
            sheetModalError.value = "All fields are required.";
            isSubmittingSheet.value = false;
            return;
        }

        const oldConfig = { ...sheetConfig };
        
        sheetConfig.id = tempSheetConfig.id.trim();
        sheetConfig.name = tempSheetConfig.name.trim();
        sheetConfig.range = `${tempSheetConfig.startCell.trim()}:${tempSheetConfig.endCell.trim()}`;

        try {
            await fetchPrompts();

            localStorage.setItem('sheet-id', sheetConfig.id);
            localStorage.setItem('sheet-name', sheetConfig.name);
            localStorage.setItem('sheet-range', sheetConfig.range);
            
            isSheetModalOpen.value = false;
        } catch (err) {
            sheetConfig.id = oldConfig.id;
            sheetConfig.name = oldConfig.name;
            sheetConfig.range = oldConfig.range;
            sheetModalError.value = `Failed to fetch from sheet. ${err.message}. Please check your inputs are correct and the sheet is public.`;
        } finally {
            isSubmittingSheet.value = false;
        }
    };
    
    const openSheetKeyModal = () => {
        tempSheetApiKey.value = sheetApiKey.value;
        isSheetKeyModalOpen.value = true;
        isSidebarOpen.value = false;
    };

    const handleSheetKeySubmit = (e) => {
        e.preventDefault();
        if (tempSheetApiKey.value.trim()) {
            sheetApiKey.value = tempSheetApiKey.value;
            localStorage.setItem('sheet-api-key', tempSheetApiKey.value);
        }
        isSheetKeyModalOpen.value = false;
    };
    
    const openGeminiKeyModal = () => {
        tempGeminiApiKey.value = geminiApiKey.value;
        isGeminiKeyModalOpen.value = true;
        isSidebarOpen.value = false;
    };

    const handleGeminiKeySubmit = (e) => {
        e.preventDefault();
        if (tempGeminiApiKey.value.trim()) {
            geminiApiKey.value = tempGeminiApiKey.value;
            localStorage.setItem('gemini-api-key', tempGeminiApiKey.value);
        }
        isGeminiKeyModalOpen.value = false;
    };

    // --- Lifecycle & Watchers ---
    onMounted(async () => {
        const storedProfile = localStorage.getItem('user-profile');
        if (storedProfile) {
            userProfile.value = JSON.parse(storedProfile);
        }

        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
                callback: handleCredentialResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInButton"),
                { theme: "outline", size: "large", type: 'standard', text: 'signin_with' }
            );
        }
        
        const storedGeminiKey = localStorage.getItem('gemini-api-key');
        if (storedGeminiKey) {
            geminiApiKey.value = storedGeminiKey;
        }
        const storedKey = localStorage.getItem('sheet-api-key');
        if (storedKey) {
            sheetApiKey.value = storedKey;
        }
        sheetConfig.id = localStorage.getItem('sheet-id') || sheetConfig.id;
        sheetConfig.name = localStorage.getItem('sheet-name') || sheetConfig.name;
        sheetConfig.range = localStorage.getItem('sheet-range') || sheetConfig.range;

        try {
            await fetchPrompts();
        } catch(e) {
            // Error is set within fetchPrompts, no need to handle here
        }
    });

    watch(isAutoMode, (newValue) => {
        if (newValue && sheetPrompts.value.length > 0) {
            timerRef = window.setInterval(() => {
                if (isLoading.value) return;
                
                const nextIndex = (currentPromptIndex.value + 1) % sheetPrompts.value.length;
                performGeneration(sheetPrompts.value[nextIndex], baseImage.value?.file);
                currentPromptIndex.value = nextIndex;

            }, 10000);
        } else {
            if (timerRef) clearInterval(timerRef);
        }
    });

    watch(sheetApiKey, () => {
        fetchPrompts().catch(() => {});
    });
    
    watch(sheetConfig, () => {
        fetchPrompts().catch(() => {});
    });

    return {
      baseImage, sheetPrompts, currentPromptIndex, isFetchingSheet, generatedImages, isLoading, error, isAutoMode, fileInputRef, isAutoDownload,
      isSidebarOpen, isSheetModalOpen, userProfile, tempSheetConfig, isSubmittingSheet, sheetModalError, 
      isSheetKeyModalOpen, tempSheetApiKey,
      isGeminiKeyModalOpen, tempGeminiApiKey,
      handleDownload, performGeneration, handleFileChange, handleGenerateClick, handlePrevPrompt, handleNextPrompt, toggleAutoMode,
      handleLogout, openSheetModal, handleSheetConfigSubmit, 
      openSheetKeyModal, handleSheetKeySubmit,
      openGeminiKeyModal, handleGeminiKeySubmit,
    };
  },
  template: `
    <div class="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav class="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 shadow-lg">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Gemini Image Editor
          </h1>
          <button @click="isSidebarOpen = true" class="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Open settings">
            <settings-icon />
          </button>
        </div>
      </nav>

      <main class="container mx-auto px-4 py-8">
        <header class="text-center mb-10">
          <h1 class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Welcome to the Editor
          </h1>
          <p class="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload your image or generate one, then choose an editing instruction to evolve it with each step.
          </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Controls Section -->
          <div class="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col space-y-6 h-fit">
            <h2 class="text-2xl font-semibold border-b border-gray-700 pb-3">1. Upload Image</h2>
            <div class="flex flex-col">
              <input
                  type="file"
                  ref="fileInputRef"
                  @change="handleFileChange"
                  accept="image/*"
                  class="hidden"
                  id="imageUpload"
              />
              <label
                  for="imageUpload"
                  class="flex items-center justify-center p-4 text-lg font-bold bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300 cursor-pointer"
              >
                  <upload-icon class="w-6 h-6 mr-2" />
                  Choose an image to edit...
              </label>
              <p class="text-sm text-gray-500 mt-2 text-center">Or, start with a text prompt to generate the first image.</p>
            </div>

            <h2 class="text-2xl font-semibold border-b border-gray-700 pb-3">2. Choose Prompt</h2>
            <div v-if="isFetchingSheet" class="flex items-center space-x-2 text-gray-400">
                <spinner />
                <span>Loading creative prompts...</span>
            </div>
            <div v-else class="flex items-center justify-between space-x-2">
              <button
                @click="handlePrevPrompt"
                :disabled="currentPromptIndex === 0 || isLoading || isAutoMode"
                class="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous prompt"
              >
                <chevron-left-icon class="w-5 h-5" />
              </button>
              <p class="flex-grow text-center text-sm bg-gray-900/50 border border-gray-600 rounded-lg p-3 h-full min-h-[50px] flex items-center justify-center">
                {{ sheetPrompts.length > 0 ? sheetPrompts[currentPromptIndex].text : 'No prompts loaded.' }}
              </p>
              <button
                @click="handleNextPrompt"
                :disabled="currentPromptIndex >= sheetPrompts.length - 1 || isLoading || isAutoMode"
                class="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next prompt"
              >
                <chevron-right-icon class="w-5 h-5" />
              </button>
            </div>
            
            <h2 class="text-2xl font-semibold border-b border-gray-700 pb-3">3. Generate Image</h2>
            <div class="flex flex-col sm:flex-row gap-4">
              <button
                @click="handleGenerateClick"
                :disabled="isLoading || isFetchingSheet || isAutoMode"
                class="flex-1 flex items-center justify-center p-4 text-lg font-bold bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                <spinner v-if="isLoading && !isAutoMode" />
                <sparkles-icon v-else class="w-6 h-6 mr-2" />
                Generate
              </button>
               <button
                @click="toggleAutoMode"
                :disabled="isLoading || isFetchingSheet || (!isAutoMode && !baseImage)"
                :class="['flex-1 flex items-center justify-center p-4 text-lg font-bold rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none', isAutoMode ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600']"
              >
                <spinner v-if="isLoading && isAutoMode"/>
                <clock-icon v-else class="w-6 h-6 mr-2"/>
                {{ isAutoMode ? 'Stop Auto' : 'Auto-Generate' }}
              </button>
            </div>
            <div class="flex items-center justify-center pt-2 space-x-3">
              <span class="text-sm font-medium text-gray-400">Auto Download File</span>
              <label for="autoDownloadToggle" class="flex items-center cursor-pointer">
                  <div class="relative">
                      <input type="checkbox" id="autoDownloadToggle" class="sr-only" v-model="isAutoDownload">
                      <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
                      <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div>
                  </div>
              </label>
            </div>
          </div>
          
          <!-- Results Section -->
          <div class="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
            <h2 class="text-2xl font-semibold border-b border-gray-700 pb-3 mb-6">Image Canvas</h2>
            <div v-if="error" class="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4">{{ error }}</div>

            <div class="mb-6 rounded-lg overflow-hidden border-2 border-gray-700">
              <img v-if="baseImage" :src="baseImage.url" alt="Current base for editing" class="w-full h-auto object-contain max-h-[40vh]" />
              <div v-else class="flex items-center justify-center h-64 bg-gray-900/50 text-center text-gray-500">
                <div>
                  <p>Upload an image or generate one to start.</p>
                  <p class="text-sm mt-1">Your current image will appear here.</p>
                </div>
              </div>
            </div>

            <h3 class="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Generation History</h3>
            <div v-if="generatedImages.length === 0" class="text-center text-gray-500 py-8 flex-grow flex items-center justify-center">
                <p>Your generated images will appear here.</p>
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto flex-grow pr-2">
              <div v-for="(image, index) in generatedImages" :key="index" class="relative group rounded-lg overflow-hidden aspect-square">
                <img :src="image.url" :alt="'Generated with prompt: ' + image.prompt" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p class="text-center text-sm text-white">{{ image.prompt }}</p>
                </div>
                 <div class="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        @click="handleDownload(image.url, image.row, image.col)"
                        class="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-cyan-500 transition-all duration-300"
                        aria-label="Download image"
                        title="Download image"
                    >
                        <download-icon class="w-5 h-5"/>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar -->
      <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 z-30 bg-black/60 transition-all duration-300">
        <aside @click.stop :class="['fixed top-0 right-0 h-full w-full max-w-sm bg-gray-800 shadow-2xl transition-transform duration-300 transform', isSidebarOpen ? 'translate-x-0' : 'translate-x-full']">
          <div class="p-4 flex items-center justify-between border-b border-gray-700">
            <h2 class="text-2xl font-semibold">Settings</h2>
            <button @click="isSidebarOpen = false" class="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close settings">
              <close-icon />
            </button>
          </div>
          <div class="p-6 flex flex-col gap-y-6">
            <!-- User Profile Section -->
            <div class="bg-gray-700/50 p-4 rounded-xl">
              <h3 class="text-lg font-medium text-center mb-4">User Profile</h3>
              <div class="flex flex-col items-center space-y-4">
                <template v-if="userProfile">
                    <img :src="userProfile.picture" alt="User profile" class="w-20 h-20 rounded-full"/>
                    <div class="text-center">
                        <p class="font-semibold">{{ userProfile.name }}</p>
                        <p class="text-sm text-gray-400">{{ userProfile.email }}</p>
                    </div>
                    <button @click="handleLogout" class="w-full p-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                        Sign Out
                    </button>
                </template>
                <template v-else>
                    <p class="text-gray-400">Sign in to sync your settings.</p>
                    <div id="googleSignInButton"></div>
                </template>
              </div>
            </div>

            <!-- Prompts Source Section -->
            <div class="bg-gray-700/50 p-4 rounded-xl">
                <h3 class="text-lg font-medium text-center mb-4">Prompts Source</h3>
                <button @click="openSheetModal" class="w-full flex items-center justify-center p-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors">
                    <sheet-icon class="w-5 h-5 mr-2"/>
                    Change Sheet Source
                </button>
            </div>

            <!-- API Keys Section -->
            <div class="bg-gray-700/50 p-4 rounded-xl">
                <h3 class="text-lg font-medium text-center mb-4">API Keys</h3>
                <div class="space-y-4">
                    <button 
                        @click="openGeminiKeyModal"
                        class="w-full flex items-center justify-center p-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors"
                    >
                        <key-icon class="w-5 h-5 mr-2"/>
                        Set Gemini API Key
                    </button>
                    <button 
                        @click="openSheetKeyModal"
                        class="w-full flex items-center justify-center p-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-colors"
                    >
                        <key-icon class="w-5 h-5 mr-2"/>
                        Set Sheet API Key
                    </button>
                </div>
            </div>
          </div>
        </aside>
      </div>

       <!-- Sheet Config Modal -->
      <div v-if="isSheetModalOpen" class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
              <button @click="isSheetModalOpen = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close sheet settings">
                  <close-icon />
              </button>
              <h2 class="text-2xl font-bold mb-4 text-center">Set Google Sheet Source</h2>
              <p class="text-gray-400 mb-6 text-center">
                  Provide the ID, Sheet Name, and Cell Range for your public Google Sheet.
              </p>
              <div v-if="sheetModalError" class="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4 text-sm">{{ sheetModalError }}</div>
              <form @submit.prevent="handleSheetConfigSubmit" class="flex flex-col space-y-4">
                  <div>
                      <label for="sheetId" class="block text-sm font-medium text-gray-300 mb-1">Spreadsheet ID</label>
                      <input id="sheetId" type="text" v-model="tempSheetConfig.id" placeholder="e.g., 1eYW1NrfVQw-rWdxRdgC_rqMvFwgKdWPuE3hMWTODtt0" class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="Spreadsheet ID" required />
                  </div>
                    <div>
                      <label for="sheetName" class="block text-sm font-medium text-gray-300 mb-1">Sheet Name</label>
                      <input id="sheetName" type="text" v-model="tempSheetConfig.name" placeholder="e.g., Sheet1" class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="Sheet Name" required />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <label for="sheetStartCell" class="block text-sm font-medium text-gray-300 mb-1">From Cell</label>
                          <input id="sheetStartCell" type="text" v-model="tempSheetConfig.startCell" placeholder="e.g., D2" class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="Start Cell" required />
                      </div>
                      <div>
                          <label for="sheetEndCell" class="block text-sm font-medium text-gray-300 mb-1">To Cell</label>
                          <input id="sheetEndCell" type="text" v-model="tempSheetConfig.endCell" placeholder="e.g., AD999" class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" aria-label="End Cell" required />
                      </div>
                  </div>
                  <button type="submit" class="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-600 flex items-center justify-center" :disabled="isSubmittingSheet || !tempSheetConfig.id.trim() || !tempSheetConfig.name.trim() || !tempSheetConfig.startCell.trim() || !tempSheetConfig.endCell.trim()">
                      <spinner v-if="isSubmittingSheet" class="mr-2" />
                      {{ isSubmittingSheet ? 'Verifying...' : 'Save & Fetch Prompts' }}
                  </button>
              </form>
          </div>
      </div>

      <!-- Sheet API Key Modal -->
      <div v-if="isSheetKeyModalOpen" class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative">
              <button @click="isSheetKeyModalOpen = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close API key settings">
                  <close-icon />
              </button>
              <h2 class="text-2xl font-bold mb-4 text-center">Set Google Sheets API Key</h2>
              <p class="text-gray-400 mb-6 text-center">
                  Enter your Google Sheets API key to fetch prompts. This key is stored locally in your browser.
              </p>
              <form @submit.prevent="handleSheetKeySubmit" class="flex flex-col space-y-4">
                  <div>
                      <label for="sheetApiKeyInput" class="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                      <input 
                          id="sheetApiKeyInput"
                          type="password"
                          v-model="tempSheetApiKey"
                          placeholder="Enter your API key"
                          class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                          aria-label="Google Sheets API Key"
                          required
                      />
                  </div>
                  <button type="submit" class="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-600" :disabled="!tempSheetApiKey.trim()">
                      Save Key
                  </button>
              </form>
          </div>
      </div>
      
      <!-- Gemini API Key Modal -->
      <div v-if="isGeminiKeyModalOpen" class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative">
              <button @click="isGeminiKeyModalOpen = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Close API key settings">
                  <close-icon />
              </button>
              <h2 class="text-2xl font-bold mb-4 text-center">Set Gemini API Key</h2>
              <p class="text-gray-400 mb-6 text-center">
                  Enter your Gemini API key. This key is stored locally in your browser.
              </p>
              <form @submit.prevent="handleGeminiKeySubmit" class="flex flex-col space-y-4">
                  <div>
                      <label for="geminiApiKeyInput" class="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                      <input 
                          id="geminiApiKeyInput"
                          type="password"
                          v-model="tempGeminiApiKey"
                          placeholder="Enter your API key"
                          class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                          aria-label="Gemini API Key"
                          required
                      />
                  </div>
                  <button type="submit" class="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-600" :disabled="!tempGeminiApiKey.trim()">
                      Save Key
                  </button>
              </form>
          </div>
      </div>
    </div>
  `
}
