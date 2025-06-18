
export const getWasmUrl = async () => {
  try {
    const wasmUrl = new URL('./codec/enc/avif_enc.wasm', import.meta.url);
    return wasmUrl.toString();
  } catch (error) {
    console.error('Error loading WASM file:', error);
    return '/codec/enc/avif_enc.wasm';
  }
}; 