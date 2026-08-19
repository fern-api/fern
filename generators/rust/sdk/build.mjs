import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

await buildGenerator(getDirname(import.meta.url), {
  tsupOptions: {
    noExternal: [/@fern-api\/.*/, /dedent/],
  },
  copy: [
    { from: './features.yml', to: './dist/assets/features.yml' },
    { from: '../base/src/asIs', to: './dist/asIs' },
  ],
});
