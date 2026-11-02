import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { createHash } from "crypto";
import { readFile, stat } from "fs/promises";
import path from "path";

/**
 * Digests of the inputs to a remote generation job. Fiddle embeds them in the signed
 * provenance statement it attaches to the generated SDK pull request, so a consumer can check
 * that the SDK came from the spec and configuration files at a given commit of their repo.
 */
export interface GenerationProvenanceInputs {
    /** Every spec, overlay and overrides file referenced by generators.yml, relative to the fern directory. */
    specs: ProvenanceFileDigest[];
    /** The generators.yml file as committed. */
    generatorsYml: ProvenanceFileDigest | undefined;
    /** SHA-256 of the generator's generators.yml entry, serialized as JSON with sorted keys. */
    generatorConfigSha256: string;
    generatorName: string;
    generatorVersion: string;
}

export interface ProvenanceFileDigest {
    path: string;
    sha256: string;
}

const SPEC_FILE_KEYS = new Set(["openapi", "asyncapi", "overrides", "overlays"]);

export async function computeGenerationProvenanceInputs({
    generatorsConfiguration,
    generatorInvocation
}: {
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
}): Promise<GenerationProvenanceInputs> {
    const generatorConfigSha256 = sha256(
        stableStringify(
            generatorInvocation.raw ?? {
                name: generatorInvocation.name,
                version: generatorInvocation.version,
                config: generatorInvocation.config
            }
        )
    );
    if (generatorsConfiguration == null) {
        return {
            specs: [],
            generatorsYml: undefined,
            generatorConfigSha256,
            generatorName: generatorInvocation.name,
            generatorVersion: generatorInvocation.version
        };
    }

    const configPath = generatorsConfiguration.absolutePathToConfiguration;
    const fernDirectory = path.dirname(configPath);
    const specPaths = new Set<string>();
    const apiOverrideSpecs = generatorInvocation.apiOverride?.specs;
    if (apiOverrideSpecs != null) {
        collectSpecFilePaths(apiOverrideSpecs, specPaths);
    } else if (generatorsConfiguration.api != null) {
        collectApiDefinitionPaths(generatorsConfiguration.api, specPaths);
    }

    const specs: ProvenanceFileDigest[] = [];
    for (const specPath of [...specPaths].sort()) {
        const absolutePath = path.resolve(fernDirectory, specPath);
        const digest = await digestFileIfPresent(absolutePath, fernDirectory);
        if (digest != null) {
            specs.push(digest);
        }
    }

    return {
        specs,
        generatorsYml: await digestFileIfPresent(configPath, fernDirectory),
        generatorConfigSha256,
        generatorName: generatorInvocation.name,
        generatorVersion: generatorInvocation.version
    };
}

function collectApiDefinitionPaths(api: generatorsYml.APIDefinition, paths: Set<string>): void {
    switch (api.type) {
        case "singleNamespace":
            collectLocationPaths(api.definitions, paths);
            return;
        case "multiNamespace":
            collectLocationPaths(api.rootDefinitions ?? [], paths);
            for (const locations of Object.values(api.definitions)) {
                collectLocationPaths(locations, paths);
            }
            return;
        case "conjure":
            paths.add(api.pathToConjureDefinition);
            return;
        default:
            assertNever(api);
    }
}

function collectLocationPaths(locations: generatorsYml.APIDefinitionLocation[], paths: Set<string>): void {
    for (const location of locations) {
        const schemaPath = getSchemaPath(location.schema);
        if (schemaPath != null && !isUrl(schemaPath)) {
            paths.add(schemaPath);
        }
        for (const extra of [location.overrides, location.overlays].flat()) {
            if (extra != null && !isUrl(extra)) {
                paths.add(extra);
            }
        }
    }
}

function getSchemaPath(schema: generatorsYml.APIDefinitionLocation["schema"]): string | undefined {
    switch (schema.type) {
        case "oss":
        case "openrpc":
        case "graphql":
            return schema.path;
        case "protobuf":
            // A proto root is a directory; individual .proto files aren't hashed.
            return undefined;
        default:
            return assertNever(schema);
    }
}

function collectSpecFilePaths(value: unknown, paths: Set<string>): void {
    if (Array.isArray(value)) {
        for (const item of value) {
            collectSpecFilePaths(item, paths);
        }
        return;
    }
    if (value == null || typeof value !== "object") {
        return;
    }
    for (const [key, child] of Object.entries(value)) {
        if (SPEC_FILE_KEYS.has(key)) {
            for (const candidate of Array.isArray(child) ? child : [child]) {
                if (typeof candidate === "string" && !isUrl(candidate)) {
                    paths.add(candidate);
                }
            }
        } else {
            collectSpecFilePaths(child, paths);
        }
    }
}

async function digestFileIfPresent(
    absolutePath: string,
    fernDirectory: string
): Promise<ProvenanceFileDigest | undefined> {
    try {
        if (!(await stat(absolutePath)).isFile()) {
            return undefined;
        }
    } catch {
        return undefined;
    }
    return {
        path: path.relative(fernDirectory, absolutePath).split(path.sep).join("/"),
        sha256: sha256(await readFile(absolutePath))
    };
}

function isUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
}

function sha256(contents: string | Buffer): string {
    return createHash("sha256").update(contents).digest("hex");
}

/** JSON.stringify with object keys sorted recursively, so the digest doesn't depend on key order. */
export function stableStringify(value: unknown): string {
    return JSON.stringify(sortKeys(value)) ?? "null";
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortKeys);
    }
    if (value != null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([, child]) => child !== undefined)
                .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                .map(([key, child]) => [key, sortKeys(child)])
        );
    }
    return value;
}
