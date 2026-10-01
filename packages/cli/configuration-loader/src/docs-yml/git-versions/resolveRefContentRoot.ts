import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration";
import { sanitizeNullValues } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { getVersionContentRef } from "./getVersionContentRef.js";
import { MaterializedGitRef } from "./materializeGitRef.js";

/**
 * Where in the current branch's docs.yml a ref-backed version is declared: at the site
 * level (`versions:`) or under a product (`products[].versions:`). The same product is
 * located in the ref's docs.yml to find the version's content.
 */
export type RefVersionScope = { type: "site" } | { type: "product"; displayName: string; slug: string | undefined };

/**
 * The content root selected for a git-ref-backed version: the navigation to build
 * plus the config file that anchors relative page paths, and the libraries declared
 * at the ref.
 */
export interface ResolvedRefContentRoot {
    tabs: docsYml.RawSchemas.VersionFileConfig["tabs"];
    landingPage: docsYml.RawSchemas.VersionFileConfig["landingPage"];
    navigation: docsYml.RawSchemas.NavigationConfig;
    absoluteFilepathToConfig: AbsoluteFilePath;
    rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> | undefined;
    /** The `substitutions` map of the selected version file at the ref, if any. */
    versionFileSubstitutions: Record<string, string> | undefined;
    /** The substitution configuration of the docs.yml at the ref. */
    docsSubstitutionConfig: docsYml.DocsSubstitutionConfig;
}

async function loadYamlFile(absoluteFilepath: AbsoluteFilePath, context: TaskContext): Promise<unknown> {
    let contents: unknown;
    try {
        contents = yaml.load((await readFile(absoluteFilepath)).toString());
    } catch (error) {
        if (error instanceof yaml.YAMLException) {
            throw new CliError({
                message: `Failed to parse ${absoluteFilepath}: ${error.message}`,
                code: CliError.Code.ParseError
            });
        }
        throw error;
    }
    return sanitizeNullValues(contents, [], []);
}

async function readVersionFile({
    absoluteFilepathToConfig,
    rawLibraries,
    docsSubstitutionConfig,
    context
}: {
    absoluteFilepathToConfig: AbsoluteFilePath;
    rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> | undefined;
    docsSubstitutionConfig: docsYml.DocsSubstitutionConfig;
    context: TaskContext;
}): Promise<ResolvedRefContentRoot> {
    const parsed = docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(
        await loadYamlFile(absoluteFilepathToConfig, context)
    );
    return {
        tabs: parsed.tabs,
        landingPage: parsed.landingPage,
        navigation: parsed.navigation,
        absoluteFilepathToConfig,
        rawLibraries,
        versionFileSubstitutions: parsed.substitutions,
        docsSubstitutionConfig
    };
}

/** The first version at the ref built from its own working tree (a `path:` entry, not another `ref:`). */
function getWorkingTreeVersionPath(versions: docsYml.RawSchemas.VersionConfig[] | undefined): string | undefined {
    return versions?.find((version) => getVersionContentRef(version) == null && version.path != null)?.path;
}

function isInternalProduct(product: docsYml.RawSchemas.ProductConfig): product is docsYml.RawSchemas.InternalProduct {
    return "path" in product;
}

/**
 * Finds the product at the ref that corresponds to a product on the current branch:
 * a product with the same slug if there is one, else the first with the same display name.
 * Only internal products carry a slug, so an external product can only match by display name.
 */
function findProductAtRef(
    products: docsYml.RawSchemas.ProductConfig[] | undefined,
    scope: { displayName: string; slug: string | undefined }
): docsYml.RawSchemas.ProductConfig | undefined {
    if (products == null) {
        return undefined;
    }
    if (scope.slug != null) {
        const bySlug = products.find((product) => isInternalProduct(product) && product.slug === scope.slug);
        if (bySlug != null) {
            return bySlug;
        }
    }
    return products.find((product) => product.displayName === scope.displayName);
}

