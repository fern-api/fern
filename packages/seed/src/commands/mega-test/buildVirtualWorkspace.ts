import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { MegaFixture, ResolvedOpenApiSpec } from "./discoverMegaFixtures.js";

/**
 * Shape of the synthesized `generators.yml` written for a mega-test run.
 *
 * This is intentionally a minimal subset of the V2 schema. Only the `api.specs`
 * array is needed — generator groups are constructed programmatically by the
 * seed test runner, not read from this file.
 */
export interface VirtualGeneratorsYml {
    api: {
        specs: generatorsYml.OpenApiSpecSchema[];
    };
}

export interface VirtualWorkspace {
    /** Absolute path to the temp directory containing the synthesized generators.yml. */
    absolutePathToWorkspaceDir: AbsoluteFilePath;
    /** The synthesized generators.yml contents (also written to disk inside the dir). */
    virtualGeneratorsYml: VirtualGeneratorsYml;
    /** The fixtures that contributed to the workspace, in the order they were composed. */
    composedFixtures: MegaFixture[];
}

/**
 * Constructs an in-memory virtual `generators.yml` with one namespaced `api.specs` entry
 * per fixture's OpenAPI spec, and writes it to `absolutePathToWorkspaceDir/generators.yml`.
 *
 * Each fixture name is used as the namespace for its specs. If a fixture has multiple
 * OpenAPI specs (rare), they all share the fixture's namespace.
 *
 * Returns the synthesized config plus the workspace dir so the caller can pass it to
 * `convertGeneratorWorkspaceToFernWorkspace`.
 *
 * Throws if two fixtures resolve to the same namespace.
 */
export async function buildVirtualWorkspace({
    fixtures,
    absolutePathToWorkspaceDir
}: {
    fixtures: MegaFixture[];
    absolutePathToWorkspaceDir: AbsoluteFilePath;
}): Promise<VirtualWorkspace> {
    const virtualGeneratorsYml = constructVirtualGeneratorsYml({
        fixtures,
        absolutePathToWorkspaceDir
    });

    await fs.mkdir(absolutePathToWorkspaceDir, { recursive: true });
    await fs.writeFile(
        path.join(absolutePathToWorkspaceDir, "generators.yml"),
        yaml.dump(virtualGeneratorsYml, { lineWidth: -1 }),
        "utf-8"
    );

    return {
        absolutePathToWorkspaceDir,
        virtualGeneratorsYml,
        composedFixtures: fixtures
    };
}

/**
 * Pure builder: constructs the virtual generators.yml object without touching disk.
 * Exported for unit testing.
 */
export function constructVirtualGeneratorsYml({
    fixtures,
    absolutePathToWorkspaceDir
}: {
    fixtures: MegaFixture[];
    absolutePathToWorkspaceDir: AbsoluteFilePath;
}): VirtualGeneratorsYml {
    const seenNamespaces = new Set<string>();
    const specs: generatorsYml.OpenApiSpecSchema[] = [];

    for (const fixture of fixtures) {
        if (seenNamespaces.has(fixture.name)) {
            throw new Error(`Mega-test: duplicate fixture namespace "${fixture.name}" — fixture names must be unique.`);
        }
        seenNamespaces.add(fixture.name);

        for (const spec of fixture.openApiSpecs) {
            specs.push(makeOpenApiSpecEntry({ fixture, spec, absolutePathToWorkspaceDir }));
        }
    }

    return { api: { specs } };
}

function makeOpenApiSpecEntry({
    fixture,
    spec,
    absolutePathToWorkspaceDir
}: {
    fixture: MegaFixture;
    spec: ResolvedOpenApiSpec;
    absolutePathToWorkspaceDir: AbsoluteFilePath;
}): generatorsYml.OpenApiSpecSchema {
    const openapiRel = toRelative(absolutePathToWorkspaceDir, spec.absolutePathToOpenApi);

    let overridesRel: string | string[] | undefined;
    if (spec.absolutePathToOverrides != null) {
        if (Array.isArray(spec.absolutePathToOverrides)) {
            overridesRel = spec.absolutePathToOverrides.map((p) => toRelative(absolutePathToWorkspaceDir, p));
        } else {
            overridesRel = toRelative(absolutePathToWorkspaceDir, spec.absolutePathToOverrides);
        }
    }

    const overlaysRel =
        spec.absolutePathToOverlays != null
            ? toRelative(absolutePathToWorkspaceDir, spec.absolutePathToOverlays)
            : undefined;

    const entry: generatorsYml.OpenApiSpecSchema = {
        openapi: openapiRel,
        namespace: fixture.name
    };
    if (overridesRel != null) {
        entry.overrides = overridesRel;
    }
    if (overlaysRel != null) {
        entry.overlays = overlaysRel;
    }
    if (spec.origin != null) {
        entry.origin = spec.origin;
    }
    if (spec.settings != null) {
        entry.settings = spec.settings;
    }
    return entry;
}

function toRelative(from: AbsoluteFilePath, to: AbsoluteFilePath): string {
    const rel = path.relative(from, to);
    return rel.length === 0 ? "." : rel;
}
