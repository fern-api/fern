import type { docsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import type { LibrarySymbolRenderer } from "@fern-api/docs-markdown-utils";
import { type AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createLibrarySymbolRenderer } from "@fern-api/library-docs-generator";

/** The subset of a library configuration (raw or parsed) needed to locate its persisted IR. */
export type LibraryOutputSource = Record<string, { output: { path: string; pages?: boolean } }> | undefined;

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
    const generatesPages = new Map<string, boolean>();

    const register = (source: LibraryOutputSource, baseDir: AbsoluteFilePath): void => {
        for (const [name, config] of Object.entries(source ?? {})) {
            if (!outputDirs.has(name)) {
                outputDirs.set(name, resolve(baseDir, config.output.path));
                generatesPages.set(name, config.output.pages ?? true);
            }
        }
    };

    register(libraries, absolutePathToFernFolder);
    for (const contentSource of versionContentSources) {
        register(contentSource.libraries, contentSource.absolutePathToFernFolder);
    }

    return createLibrarySymbolRenderer({
        getLibraryOutputDir: (library) => outputDirs.get(library),
        hasGeneratedPages: (library) => generatesPages.get(library) ?? true,
        knownLibraries: () => [...outputDirs.keys()]
    });
}

/** Content sources of every git-ref-backed version, including versions nested inside product groups. */
export function getVersionContentSources(
    navigation: docsYml.DocsNavigationConfiguration
): docsYml.VersionContentSource[] {
    return collectVersions(navigation).flatMap((version) =>
        version.contentSource != null ? [version.contentSource] : []
    );
}

function collectVersions(navigation: docsYml.DocsNavigationConfiguration): docsYml.VersionInfo[] {
    switch (navigation.type) {
        case "versioned":
            return navigation.versions;
        case "productgroup":
            return navigation.products.flatMap((product) =>
                product.type === "internal" && product.navigation.type === "versioned"
                    ? product.navigation.versions
                    : []
            );
        case "untabbed":
        case "tabbed":
            return [];
        default:
            assertNever(navigation);
    }
}
