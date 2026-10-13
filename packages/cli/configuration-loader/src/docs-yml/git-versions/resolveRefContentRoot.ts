import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration";
import { sanitizeNullValues } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { kebabCase } from "lodash-es";

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
    context
}: {
    absoluteFilepathToConfig: AbsoluteFilePath;
    rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> | undefined;
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
        rawLibraries
    };
}

/** The first version at the ref built from its own working tree (a `path:` entry, not another `ref:`). */
function getWorkingTreeVersionPath(versions: docsYml.RawSchemas.VersionConfig[] | undefined): string | undefined {
    return versions?.find((version) => getVersionContentRef(version) == null && version.path != null)?.path;
}

function isInternalProduct(product: docsYml.RawSchemas.ProductConfig): product is docsYml.RawSchemas.InternalProduct {
    return "path" in product;
}

/** The product's URL slug: its `slug`, else the slug generated from its display name. */
function getProductUrlSlug(product: { displayName: string; slug: string | undefined }): string {
    return product.slug ?? kebabCase(product.displayName);
}

/**
 * Finds the product at the ref that corresponds to a product on the current branch, in order:
 * the first product with the same explicit `slug`, the first with the same URL slug, the first
 * with the same display name. Only internal products have a URL slug, so an external product
 * can only match by display name.
 */
function findProductAtRef(
    products: docsYml.RawSchemas.ProductConfig[],
    scope: { displayName: string; slug: string | undefined }
): docsYml.RawSchemas.ProductConfig | undefined {
    const urlSlug = getProductUrlSlug(scope);
    return (
        (scope.slug != null
            ? products.find((product) => isInternalProduct(product) && product.slug === scope.slug)
            : undefined) ??
        products.find(
            (product) =>
                isInternalProduct(product) &&
                getProductUrlSlug({ displayName: product.displayName, slug: product.slug }) === urlSlug
        ) ??
        products.find((product) => product.displayName === scope.displayName)
    );
}

function describeProductAtRef(product: docsYml.RawSchemas.ProductConfig): string {
    return isInternalProduct(product)
        ? `'${product.displayName}' (slug '${getProductUrlSlug({ displayName: product.displayName, slug: product.slug })}')`
        : `'${product.displayName}' (external link)`;
}

/**
 * Locates the pages to build for a ref-backed version by reading the docs.yml committed
 * at the ref (`materialized`), in the scope the version is declared in on the current branch:
 * - `site`: the first entry in the ref docs.yml's `versions` list that has a `path`
 *   (entries with a `ref` are skipped); if none, the ref docs.yml's top-level `navigation`.
 * - `product`: the product in the ref docs.yml with the same URL slug (else the same
 *   `displayName`), then the same rule on that product's `versions`; if none, the
 *   `navigation` in that product's file. A ref whose docs.yml declares no products
 *   predates the site's use of products and is rejected rather than guessed at.
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

    const describeRef = `git ref '${materialized.ref}' (${materialized.sha})`;

    if (scope.type === "product") {
        const refProducts = refDocsConfig.products ?? [];
        if (refProducts.length === 0) {
            throw new CliError({
                message:
                    `The docs.yml at ${describeRef} declares no products, so the CLI can't locate the content ` +
                    `for product '${scope.displayName}'. The ref predates the site's use of products. ` +
                    `To keep the release, create a new branch or tag from the release with a docs.yml that declares ` +
                    `product '${scope.displayName}', and set the version's \`ref\` to the new branch or tag. ` +
                    `Otherwise, remove the version from the product's \`versions\`.`,
                code: CliError.Code.ConfigError
            });
        }
        const product = findProductAtRef(refProducts, scope);
        if (product == null) {
            throw new CliError({
                message:
                    `Could not find product '${scope.displayName}' (slug '${getProductUrlSlug(scope)}') ` +
                    `in the docs.yml at ${describeRef}. ` +
                    `Products at the ref: ${refProducts.map(describeProductAtRef).join(", ")}. ` +
                    "The CLI matches a product by its URL slug (`slug`, or the slug generated from `display-name`), " +
                    "then by `display-name`.",
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
            rawLibraries
        };
    }

    const siteVersionPath = getWorkingTreeVersionPath(refDocsConfig.versions);
    if (siteVersionPath != null) {
        return readVersionFile({
            absoluteFilepathToConfig: resolve(refFernFolder, RelativeFilePath.of(siteVersionPath)),
            rawLibraries,
            context
        });
    }

    if (refDocsConfig.navigation != null) {
        return {
            tabs: refDocsConfig.tabs,
            landingPage: undefined,
            navigation: refDocsConfig.navigation,
            absoluteFilepathToConfig: refDocsConfigPath,
            rawLibraries
        };
    }

    throw new CliError({
        message:
            `Could not determine the content root for ${describeRef}. ` +
            "Ensure the ref's docs.yml declares a version built from its working tree (`path:`) or a top-level navigation.",
        code: CliError.Code.ConfigError
    });
}
