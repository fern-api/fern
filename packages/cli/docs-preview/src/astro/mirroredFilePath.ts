/**
 * The renderer emits uploaded assets as same-origin `{basepath}/_fern-files/{domain}/{hash}/{path}`
 * URLs (served by docs-router in production); here they are answered by the mirror's `/files` route.
 */
const MIRRORED_FILES_DIR = "_fern-files";

/**
 * The mirror path for a request under `{basepath}/_fern-files/`, or undefined if the renderer
 * should answer it. `_`-prefixed subdirs (`_nav`, `_mdx`, `_img`, `_icons`) are the renderer's
 * own generated assets, never uploaded files: those paths start with the site's domain.
 */
export function getMirroredFilePath(url: string | undefined, basepath: string): string | undefined {
    const prefix = `${basepath}/${MIRRORED_FILES_DIR}/`;
    if (url == null || !url.startsWith(prefix)) {
        return undefined;
    }
    const rest = url.slice(prefix.length);
    if (rest.startsWith("_")) {
        return undefined;
    }
    return `/files/${rest}`;
}
