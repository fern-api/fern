import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

buildGenerator(getDirname(import.meta.url), {
    tsupOptions: {
        external: ['@wasm-fmt/ruff_fmt']
    }
});
