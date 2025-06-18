import { useState, useCallback } from 'react';
import { encode } from '@jsquash/avif';
import { getWasmUrl } from './wasmInit';

let initialized = false;
const initializeWasm = async () => {
  if (!initialized) {
    const wasmUrl = getWasmUrl();
    // @ts-ignore - the encode module has an internal setWasmUrl function
    if (encode.setWasmUrl) {
      // @ts-ignore
      await encode.setWasmUrl(wasmUrl);
      initialized = true;
    }
  }
};

interface UploadResponse {
  success: boolean;
  originalSizeKB: number;
  directLink: string;
  pageUrl: string;
}

interface UseAvifConverterProps {
  uploadUrl?: string;
  formFieldName?: string;
}

interface UseAvifConverterReturn {
  convertAndUpload: (imageFile: File) => Promise<UploadResponse | undefined>;
  isLoading: boolean;
  error: string | null;
  avifUrl: string | null;
}

async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export const useAvifConverter = ({
  uploadUrl = 'https://avifupload.vercel.app/',
  formFieldName = 'image',
}: UseAvifConverterProps = {}): UseAvifConverterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avifUrl, setAvifUrl] = useState<string | null>(null);

  const convertAndUpload = useCallback(async (imageFile: File): Promise<UploadResponse | undefined> => {
    setIsLoading(true);
    setError(null);
    setAvifUrl(null);

    try {
      await initializeWasm();

      const imageData = await fileToImageData(imageFile);

      const avifBinary = await encode(imageData);
      if (!avifBinary) throw new Error('AVIF encoding failed - no binary data returned');

      const avifBlob = new Blob([avifBinary], { type: 'image/avif' });
      
      const avifFile = new File([avifBlob], 'image.avif', { type: 'image/avif' });

      const formData = new FormData();
      formData.append(formFieldName, avifFile);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.directLink) {
        throw new Error("API response is invalid. Expected 'success' and 'directLink' fields.");
      }

      setAvifUrl(result.directLink);
      return {
        success: result.success,
        originalSizeKB: result.originalSizeKB,
        directLink: result.directLink,
        pageUrl: result.pageUrl
      };

    } catch (e: any) {
      console.error('Operation failed:', e);
      setError(e.message || 'An unknown error occurred.');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [uploadUrl, formFieldName]);

  return { convertAndUpload, isLoading, error, avifUrl };
}; 