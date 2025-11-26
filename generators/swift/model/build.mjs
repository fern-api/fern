import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

await buildGenerator(getDirname(import.meta.url), {
    copy: [{ from: '../base/src/asIs', to: './dist/asIs' }, { from: '../base/src/template', to: './dist/template' }]
});
