import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { type PersistedLibraryIr, readLibraryIr } from "./libraryIrFile.js";
import { DEFAULT_LIBRARY_SYMBOL_HEADING, renderLibrarySymbol } from "./renderLibrarySymbol.js";

export interface LibrarySymbolRendererOptions {
    /**
     * Map of library name (key in docs.yml `libraries:`) to the absolute, resolved
     * `output.path` for that library. Return `undefined` for unknown libraries.
     */
    getLibraryOutputDir: (library: string) => AbsoluteFilePath | undefined;
    /** Library names to list in the "unknown library" error. */
    knownLibraries: () => string[];
}

export interface LibrarySymbolRenderRequest {
    library: string;
    name: string;
    heading: number | undefined;
    members: string[] | undefined;
}

/**
 * Build the renderer consumed by `replaceLibrarySymbols` in `@fern-api/docs-markdown-utils`.
 * Persisted IR files are read lazily and cached for the lifetime of the renderer.
 */
export function createLibrarySymbolRenderer(
    options: LibrarySymbolRendererOptions
): (request: LibrarySymbolRenderRequest) => Promise<string> {
    const irCache = new Map<string, Promise<PersistedLibraryIr>>();

    function loadIr(library: string): Promise<PersistedLibraryIr> {
        const cachedIr = irCache.get(library);
        if (cachedIr != null) {
            return cachedIr;
        }
        const outputDir = options.getLibraryOutputDir(library);
        if (outputDir == null) {
            const known = options.knownLibraries();
            return Promise.reject(
                new Error(
                    `Unknown library '${library}'. ` +
                        (known.length > 0
                            ? `Libraries configured in docs.yml: ${known.join(", ")}`
                            : "No libraries are configured under 'libraries:' in docs.yml.")
                )
            );
        }
        const loaded = readLibraryIr(outputDir);
        irCache.set(library, loaded);
        return loaded;
    }

    return async (request) => {
        const persisted = await loadIr(request.library);
        const { mdx } = renderLibrarySymbol(persisted, {
            name: request.name,
            heading: request.heading ?? DEFAULT_LIBRARY_SYMBOL_HEADING,
            members: request.members
        });
        return mdx;
    };
}
