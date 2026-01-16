import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  maxSizeMB?: number;
}

export default function ImageUploader({ onImageSelect, maxSizeMB = 10 }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (!file.type.startsWith('image/')) {
      return 'Le fichier doit être une image';
    }
    
    if (file.size > maxSize) {
      return `L'image ne doit pas dépasser ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelect(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${error ? 'border-red-500 bg-red-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Cliquez pour uploader</span> ou glissez-déposez
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, JPEG jusqu'à {maxSizeMB}MB
          </p>
          
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain bg-gray-50"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Supprimer l'image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center text-sm text-gray-500">
        <ImageIcon className="w-4 h-4 mr-2" />
        <span>Formats acceptés: JPG, PNG, JPEG</span>
      </div>
    </div>
  );
}