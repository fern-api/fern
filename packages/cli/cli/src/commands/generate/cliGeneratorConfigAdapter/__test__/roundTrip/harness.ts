import { spawnSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import YAML from "yaml";

import { FIXTURES } from "../helpers.js";

/** The fern repository root, from this file's fixtures folder. */
export const REPO_ROOT = join(FIXTURES, "..", "..", "..", "..", "..", "..", "..", "..", "..");
export const TEST_DEFINITIONS = join(REPO_ROOT, "test-definitions", "fern", "apis");
export const ROUND_TRIP_FIXTURES = join(FIXTURES, "roundtrip");
export const BUILT_CLI = join(REPO_ROOT, "packages", "cli", "cli", "dist", "prod", "cli.cjs");
export const ROUND_TRIP_GENERATOR_VERSION = "0.49.0";

/** Fixtures without `cli-` in the name that the prototype's round trip also covered. */
const EXTRA_FIXTURES = ["x-fern-global-parameters", "query-parameters-openapi", "file-upload-openapi"];

/** Every `cli-*` test definition, plus the three OpenAPI fixtures the prototype covered. */
export async function roundTripFixtures(): Promise<string[]> {
    const entries = await readdir(TEST_DEFINITIONS);
    return [...entries.filter((entry) => entry.startsWith("cli-")).sort(), ...EXTRA_FIXTURES];
}

/**
 * The fixture's original generators.yml: its test definition's `auth-schemes` and `api`, and one
 * `cli` group whose `config` is the first variant of the fixture in seed/cli/seed.yml (the same
 * construction as the hosted bridge's fixtures).
 */
export async function originalGeneratorsYml(fixture: string): Promise<Record<string, unknown>> {
    const definition = parseRecord(await readFile(join(TEST_DEFINITIONS, fixture, "generators.yml"), "utf8"));
    const seed = parseRecord(await readFile(join(REPO_ROOT, "seed", "cli", "seed.yml"), "utf8"));
    const variants = record(seed.fixtures)?.[fixture];
    const first = Array.isArray(variants) ? record(variants[0]) : undefined;
    const config = record(first?.customConfig);
    return {
        ...(definition["auth-schemes"] != null ? { "auth-schemes": definition["auth-schemes"] } : {}),
        api: definition.api,
        groups: {
            cli: {
                generators: [
                    {
                        name: "fernapi/fern-cli-generator",
                        version: ROUND_TRIP_GENERATOR_VERSION,
                        output: { location: "local-file-system", path: "../out" },
                        ...(config != null && Object.keys(config).length > 0 ? { config } : {})
                    }
                ]
            }
        }
    };
}

/** Copies the test definition into `<folder>/fern` with the original generators.yml and a fern.config.json. */
export async function prepareWorkspace(fixture: string, folder: string): Promise<string> {
    const fern = join(folder, "fern");
    await mkdir(fern, { recursive: true });
    await cp(join(TEST_DEFINITIONS, fixture), fern, { recursive: true });
    await writeFile(join(fern, "generators.yml"), YAML.stringify(await originalGeneratorsYml(fixture)));
    await writeFile(join(fern, "fern.config.json"), `${JSON.stringify({ organization: "fern", version: "*" })}\n`);
    return fern;
}

/** Runs the CLI built from this branch. */
export function runBuiltFern(
    args: string[],
    cwd: string,
    timeoutMs?: number
): { status: number | null; output: string } {
    const result = spawnSync("node", [BUILT_CLI, ...args], {
        cwd,
        ...(timeoutMs != null ? { timeout: timeoutMs } : {}),
        env: { ...process.env, FERN_NO_VERSION_REDIRECTION: "true" },
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024
    });
    return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
}

/**
 * Field-level differences between two generators.yml objects, as `path` strings. Generator `version`,
 * `ir-version` and `output` are left out (the round trip pins the version and the output folder), and
 * so is `default-group`, which only selects groups.
 */
export function generatorsDiff(original: Record<string, unknown>, translated: Record<string, unknown>): string[] {
    const { "default-group": _originalDefault, ...left } = original;
    const { "default-group": _translatedDefault, ...right } = translated;
    return diff(normalize(left), normalize(right), "").sort();
}

function normalize(generatorsYml: Record<string, unknown>): Record<string, unknown> {
    const api = record(generatorsYml.api);
    const specs = Array.isArray(api?.specs) ? api.specs : undefined;
    const groups = record(generatorsYml.groups) ?? {};
    const cli = record(groups.cli) ?? {};
    const generators = Array.isArray(cli.generators) ? cli.generators : [];
    return {
        ...generatorsYml,
        ...(api != null
            ? {
                  api: {
                      ...api,
                      ...(specs != null ? { specs: specs.map((spec: unknown) => normalizeSpecPaths(spec)) } : {})
                  }
              }
            : {}),
        groups: {
            cli: {
                ...cli,
                generators: generators.map((generator: unknown) => {
                    const {
                        version: _version,
                        "ir-version": _irVersion,
                        output: _output,
                        ...rest
                    } = record(generator) ?? {};
                    return rest;
                })
            }
        }
    };
}

/** `openapi.yml` and `./openapi.yml` name the same file. */
function normalizeSpecPaths(spec: unknown): unknown {
    const entry = record(spec);
    if (entry == null) {
        return spec;
    }
    const normalizePath = (value: unknown): unknown => (typeof value === "string" ? posix.normalize(value) : value);
    return Object.fromEntries(
        Object.entries(entry).map(([key, value]) => [
            key,
            ["openapi", "overrides", "overlays"].includes(key)
                ? Array.isArray(value)
                    ? value.map(normalizePath)
                    : normalizePath(value)
                : value
        ])
    );
}

function diff(left: unknown, right: unknown, path: string): string[] {
    const leftRecord = record(left);
    const rightRecord = record(right);
    if (leftRecord != null && rightRecord != null) {
        const keys = [...new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)])];
        return keys.flatMap((key) => diff(leftRecord[key], rightRecord[key], path === "" ? key : `${path}.${key}`));
    }
    if (Array.isArray(left) && Array.isArray(right) && left.length === right.length) {
        return left.flatMap((item, index) => diff(item, right[index], `${path}[${index}]`));
    }
    return JSON.stringify(left) === JSON.stringify(right) ? [] : [path];
}

function parseRecord(contents: string): Record<string, unknown> {
    return record(YAML.parse(contents)) ?? {};
}

function record(value: unknown): Record<string, unknown> | undefined {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? { ...value } : undefined;
}
