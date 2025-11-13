
import React, { useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  label: string;
  description: string;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, description, previewUrl, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-colors duration-300 flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl font-bold text-slate-100">{label}</h3>
      <p className="text-slate-400 mb-4">{description}</p>
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative group"
        onClick={handleClick}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg font-semibold">Change Photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
