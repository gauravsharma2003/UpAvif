import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true
    }
  ],
  external: ['react', '@jsquash/avif'],
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
    copy({
      targets: [
        { 
          src: 'node_modules/@jsquash/avif/codec/enc/avif_enc*.wasm', 
          dest: 'dist/codec/enc' 
        }
      ]
    })
  ]
}; 