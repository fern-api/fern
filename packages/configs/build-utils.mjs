import tsup from 'tsup';
import { cp } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Standard build function for Fern generators
 * @param {string} dirname - The __dirname of the calling build.mjs file
 * @param {Object} options - Build options
 * @param {string} [options.entry='src/cli.ts'] - Entry point for tsup
 * @param {Object} [options.tsupOptions={}] - Additional tsup configuration options to merge
 * @param {string|string[]|Object|Object[]|null} [options.copyFrom=null] - Files/folders to copy after build
 *   Can be:
 *   - string: '../base/src/asIs' - copies to dist/
 *   - array of strings: ['../base/src/asIs', '../base/src/template'] - copies each to dist/
 *   - object: { from: '../base/src/asIs', to: 'dist/asIs' } - custom destination
 *   - array of objects: [{ from: '...', to: '...' }, ...]
 */
export async function buildGenerator(dirname, options = {}) {
    const {
        entry = 'src/cli.ts',
        tsupOptions = {},
        copyFrom = null
    } = options;

    // Build with tsup (merge default options with custom ones)
    const defaultTsupOptions = {
        entry: [entry],
        format: ['cjs'],
        sourcemap: true,
        clean: true,
        outDir: 'dist',
    };

    await tsup.build({
        ...defaultTsupOptions,
        ...tsupOptions,
    });

    // Copy additional files if needed
    if (copyFrom) {
        const copyOperations = Array.isArray(copyFrom) ? copyFrom : [copyFrom];

        for (const copyOp of copyOperations) {
            if (typeof copyOp === 'string') {
                // Simple string: copy to dist/
                await cp(
                    path.join(dirname, copyOp),
                    path.join(dirname, 'dist'),
                    { recursive: true }
                );
            } else if (typeof copyOp === 'object' && copyOp.from) {
                // Object with from/to: custom destination
                await cp(
                    path.join(dirname, copyOp.from),
                    path.join(dirname, copyOp.to),
                    { recursive: true, force: true }
                );
            }
        }
    }
}

/**
 * Helper to get __dirname in ESM modules
 * @param {string} importMetaUrl - import.meta.url from the calling module
 * @returns {string} The directory name
 */
export function getDirname(importMetaUrl) {
    return path.dirname(fileURLToPath(importMetaUrl));
}
