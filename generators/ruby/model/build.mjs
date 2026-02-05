import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

await buildGenerator(getDirname(import.meta.url));
