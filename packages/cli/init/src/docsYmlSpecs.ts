import { isPlainObject } from "@fern-api/core-utils";
import path from "path";

type YamlObject = Record<string, unknown>;

/** The keys under which a navigation item holds more navigation items: sections, tabs and their variants. */
const NESTED_NAVIGATION_KEYS = ["contents", "layout", "variants"];

/** A `docs.yml` whose `navigation` is a flat list, the only layout a new `api` entry fits into. */
export type DocsConfigWithFlatNavigation = YamlObject & { navigation: unknown[] };

export function hasFlatNavigation(docsConfig: unknown): docsConfig is DocsConfigWithFlatNavigation {
    return (
        isPlainObject(docsConfig) &&
        Array.isArray(docsConfig.navigation) &&
        !docsConfig.navigation.some((item) => isPlainObject(item) && "tab" in item)
    );
}

/** The paths of the specs declared by the `api` entries of `docsConfig`, as written. */
export function getSpecPaths(docsConfig: unknown): string[] {
    if (!isPlainObject(docsConfig) || !Array.isArray(docsConfig.navigation)) {
        return [];
    }
    return findApiReferences(docsConfig.navigation).flatMap(getSpecPathsOf);
}

/**
 * Declares the spec on the first `api` entry of `navigation`, wherever it is nested in sections, or on a new `api`
 * entry at the end of `navigation` when there is none.
 */
export function addSpec({
    docsConfig,
    specPath
}: {
    docsConfig: DocsConfigWithFlatNavigation;
    specPath: string;
}): DocsConfigWithFlatNavigation {
    const [firstApiReference] = findApiReferences(docsConfig.navigation);
    return {
        ...docsConfig,
        navigation:
            firstApiReference == null
                ? [...docsConfig.navigation, createApiReference(specPath)]
                : mapNavigation(docsConfig.navigation, (item) =>
                      item === firstApiReference ? withSpec(firstApiReference, specPath) : item
                  )
    };
}

/** Replaces the path of every spec that `renames` has a new path for. A path in `renames` is normalized, like `a/b.yml`. */
export function renameSpecs({
    docsConfig,
    renames
}: {
    docsConfig: unknown;
    renames: ReadonlyMap<string, string>;
}): unknown {
    if (!isPlainObject(docsConfig) || !Array.isArray(docsConfig.navigation)) {
        return docsConfig;
    }
    return {
        ...docsConfig,
        navigation: mapNavigation(docsConfig.navigation, (item) =>
            isApiReference(item) && Array.isArray(item.specs)
                ? { ...item, specs: item.specs.map((spec: unknown) => renameSpec({ spec, renames })) }
                : item
        )
    };
}

function isApiReference(item: unknown): item is YamlObject {
    return isPlainObject(item) && "api" in item;
}

function findApiReferences(items: unknown[]): YamlObject[] {
    return flattenNavigation(items).filter(isApiReference);
}

/** Every item in document order, nested ones included. What an `api` entry holds is its own layout, so it is not entered. */
function flattenNavigation(items: unknown[]): unknown[] {
    return items.flatMap((item) => [
        item,
        ...(!isApiReference(item) && isPlainObject(item) ? flattenNavigation(getNestedItems(item)) : [])
    ]);
}

function getNestedItems(item: YamlObject): unknown[] {
    return NESTED_NAVIGATION_KEYS.flatMap((key) => {
        const nestedItems = item[key];
        return Array.isArray(nestedItems) ? nestedItems : [];
    });
}

function getSpecPathsOf(apiReference: YamlObject): string[] {
    const specs: unknown[] = Array.isArray(apiReference.specs) ? apiReference.specs : [];
    return specs.flatMap((spec) => (isPlainObject(spec) && typeof spec.path === "string" ? [spec.path] : []));
}

/** Applies `transform` to every item, nested ones included. An `api` entry is passed as is. */
function mapNavigation(items: unknown[], transform: (item: unknown) => unknown): unknown[] {
    return items.map((item) => transform(mapNestedItems(item, transform)));
}

function mapNestedItems(item: unknown, transform: (item: unknown) => unknown): unknown {
    if (isApiReference(item) || !isPlainObject(item)) {
        return item;
    }
    const nested: YamlObject = {};
    for (const key of NESTED_NAVIGATION_KEYS) {
        const nestedItems = item[key];
        if (Array.isArray(nestedItems)) {
            nested[key] = mapNavigation(nestedItems, transform);
        }
    }
    return { ...item, ...nested };
}

function createSpec(specPath: string): YamlObject {
    return { type: "openapi", path: specPath };
}

function createApiReference(specPath: string): YamlObject {
    return { api: "API Reference", paginated: true, specs: [createSpec(specPath)] };
}

function withSpec(apiReference: YamlObject, specPath: string): YamlObject {
    const specs: unknown[] = Array.isArray(apiReference.specs) ? apiReference.specs : [];
    const isAlreadyListed = getSpecPathsOf(apiReference).some(
        (listedPath) => path.normalize(listedPath) === path.normalize(specPath)
    );
    return isAlreadyListed ? apiReference : { ...apiReference, specs: [...specs, createSpec(specPath)] };
}

function renameSpec({ spec, renames }: { spec: unknown; renames: ReadonlyMap<string, string> }): unknown {
    if (!isPlainObject(spec) || typeof spec.path !== "string") {
        return spec;
    }
    const renamedPath = renames.get(path.normalize(spec.path));
    return renamedPath == null ? spec : { ...spec, path: renamedPath };
}
