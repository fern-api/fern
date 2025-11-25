import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

buildGenerator(getDirname(import.meta.url), {
  copyFrom: [
    { from: '../../asIs/', to: './dist/assets/asIs' },
    { from: '../../utils/core-utilities/', to: './dist/assets/core-utilities' },
  ],
});
