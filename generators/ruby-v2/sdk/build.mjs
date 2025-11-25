import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

buildGenerator(getDirname(import.meta.url), {
    copyFrom: { from: '../base/src/asIs', to: './dist/asIs' }
});
