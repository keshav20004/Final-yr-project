import React, { useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface FileInputProps {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  accept: string;
}

export const FileInput: React.FC<FileInputProps> = ({ label, file, onFileChange, onClear, accept }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] || null;
    if (droppedFile && droppedFile.type === 'application/pdf') {
       onFileChange(droppedFile);
    }
  }, [onFileChange]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</span>
      {file ? (
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <span className="text-sm truncate text-slate-800 dark:text-slate-200" title={file.name}>
              {file.name}
            </span>
          </div>
          <button
            onClick={onClear}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-700"
            aria-label="Clear file"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="text-center" onClick={openFileDialog}>
            <UploadIcon className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">PDF only</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
};
