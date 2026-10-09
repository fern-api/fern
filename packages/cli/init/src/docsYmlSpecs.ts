import { isPlainObject } from "@fern-api/core-utils";
import path from "path";

type YamlObject = Record<string, unknown>;

/** The keys under which a navigation item holds more navigation items: sections, tabs and their variants. */
const NESTED_NAVIGATION_KEYS = ["contents", "layout", "variants"];

const API_REFERENCE_TITLE = "API Reference";

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
 * Declares the specs of one API on a new `api` entry at the end of `navigation`, so that every API gets its own API
 * reference. An API with no specs is one the docs read from its workspace. An API that an `api` entry already lists a
 * spec of is not added again.
 */
export function addApiReference({
    docsConfig,
    specPaths
}: {
    docsConfig: DocsConfigWithFlatNavigation;
    specPaths: string[];
}): DocsConfigWithFlatNavigation {
    const apiReferences = findApiReferences(docsConfig.navigation);
    if (apiReferences.some((apiReference) => specPaths.some((specPath) => listsSpec(apiReference, specPath)))) {
        return docsConfig;
    }
    return {
        ...docsConfig,
        navigation: [
            ...docsConfig.navigation,
            {
                api: getUniqueApiReferenceTitle(apiReferences.map((apiReference) => apiReference.api)),
                paginated: true,
                ...(specPaths.length > 0 ? { specs: specPaths.map(createSpec) } : {})
            }
        ]
    };
}

/** `API Reference`, or `API Reference 2`, `API Reference 3`, ... when `usedTitles` has the ones before it. */
function getUniqueApiReferenceTitle(usedTitles: unknown[]): string {
    let title = API_REFERENCE_TITLE;
    for (let number = 2; usedTitles.includes(title); number++) {
        title = `${API_REFERENCE_TITLE} ${number}`;
    }
    return title;
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

function listsSpec(apiReference: YamlObject, specPath: string): boolean {
    return getSpecPathsOf(apiReference).some((listedPath) => path.normalize(listedPath) === path.normalize(specPath));
}

function renameSpec({ spec, renames }: { spec: unknown; renames: ReadonlyMap<string, string> }): unknown {
    if (!isPlainObject(spec) || typeof spec.path !== "string") {
        return spec;
    }
    const renamedPath = renames.get(path.normalize(spec.path));
    return renamedPath == null ? spec : { ...spec, path: renamedPath };
}
