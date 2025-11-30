import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

await buildGenerator(getDirname(import.meta.url), {
  copy: [
    { from: '../../asIs/', to: './dist/assets/asIs' },
    { from: '../../utils/core-utilities/', to: './dist/assets/core-utilities' },
  ],
});
