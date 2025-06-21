# UpAvif - React AVIF Converter & Uploader

A lightweight React hook for converting images to AVIF/WebP format and uploading them to a server. Reduce image file sizes by up to 90% while maintaining excellent quality.

## Features

- 🚀 **Easy to use** - Simple React hook interface
- 📦 **Small bundle size** - Zero external dependencies for image conversion
- 🎯 **Type-safe** - Full TypeScript support
- 🔧 **Customizable** - Configure upload URL, form field names, and quality settings
- ⚡ **Fast conversion** - Uses native browser Canvas API for efficient encoding
- 🖼️ **Multiple formats** - Convert to AVIF or WebP, or upload original files
- 🌐 **Wide compatibility** - Works in all modern browsers with native format support

## Installation

```bash
npm i upavif
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import { useUpAvif } from 'upavif';

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadAvif, status, error, uploadResult } = useUpAvif();

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const result = await uploadAvif(selectedFile, { quality: 0.8 });
      if (result) {
        console.log('Upload successful:', result);
      }
    }
  };

  const isLoading = status === 'converting' || status === 'uploading';

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
        {status === 'converting' && 'Converting...'}
        {status === 'uploading' && 'Uploading...'}
        {status === 'idle' && 'Convert to AVIF & Upload'}
        {status === 'success' && 'Success!'}
        {status === 'error' && 'Try Again'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {uploadResult && (
        <div>
          <p>Upload successful!</p>
          <img src={uploadResult.directLink} alt="Converted" style={{ maxWidth: '100%' }} />
          {uploadResult.originalSizeKB && (
            <p>Original size: {uploadResult.originalSizeKB} KB</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Advanced Usage

### Multiple Upload Methods

```jsx
import React, { useState } from 'react';
import { useUpAvif } from 'upavif';

function AdvancedUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [quality, setQuality] = useState(0.75);
  
  const { upload, uploadAvif, uploadWebp, status, error, uploadResult } = useUpAvif({
    uploadUrl: 'https://your-api.com/upload',
    formFieldName: 'image'
  });

  const handleDirectUpload = async () => {
    // Upload original file without conversion
    if (selectedFile) {
      await upload(selectedFile);
    }
  };

  const handleAvifUpload = async () => {
    // Convert to AVIF and upload
    if (selectedFile) {
      await uploadAvif(selectedFile, { quality });
    }
  };

  const handleWebpUpload = async () => {
    // Convert to WebP and upload
    if (selectedFile) {
      await uploadWebp(selectedFile, { quality });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      
      <div>
        <label>Quality: {Math.round(quality * 100)}%</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <button onClick={handleDirectUpload}>Direct Upload</button>
        <button onClick={handleAvifUpload}>Convert to AVIF</button>
        <button onClick={handleWebpUpload}>Convert to WebP</button>
      </div>

      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
      {uploadResult && <img src={uploadResult.directLink} alt="Result" />}
    </div>
  );
}
```

## API Reference

### `useUpAvif(options?)`

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `uploadUrl` | `string` | `'https://avifupload.vercel.app/'` | The endpoint to upload files |
| `formFieldName` | `string` | `'image'` | The form field name for the uploaded file |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `upload` | `(file: File) => Promise<UploadResponse \| undefined>` | Upload original file without conversion |
| `uploadAvif` | `(file: File, options?: ConversionOptions) => Promise<UploadResponse \| undefined>` | Convert to AVIF and upload |
| `uploadWebp` | `(file: File, options?: ConversionOptions) => Promise<UploadResponse \| undefined>` | Convert to WebP and upload |
| `status` | `ConverterStatus` | Current operation status |
| `error` | `string \| null` | Error message if operation fails |
| `uploadResult` | `UploadResponse \| null` | Result data from successful upload |

#### ConversionOptions

```typescript
interface ConversionOptions {
  quality?: number; // 0.1 to 1.0, default: 0.75
}
```

#### ConverterStatus

```typescript
type ConverterStatus = 'idle' | 'converting' | 'uploading' | 'success' | 'error';
```

#### UploadResponse

```typescript
interface UploadResponse {
  success: boolean;
  directLink: string;        // Direct URL to uploaded image
  pageUrl?: string;          // Optional page URL
  originalSizeKB?: number;   // Original file size in KB
}
```

## Supported Image Formats

- **Input**: JPEG, PNG, WebP, and other formats supported by Canvas API
- **Output**: AVIF, WebP (based on method used)

## Browser Compatibility

This library uses the native Canvas API for image conversion:

### AVIF Support
- Chrome 85+
- Firefox 93+
- Safari 16.4+
- Edge 85+

### WebP Support  
- Chrome 23+
- Firefox 65+
- Safari 14+
- Edge 18+

**Note**: The library will show an error if the browser doesn't support the target format.

## Benefits of AVIF

- **Superior compression**: Up to 90% smaller file sizes compared to JPEG
- **High quality**: Better visual quality at smaller file sizes  
- **Modern standard**: Next-generation image format with growing browser support

## Backward Compatibility

The old `useAvifConverter` hook is still available as an alias:

```jsx
import { useAvifConverter } from 'upavif'; // Same as useUpAvif
```

## Error Handling

```jsx
const { uploadAvif, status, error } = useUpAvif();

const handleUpload = async (file) => {
  const result = await uploadAvif(file);
  
  if (status === 'error') {
    console.error('Upload failed:', error);
    // Handle error (show toast, retry logic, etc.)
  } else if (status === 'success' && result) {
    console.log('Success:', result.directLink);
    // Handle success
  }
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Gaurav Sharma](https://github.com/gauravsharma2003)

## Repository

[GitHub - UpAvif](https://github.com/gauravsharma2003/UpAvif) 