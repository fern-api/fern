import type { docsYml } from "@fern-api/configuration";
import type { LibrarySymbolRenderer } from "@fern-api/docs-markdown-utils";
import { type AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createLibrarySymbolRenderer } from "@fern-api/library-docs-generator";

/** The subset of a library configuration (raw or parsed) needed to locate its persisted IR. */
export type LibraryOutputSource = Record<string, { output: { path: string } }> | undefined;

/**
 * Builds the `<LibrarySymbol />` renderer for a docs build, mapping each library name in
 * docs.yml `libraries:` to its resolved `output.path` (where `fern docs md generate`
 * persisted the IR).
 *
 * Libraries declared on the current branch take precedence. Libraries that only exist in
 * a git-ref-backed version's docs.yml resolve against that version's materialized checkout.
 */
export function createDocsLibrarySymbolRenderer({
    libraries,
    absolutePathToFernFolder,
    versionContentSources = []
}: {
    libraries: LibraryOutputSource;
    absolutePathToFernFolder: AbsoluteFilePath;
    versionContentSources?: docsYml.VersionContentSource[];
}): LibrarySymbolRenderer {
    const outputDirs = new Map<string, AbsoluteFilePath>();

    const register = (source: LibraryOutputSource, baseDir: AbsoluteFilePath): void => {
        for (const [name, config] of Object.entries(source ?? {})) {
            if (!outputDirs.has(name)) {
                outputDirs.set(name, resolve(baseDir, config.output.path));
            }
        }
    };

    register(libraries, absolutePathToFernFolder);
    for (const contentSource of versionContentSources) {
        register(contentSource.libraries, contentSource.absolutePathToFernFolder);
    }

    return createLibrarySymbolRenderer({
        getLibraryOutputDir: (library) => outputDirs.get(library),
        knownLibraries: () => [...outputDirs.keys()]
    });
}

export function getVersionContentSources(
    parsedDocsConfig: docsYml.ParsedDocsConfiguration
): docsYml.VersionContentSource[] {
    if (parsedDocsConfig.navigation.type !== "versioned") {
        return [];
    }
    return parsedDocsConfig.navigation.versions.flatMap((version) =>
        version.contentSource != null ? [version.contentSource] : []
    );
}
