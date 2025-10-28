
import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, Image, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function ImageUploader({ initialUrls = [], onUrlsChange, maxFiles = 1, label }) {
  const [files, setFiles] = useState(initialUrls.map(url => ({ url, uploading: false, preview: url, error: false })));
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const newFiles = Array.from(acceptedFiles).map(file => ({
      file,
      uploading: true,
      preview: URL.createObjectURL(file),
      url: null,
      error: false
    }));
    
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));

    const uploadPromises = newFiles.map(async (fileWrapper) => {
      try {
        const result = await UploadFile({ file: fileWrapper.file });
        return { ...fileWrapper, url: result.file_url, uploading: false, error: false };
      } catch (error) {
        console.error("Upload failed:", error);
        return { ...fileWrapper, uploading: false, error: true };
      }
    });

    const settledFiles = await Promise.all(uploadPromises);

    setFiles(prev => {
        const updated = [...prev];
        settledFiles.forEach(settled => {
            const index = updated.findIndex(f => f.preview === settled.preview);
            if (index !== -1) {
                // If it's an existing file being updated, make sure to revoke the old URL if it's no longer needed
                // For a successful upload, the preview URL might still be needed if it's the source for the img tag
                // If the file errored, we also keep the preview for displaying the error
                updated[index] = settled;
            }
        });
        
        // Only consider successfully uploaded files for finalUrls
        const finalUrls = updated.filter(f => f.url && !f.error).map(f => f.url);
        onUrlsChange(finalUrls);
        return updated;
    });

  }, [maxFiles, onUrlsChange]);

  const removeFile = (urlToRemove) => {
    const newFiles = files.filter(f => {
      // Clean up the object URL if it's a preview and not an actual URL
      if (f.preview === urlToRemove && !f.url) {
        URL.revokeObjectURL(f.preview);
      }
      return f.url !== urlToRemove && f.preview !== urlToRemove;
    });
    setFiles(newFiles);
    const finalUrls = newFiles.map(f => f.url).filter(Boolean);
    onUrlsChange(finalUrls);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
        inputRef.current.click();
    }
  };

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const isDisabled = files.filter(f => !f.error).length >= maxFiles; // Only count non-errored files towards maxFiles

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={isDisabled ? undefined : handleClick}
        className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors ${
          isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input 
            ref={inputRef} 
            type="file" 
            className="hidden"
            accept="image/*"
            multiple={maxFiles > 1}
            onChange={onFileInputChange}
            disabled={isDisabled}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isDragActive ? "Rilascia per caricare" : "Trascina qui le immagini o clicca per selezionarle"}
          </p>
          <p className="text-xs text-gray-500">Max {maxFiles} file</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square border rounded-lg overflow-hidden group shadow-sm">
              <img 
                src={file.preview} 
                alt="Anteprima" 
                className={`w-full h-full object-cover ${file.error ? 'filter blur-sm grayscale' : ''}`} 
                onLoad={() => {
                    // Revoke object URL after image loads if it's not needed anymore (e.g., if a real URL is available)
                    // However, for previews that might fail upload, we keep the object URL for display
                    if (file.url && file.preview && file.preview.startsWith('blob:')) {
                        URL.revokeObjectURL(file.preview);
                    }
                }} 
              />
              {file.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {file.error && (
                <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white p-2 text-center">
                  <AlertTriangle className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold">Upload fallito</p>
                </div>
              )}
              {/* Only show delete button if not uploading */}
              {!file.uploading && (
                 <div className="absolute top-1 right-1">
                    <button
                      type="button"
                      onClick={() => removeFile(file.preview)} // Using preview as identifier since it's unique even for failed uploads
                      className="p-1.5 bg-white/80 text-red-600 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
