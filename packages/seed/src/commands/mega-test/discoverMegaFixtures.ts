import { APIS_DIRECTORY, FERN_DIRECTORY, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

/**
 * A fixture that has been selected for inclusion in a mega-test run.
 *
 * Each fixture corresponds to one entry in the synthesized virtual `generators.yml`'s
 * `api.specs` array, namespaced by the fixture's directory name.
 */
export interface MegaFixture {
    /** The fixture name (e.g. "imdb"); also used as the namespace in the virtual workspace. */
    name: string;
    /** Absolute path to the fixture's directory (e.g. `test-definitions/fern/apis/imdb/`). */
    absolutePathToFixture: AbsoluteFilePath;
    /**
     * The fixture's OpenAPI spec entries (one or more). Most fixtures have a single entry,
     * but a fixture may have multiple specs (e.g. proto + openapi).
     */
    openApiSpecs: ResolvedOpenApiSpec[];
}

export interface ResolvedOpenApiSpec {
    /** Absolute path to the OpenAPI document (yaml/json). */
    absolutePathToOpenApi: AbsoluteFilePath;
    /** Absolute path(s) to override file(s), if configured. */
    absolutePathToOverrides?: AbsoluteFilePath | AbsoluteFilePath[];
    /** Spec-level settings passed through verbatim. */
    settings?: generatorsYml.OpenApiSettingsSchema;
    /** Overlays path, if configured. */
    absolutePathToOverlays?: AbsoluteFilePath;
    /** Origin URL, if configured. */
    origin?: string;
}

/**
 * Locate the test-definitions directory next to this file at runtime.
 * Mirrors the lookup used by `testWorkspaceFixtures.ts` for consistency.
 */
function getTestDefinitionsApisDir(): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.join(__dirname, "../../../test-definitions", FERN_DIRECTORY, APIS_DIRECTORY));
}

/**
 * Walks `test-definitions/fern/apis/*` and selects every fixture whose `generators.yml`
 * declares one or more OpenAPI specs via the V2 `api.specs[]` schema.
 *
 * Fixtures using the legacy single-`api.path` schema, or proto-only fixtures, are skipped.
 */
export function discoverMegaFixtures({
    apisDir = getTestDefinitionsApisDir()
}: { apisDir?: AbsoluteFilePath } = {}): MegaFixture[] {
    const fixtures: MegaFixture[] = [];

    for (const entry of fs.readdirSync(apisDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        const fixtureName = entry.name;
        const absolutePathToFixture = join(apisDir, RelativeFilePath.of(fixtureName));
        const generatorsYmlPath = join(absolutePathToFixture, RelativeFilePath.of("generators.yml"));

        let raw: string;
        try {
            raw = fs.readFileSync(generatorsYmlPath, "utf-8");
        } catch {
            // No generators.yml — skip.
            continue;
        }

        let parsed: unknown;
        try {
            parsed = yaml.load(raw);
        } catch {
            continue;
        }

        const openApiSpecs = extractOpenApiSpecs(parsed, absolutePathToFixture);
        if (openApiSpecs.length === 0) {
            continue;
        }

        fixtures.push({
            name: fixtureName,
            absolutePathToFixture,
            openApiSpecs
        });
    }

    // Stable order by name keeps virtual generators.yml deterministic.
    fixtures.sort((a, b) => a.name.localeCompare(b.name));
    return fixtures;
}

/**
 * Extracts the OpenAPI specs from a parsed `generators.yml`. Skips proto / async / openrpc / graphql
 * specs since the mega-test currently only composes OpenAPI specs.
 *
 * Exported for unit testing.
 */
export function extractOpenApiSpecs(parsed: unknown, fixtureDir: AbsoluteFilePath): ResolvedOpenApiSpec[] {
    if (parsed == null || typeof parsed !== "object") {
        return [];
    }
    const api = (parsed as { api?: unknown }).api;
    if (api == null || typeof api !== "object") {
        return [];
    }
    const specs = (api as { specs?: unknown }).specs;
    if (!Array.isArray(specs)) {
        return [];
    }

    const result: ResolvedOpenApiSpec[] = [];
    for (const spec of specs) {
        if (spec == null || typeof spec !== "object") {
            continue;
        }
        const openapi = (spec as { openapi?: unknown }).openapi;
        if (typeof openapi !== "string") {
            continue;
        }

        const absolutePathToOpenApi = resolveRelativeToFixture(fixtureDir, openapi);

        const overridesRaw = (spec as { overrides?: unknown }).overrides;
        let absolutePathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
        if (typeof overridesRaw === "string") {
            absolutePathToOverrides = resolveRelativeToFixture(fixtureDir, overridesRaw);
        } else if (Array.isArray(overridesRaw)) {
            absolutePathToOverrides = overridesRaw
                .filter((p): p is string => typeof p === "string")
                .map((p) => resolveRelativeToFixture(fixtureDir, p));
        }

        const overlaysRaw = (spec as { overlays?: unknown }).overlays;
        const absolutePathToOverlays =
            typeof overlaysRaw === "string" ? resolveRelativeToFixture(fixtureDir, overlaysRaw) : undefined;

        const origin = typeof (spec as { origin?: unknown }).origin === "string"
            ? ((spec as { origin?: string }).origin)
            : undefined;

        const settings = (spec as { settings?: unknown }).settings;

        result.push({
            absolutePathToOpenApi,
            absolutePathToOverrides,
            absolutePathToOverlays,
            origin,
            settings:
                settings != null && typeof settings === "object"
                    ? (settings as generatorsYml.OpenApiSettingsSchema)
                    : undefined
        });
    }

    return result;
}

function resolveRelativeToFixture(fixtureDir: AbsoluteFilePath, relativePath: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.resolve(fixtureDir, relativePath));
}
