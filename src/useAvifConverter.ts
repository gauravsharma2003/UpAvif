import { useState, useCallback } from 'react';

type ConverterStatus = 'idle' | 'converting' | 'uploading' | 'success' | 'error';
type ImageFormat = 'avif' | 'webp';

interface UploadResponse {
  success: boolean;
  directLink: string;
  pageUrl?: string;
  originalSizeKB?: number;
}

interface ConversionOptions {
  quality?: number; 
}

interface UseAvifConverterProps {
  uploadUrl?: string;
  formFieldName?: string;
}

interface UseAvifConverterReturn {
  upload: (imageFile: File) => Promise<UploadResponse | undefined>;
  uploadAvif: (imageFile: File, options?: ConversionOptions) => Promise<UploadResponse | undefined>;
  uploadWebp: (imageFile: File, options?: ConversionOptions) => Promise<UploadResponse | undefined>;
  status: ConverterStatus;
  error: string | null;
  uploadResult: UploadResponse | null;
}


export const useUpAvif = ({
  uploadUrl = 'https://avifupload.vercel.app/',
  formFieldName = 'image',
}: UseAvifConverterProps = {}): UseAvifConverterReturn => {

  const [status, setStatus] = useState<ConverterStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  const resetState = () => {
    setStatus('idle');
    setError(null);
    setUploadResult(null);
  };

  const performUpload = useCallback(async (fileToUpload: File): Promise<UploadResponse | undefined> => {
    setStatus('uploading');
    const formData = new FormData();
    formData.append(formFieldName, fileToUpload, fileToUpload.name);

    try {
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      const result: UploadResponse = await response.json();
      if (!result.success || !result.directLink) throw new Error("API response invalid.");

      setUploadResult(result);
      setStatus('success');
      return result;

    } catch (e: any) {
      setError(e.message || 'An unknown upload error occurred.');
      setStatus('error');
      console.error('Upload failed:', e);
      return undefined;
    }
  }, [uploadUrl, formFieldName]);
  
  const convertAndUploadInternal = useCallback(async (
    imageFile: File,
    format: ImageFormat,
    options: ConversionOptions = {}
  ): Promise<UploadResponse | undefined> => {
    resetState();

    try {
      setStatus('converting');

      const mimeType = `image/${format}`;
      const quality = options.quality ?? 0.75; 
      
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error('Failed to load image.'));
              img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Failed to read file.'));
          reader.readAsDataURL(imageFile);
      });
      
      const convertedBlob = await new Promise<Blob>((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Could not get canvas context.'));
          
          ctx.drawImage(image, 0, 0);

          canvas.toBlob(blob => {
              if (blob) {
                  resolve(blob);
              } else {
                  reject(new Error(`Conversion to ${format} failed. Your browser likely does not support encoding this format.`));
              }
          }, mimeType, quality);
      });

      const originalName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || 'image';
      const convertedFile = new File([convertedBlob], `${originalName}.${format}`, { type: mimeType });

      return await performUpload(convertedFile);

    } catch (e: any) {
      setError(e.message);
      setStatus('error');
      console.error(`Operation failed for ${format}:`, e);
      return undefined;
    }
  }, [performUpload]);

  const upload = useCallback(async (imageFile: File): Promise<UploadResponse | undefined> => {
    resetState();
    return await performUpload(imageFile);
  }, [performUpload]);

  const uploadAvif = useCallback(async (imageFile: File, options?: ConversionOptions): Promise<UploadResponse | undefined> => {
    return await convertAndUploadInternal(imageFile, 'avif', options);
  }, [convertAndUploadInternal]);

  const uploadWebp = useCallback(async (imageFile: File, options?: ConversionOptions): Promise<UploadResponse | undefined> => {
    return await convertAndUploadInternal(imageFile, 'webp', options);
  }, [convertAndUploadInternal]);

  return { 
    upload, 
    uploadAvif, 
    uploadWebp,
    status,
    error,
    uploadResult
  };
};

// Export types
export type { ConverterStatus, UploadResponse, ConversionOptions, UseAvifConverterProps, UseAvifConverterReturn };

// Backward compatibility alias
export const useAvifConverter = useUpAvif;