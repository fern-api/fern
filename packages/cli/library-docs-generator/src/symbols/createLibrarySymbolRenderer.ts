import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { type PersistedLibraryIr, readLibraryIr } from "./libraryIrFile.js";
import {
    DEFAULT_LIBRARY_SYMBOL_HEADING,
    type RenderedLibrarySymbol,
    renderLibrarySymbol
} from "./renderLibrarySymbol.js";

/** Where a configured library's IR lives and how it was configured in docs.yml. */
export interface LibrarySymbolSource {
    /** Absolute, resolved `output.path` of the library (where `fern docs md generate` persisted the IR). */
    outputDir: AbsoluteFilePath;
    /** docs.yml `language` for the library, when the caller knows it. Validated against the persisted IR. */
    lang: PersistedLibraryIr["lang"] | undefined;
    /**
     * Whether `fern docs md generate` writes per-symbol pages for this library
     * (`output.pages`, default true). When false, type references are rendered as plain
     * code instead of links into the (non-existent) generated pages.
     */
    generatesPages: boolean;
}

export interface LibrarySymbolRendererOptions {
    /**
     * Resolve a library name (key in docs.yml `libraries:`) for the authored page at
     * `absolutePathToMarkdownFile`. Return `undefined` for unknown libraries.
     */
    getLibrarySource: (
        library: string,
        absolutePathToMarkdownFile: AbsoluteFilePath
    ) => LibrarySymbolSource | undefined;
    /** Library names to list in the "unknown library" error for the given page. */
    knownLibraries: (absolutePathToMarkdownFile: AbsoluteFilePath) => string[];
    /**
     * Receives build warnings, e.g. when a library with `output.pages: false` is included
     * via `<LibrarySymbol />` and its type references therefore cannot be linked.
     */
    onWarning?: (message: string) => void;
}

export interface LibrarySymbolRenderRequest {
    library: string;
    name: string;
    heading: number | undefined;
    members: string[] | undefined;
}

/**
 * Build the renderer consumed by `replaceLibrarySymbols` in `@fern-api/docs-markdown-utils`.
 * Persisted IR files are read lazily and cached per output directory for the lifetime of
 * the renderer.
 */
export function createLibrarySymbolRenderer(
    options: LibrarySymbolRendererOptions
): (
    request: LibrarySymbolRenderRequest,
    absolutePathToMarkdownFile: AbsoluteFilePath
) => Promise<RenderedLibrarySymbol> {
    const irCache = new Map<AbsoluteFilePath, Promise<PersistedLibraryIr>>();
    const warnedNoPages = new Set<AbsoluteFilePath>();

    function warnIfPagesDisabled(library: string, source: LibrarySymbolSource): void {
        if (source.generatesPages || options.onWarning == null || warnedNoPages.has(source.outputDir)) {
            return;
        }
        warnedNoPages.add(source.outputDir);
        options.onWarning(
            `Library '${library}' is configured with 'output.pages: false', so type references inside ` +
                `<LibrarySymbol /> render as plain text and the library is not searchable. ` +
                `Set 'output.pages: true' (default) to keep type links and search coverage.`
        );
    }

    function readCached(outputDir: AbsoluteFilePath): Promise<PersistedLibraryIr> {
        const cachedIr = irCache.get(outputDir);
        if (cachedIr != null) {
            return cachedIr;
        }
        const loaded = readLibraryIr(outputDir);
        irCache.set(outputDir, loaded);
        return loaded;
    }

    // Validated on every request (not once per file) so two libraries sharing an output.path
    // cannot both pass on the strength of the first one's IR.
    async function loadIr(library: string, source: LibrarySymbolSource): Promise<PersistedLibraryIr> {
        const persisted = await readCached(source.outputDir);
        if (persisted.library !== library) {
            throw new Error(
                `Persisted library IR at ${source.outputDir} was generated for library '${persisted.library}', ` +
                    `not '${library}'. Re-run 'fern docs md generate' so each library's output.path holds its own IR.`
            );
        }
        if (source.lang != null && persisted.lang !== source.lang) {
            throw new Error(
                `Persisted library IR at ${source.outputDir} is '${persisted.lang}', but library '${library}' ` +
                    `is configured with language '${source.lang}'. Re-run 'fern docs md generate'.`
            );
        }
        return persisted;
    }

    return async (request, absolutePathToMarkdownFile) => {
        const source = options.getLibrarySource(request.library, absolutePathToMarkdownFile);
        if (source == null) {
            const known = options.knownLibraries(absolutePathToMarkdownFile);
            throw new Error(
                `Unknown library '${request.library}'. ` +
                    (known.length > 0
                        ? `Libraries configured in docs.yml: ${known.join(", ")}`
                        : "No libraries are configured under 'libraries:' in docs.yml.")
            );
        }
        warnIfPagesDisabled(request.library, source);
        const persisted = await loadIr(request.library, source);
        return renderLibrarySymbol(persisted, {
            name: request.name,
            heading: request.heading ?? DEFAULT_LIBRARY_SYMBOL_HEADING,
            members: request.members,
            linkToGeneratedPages: source.generatesPages
        });
    };
}
