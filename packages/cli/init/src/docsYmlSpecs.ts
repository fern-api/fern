import { isPlainObject } from "@fern-api/core-utils";
import path from "path";

type YamlObject = Record<string, unknown>;

/** A `docs.yml` whose `navigation` is a flat list, the only layout a new `api` entry fits into. */
export type DocsConfigWithFlatNavigation = YamlObject & { navigation: unknown[] };

export function hasFlatNavigation(docsConfig: unknown): docsConfig is DocsConfigWithFlatNavigation {
    return (
        isPlainObject(docsConfig) &&
        Array.isArray(docsConfig.navigation) &&
        !docsConfig.navigation.some((item) => isPlainObject(item) && "tab" in item)
    );
}

/** Declares the spec on the first `api` entry of `navigation`, or on a new `api` entry at its end. */
export function addSpec({
    docsConfig,
    specPath
}: {
    docsConfig: DocsConfigWithFlatNavigation;
    specPath: string;
}): DocsConfigWithFlatNavigation {
    const apiReference = docsConfig.navigation.find(isApiReference);
    return {
        ...docsConfig,
        navigation:
            apiReference == null
                ? [...docsConfig.navigation, createApiReference(specPath)]
                : docsConfig.navigation.map((item) => (item === apiReference ? withSpec(apiReference, specPath) : item))
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
        navigation: docsConfig.navigation.map((item: unknown) =>
            isApiReference(item) && Array.isArray(item.specs)
                ? { ...item, specs: item.specs.map((spec: unknown) => renameSpec({ spec, renames })) }
                : item
        )
    };
}

function isApiReference(item: unknown): item is YamlObject {
    return isPlainObject(item) && "api" in item;
}

function createSpec(specPath: string): YamlObject {
    return { type: "openapi", path: specPath };
}

function createApiReference(specPath: string): YamlObject {
    return { api: "API Reference", paginated: true, specs: [createSpec(specPath)] };
}

function withSpec(apiReference: YamlObject, specPath: string): YamlObject {
    const specs: unknown[] = Array.isArray(apiReference.specs) ? apiReference.specs : [];
    const isAlreadyListed = specs.some((spec) => isPlainObject(spec) && spec.path === specPath);
    return isAlreadyListed ? apiReference : { ...apiReference, specs: [...specs, createSpec(specPath)] };
}

function renameSpec({ spec, renames }: { spec: unknown; renames: ReadonlyMap<string, string> }): unknown {
    if (!isPlainObject(spec) || typeof spec.path !== "string") {
        return spec;
    }
    const renamedPath = renames.get(path.normalize(spec.path));
    return renamedPath == null ? spec : { ...spec, path: renamedPath };
}
