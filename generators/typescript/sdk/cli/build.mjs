import { buildGenerator, getDirname } from '@fern-api/configs/build-utils.mjs';

await buildGenerator(getDirname(import.meta.url), {
    copy: [
        { from: '../features.yml', to: './dist/assets/features.yml' },
        { from: '../../asIs/readme/binary-response-addendum.md', to: './dist/assets/readme/binary-response-addendum.md' },
        { from: '../../asIs/', to: './dist/assets/asIs' },
        { from: '../../utils/core-utilities/', to: './dist/assets/core-utilities' },
    ],
});
