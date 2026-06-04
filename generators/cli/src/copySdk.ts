import { cp } from "fs/promises";
import path from "path";

/**
 * Path inside the Docker image where the bundled SDK template lives.
 * `build.mjs` copies `./sdk` to `./dist/sdk` at generator-build time
 * (with [SDK_IGNORE] applied), and the Dockerfile then `COPY dist /dist`s
 * the result into the image.
 */
export const SDK_TEMPLATE_DIRECTORY = "/dist/sdk";

/** Files that should never appear in generated CLI output. */
const COPY_EXCLUDE = new Set([".synced-from"]);

/**
 * Copy the bundled Rust SDK template into the user's output directory.
 * Pure recursive copy — no templating, no substitution. For the alpha,
 * the template lands verbatim; per-CLI customization (binary name,
 * spec wiring, etc.) is layered on later.
 *
 * Internal provenance files (`.synced-from`) are excluded so they never
 * leak into customer repos.
 */
export async function copySdk(outputDir: string, sdkTemplateDir?: string): Promise<void> {
    const source = sdkTemplateDir ?? SDK_TEMPLATE_DIRECTORY;
    await cp(source, path.resolve(outputDir), {
        recursive: true,
        force: true,
        filter: (src: string) => !COPY_EXCLUDE.has(path.basename(src))
    });
}
