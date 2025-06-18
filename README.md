# UpAvif - React AVIF Converter & Uploader

A lightweight React hook for converting images to AVIF format and uploading them to a server. Reduce image file sizes by up to 90% while maintaining excellent quality.

## Features

- 🚀 **Easy to use** - Simple React hook interface
- 📦 **Small bundle size** - Minimal dependencies
- 🎯 **Type-safe** - Full TypeScript support
- 🔧 **Customizable** - Configure upload URL and form field names
- ⚡ **Fast conversion** - Uses WebAssembly for efficient AVIF encoding
- 🖼️ **Format support** - Convert from JPEG, PNG, WebP to AVIF

## Installation

```bash
npm i upavif
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import { useAvifConverter } from 'upavif';

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { convertAndUpload, isLoading, error, avifUrl } = useAvifConverter();

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const result = await convertAndUpload(selectedFile);
      if (result) {
        console.log('Upload successful:', result);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
        {isLoading ? 'Converting & Uploading...' : 'Upload as AVIF'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {avifUrl && (
        <div>
          <p>Upload successful!</p>
          <img src={avifUrl} alt="Converted AVIF" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
```

## Custom Configuration

You can customize the upload endpoint and form field name:

```jsx
const { convertAndUpload, isLoading, error, avifUrl } = useAvifConverter({
  uploadUrl: 'https://your-api.com/upload',
  formFieldName: 'avifImage'
});
```

## API Reference

### `useAvifConverter(options?)`

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `uploadUrl` | `string` | `'https://avifupload.vercel.app/'` | The endpoint to upload the converted AVIF file |
| `formFieldName` | `string` | `'image'` | The form field name for the uploaded file |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `convertAndUpload` | `(file: File) => Promise<UploadResponse \| undefined>` | Function to convert and upload an image file |
| `isLoading` | `boolean` | Loading state during conversion and upload |
| `error` | `string \| null` | Error message if operation fails |
| `avifUrl` | `string \| null` | URL of the uploaded AVIF image |

#### UploadResponse

```typescript
interface UploadResponse {
  success: boolean;
  originalSizeKB: number;
  directLink: string;
  pageUrl: string;
}
```

## Supported Image Formats

- **Input**: JPEG, PNG, WebP
- **Output**: AVIF

## Browser Compatibility

This library uses WebAssembly and modern JavaScript features. It works in:

- Chrome 85+
- Firefox 93+
- Safari 16.4+
- Edge 85+

## Benefits of AVIF

- **Superior compression**: Up to 90% smaller file sizes compared to JPEG
- **High quality**: Better visual quality at smaller file sizes
- **Modern standard**: Next-generation image format supported by major browsers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Gaurav Sharma](https://github.com/gauravsharma2003)

## Repository

[GitHub - UpAvif](https://github.com/gauravsharma2003/UpAvif) 