/**
 * Locates the pages to build for a ref-backed version by reading the docs.yml committed
 * at the ref (`materialized`), in the scope the version is declared in on the current branch:
 * - `site`: the first entry in the ref docs.yml's `versions` list that has a `path`
 *   (entries with a `ref` are skipped); if none, the ref docs.yml's top-level `navigation`.
 * - `product`: the product in the ref docs.yml with the same `slug` (or, when either side
 *   has no `slug`, the same `displayName`), then the same rule on that product's `versions`;
 *   if none, the `navigation` in that product's file.
 *
 * Entries with a `ref` in the ref's docs.yml are ignored: only the docs.yml being built
 * decides which versions are published.
 */
export async function resolveRefContentRoot({
    materialized,
    scope,
    context
}: {
    materialized: MaterializedGitRef;
    scope: RefVersionScope;
    context: TaskContext;
}): Promise<ResolvedRefContentRoot> {
    const refFernFolder = materialized.absolutePathToFernFolder;
    const refDocsConfigPath = join(refFernFolder, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));

    const refDocsConfig = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(
        await loadYamlFile(refDocsConfigPath, context)
    );
    const rawLibraries = refDocsConfig.libraries;
    const docsSubstitutionConfig: docsYml.DocsSubstitutionConfig = {
        substitutions: refDocsConfig.substitutions,
        settings: refDocsConfig.settings
    };

    const describeRef = `git ref '${materialized.ref}' (${materialized.sha})`;

    if (scope.type === "product") {
        const product = findProductAtRef(refDocsConfig.products, scope);
        if (product == null) {
            const available =
                refDocsConfig.products != null && refDocsConfig.products.length > 0
                    ? refDocsConfig.products.map((p) => `'${p.displayName}'`).join(", ")
                    : undefined;
            throw new CliError({
                message:
                    `Could not find product '${scope.displayName}' in the docs.yml at ${describeRef}. ` +
                    (available != null
                        ? `Products at the ref: ${available}. `
                        : "The ref's docs.yml declares no products. ") +
                    "Give the product the same slug on both branches to match it independently of its display name.",
                code: CliError.Code.ConfigError
            });
        }
        if (!isInternalProduct(product)) {
            throw new CliError({
                message: `Product '${scope.displayName}' is an external link at ${describeRef}, so it has no content to build.`,
                code: CliError.Code.ConfigError
            });
        }
        const productVersionPath = getWorkingTreeVersionPath(product.versions);
        if (productVersionPath != null) {
            return readVersionFile({
                absoluteFilepathToConfig: resolve(refFernFolder, RelativeFilePath.of(productVersionPath)),
                rawLibraries,
                docsSubstitutionConfig,
                context
            });
        }
        const absoluteFilepathToProductFile = resolve(refFernFolder, RelativeFilePath.of(product.path));
        const productFile = docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(
            await loadYamlFile(absoluteFilepathToProductFile, context)
        );
        return {
            tabs: productFile.tabs,
            landingPage: productFile.landingPage,
            navigation: productFile.navigation,
            absoluteFilepathToConfig: absoluteFilepathToProductFile,
            rawLibraries,
            versionFileSubstitutions: undefined,
            docsSubstitutionConfig
        };
    }

    const siteVersionPath = getWorkingTreeVersionPath(refDocsConfig.versions);
    if (siteVersionPath != null) {
        return readVersionFile({
            absoluteFilepathToConfig: resolve(refFernFolder, RelativeFilePath.of(siteVersionPath)),
            rawLibraries,
            docsSubstitutionConfig,
            context
        });
    }

    if (refDocsConfig.navigation != null) {
        return {
            tabs: refDocsConfig.tabs,
            landingPage: undefined,
            navigation: refDocsConfig.navigation,
            absoluteFilepathToConfig: refDocsConfigPath,
            rawLibraries,
            versionFileSubstitutions: undefined,
            docsSubstitutionConfig
        };
    }

    throw new CliError({
        message:
            `Could not determine the content root for ${describeRef}. ` +
            "Ensure the ref's docs.yml declares a version built from its working tree (`path:`) or a top-level navigation.",
        code: CliError.Code.ConfigError
    });
}
