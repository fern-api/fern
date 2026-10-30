import type { docsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import type { LibrarySymbolRenderer } from "@fern-api/docs-markdown-utils";
import { type AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createLibrarySymbolRenderer, type LibrarySymbolSource } from "@fern-api/library-docs-generator";
import path from "path";

/** The subset of a library configuration (raw or parsed) needed to locate its persisted IR. */
export type LibraryOutputSource =
    | Record<string, { output: { path: string; pages?: boolean }; lang: "python" | "cpp" }>
    | undefined;

interface LibraryScope {
    /** Fern folder whose docs.yml declares `libraries`; pages under it resolve against them. */
    absolutePathToFernFolder: AbsoluteFilePath;
    libraries: Map<string, LibrarySymbolSource>;
}

function toScope(source: LibraryOutputSource, absolutePathToFernFolder: AbsoluteFilePath): LibraryScope {
    const libraries = new Map<string, LibrarySymbolSource>();
    for (const [name, config] of Object.entries(source ?? {})) {
        libraries.set(name, {
            outputDir: resolve(absolutePathToFernFolder, config.output.path),
            lang: config.lang,
            generatesPages: config.output.pages ?? true
        });
    }
    return { absolutePathToFernFolder, libraries };
}

function isInside(folder: AbsoluteFilePath, file: AbsoluteFilePath): boolean {
    const rel = path.relative(folder, file);
    return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

/**
 * Builds the `<LibrarySymbol />` renderer for a docs build. Each authored page resolves
 * `library` against the docs.yml that owns it: pages materialized from a git-ref-backed
 * version use that version's `libraries:` (so `v1` and `v2` may both declare `sdk` with
 * different IR); every other page uses the current branch's docs.yml.
 */
export function createDocsLibrarySymbolRenderer({
    libraries,
    absolutePathToFernFolder,
    versionContentSources = [],
    onWarning
}: {
    libraries: LibraryOutputSource;
    absolutePathToFernFolder: AbsoluteFilePath;
    versionContentSources?: docsYml.VersionContentSource[];
    onWarning?: (message: string) => void;
}): LibrarySymbolRenderer {
    const currentBranch = toScope(libraries, absolutePathToFernFolder);
    // Longest fern-folder path first so nested checkouts resolve to the most specific scope.
    const versionScopes = versionContentSources
        .map((contentSource) => toScope(contentSource.libraries, contentSource.absolutePathToFernFolder))
        .sort((a, b) => b.absolutePathToFernFolder.length - a.absolutePathToFernFolder.length);

    const scopeFor = (absolutePathToMarkdownFile: AbsoluteFilePath): LibraryScope =>
        versionScopes.find((scope) => isInside(scope.absolutePathToFernFolder, absolutePathToMarkdownFile)) ??
        currentBranch;

    return createLibrarySymbolRenderer({
        getLibrarySource: (library, absolutePathToMarkdownFile) =>
            scopeFor(absolutePathToMarkdownFile).libraries.get(library),
        knownLibraries: (absolutePathToMarkdownFile) => [...scopeFor(absolutePathToMarkdownFile).libraries.keys()],
        onWarning
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
