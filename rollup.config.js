import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        sourcemap: true,
        entryFileNames: 'index.cjs',
      },
      {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: true,
        entryFileNames: 'index.esm.js',
      },
    ],
    plugins: [resolve(), commonjs(), json(), typescript({ tsconfig: './tsconfig.json' })],
  },
];