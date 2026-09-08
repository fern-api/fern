import type { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { describe, expect, it } from "vitest";
import { buildSdkConfigIrFromSdkConfig } from "../postman/buildSdkConfigIrFromSdkConfig.js";
import { loadSdkConfig } from "../postman/loadSdkConfig.js";
import { collectOnPremSourceSpecs } from "../postman/onPremSourceSpecs.js";
import { resolveSdkConfigIr } from "../postman/resolveSdkConfigIr.js";
import type { RawSpecsManifest } from "../rawSpecs.js";

/**
 * A migrated workspace's `sdk-config.yml`, in the shape `fern sdk migrate` writes it: one document
 * describing every target, with root-level configuration the targets override.
 */
const SDK_CONFIG_YML = `
schemaVersion: sdk-config/v1
sdkName: Abbey Movies
sdkVersion: 2.3.0
source:
  specs:
    - id: movies
      type: openapi
      path: ./openapi.yml
api: {}
client:
  timeoutMs: 30000
package: {}
output:
  delivery: files
  path: ./sdk
docs:
  includeApiReference: true
generation:
  includeWatermark: true
targets:
  - language: typescript
    package:
      packageName: "@abbey/movies"
    generation:
      packageManager: pnpm
  - language: python
    sdkVersion: 9.9.9
`;

const OPENAPI_MANIFEST: RawSpecsManifest = {
    specs: [{ type: "openapi", specPath: "/fern/specs/openapi.yml" }]
};

async function withFernDirectory(
    files: Record<string, string>,
    run: (absolutePathToFernConfig: AbsoluteFilePath) => Promise<void>
): Promise<void> {
    const directory = await tmp.dir({ unsafeCleanup: true });
    try {
        const fernDirectory = AbsoluteFilePath.of(directory.path);
        await writeFile(join(fernDirectory, RelativeFilePath.of("fern.config.json")), "{}");
        for (const [name, contents] of Object.entries(files)) {
            await writeFile(join(fernDirectory, RelativeFilePath.of(name)), contents);
        }
        await run(join(fernDirectory, RelativeFilePath.of("fern.config.json")));
    } finally {
        await directory.cleanup();
    }
}

function generatorInvocation(overrides: Partial<generatorsYml.GeneratorInvocation> = {}) {
    return {
        name: "fernapi/fern-typescript-sdk",
        version: "4.0.0",
        config: undefined,
        ...overrides
    } as generatorsYml.GeneratorInvocation;
}

async function loadFixture(contents: string = SDK_CONFIG_YML) {
    let loaded: Awaited<ReturnType<typeof loadSdkConfig>> | undefined;
    await withFernDirectory({ "sdk-config.yml": contents }, async (absolutePathToFernConfig) => {
        loaded = await loadSdkConfig({ absolutePathToFernConfig });
    });
    if (loaded?.type !== "loaded") {
        throw new Error(`expected the fixture to load, got ${loaded?.type}`);
    }
    return loaded.sdkConfig;
}

function build(sdkConfig: Awaited<ReturnType<typeof loadFixture>>, overrides: Record<string, unknown> = {}) {
    return buildSdkConfigIrFromSdkConfig({
        sdkConfig,
        language: "typescript",
        generatorName: "fernapi/fern-typescript-sdk",
        organization: "abbey",
        outputPath: "/fern/output",
        rawSpecsManifest: OPENAPI_MANIFEST,
        ...overrides
    } as Parameters<typeof buildSdkConfigIrFromSdkConfig>[0]);
}

describe("loadSdkConfig", () => {
    it("reports absence rather than failing, since an unmigrated workspace is ordinary", async () => {
        await withFernDirectory({}, async (absolutePathToFernConfig) => {
            expect(await loadSdkConfig({ absolutePathToFernConfig })).toEqual({ type: "absent" });
        });
    });

    it("loads sdk-config.yml from beside fern.config.json", async () => {
        await withFernDirectory({ "sdk-config.yml": SDK_CONFIG_YML }, async (absolutePathToFernConfig) => {
            const loaded = await loadSdkConfig({ absolutePathToFernConfig });
            expect(loaded.type).toBe("loaded");
            if (loaded.type === "loaded") {
                expect(loaded.sdkConfig.sdkName).toBe("Abbey Movies");
                expect(loaded.sdkConfig.targets).toHaveLength(2);
            }
        });
    });

    it("also reads a .yaml spelling", async () => {
        await withFernDirectory({ "sdk-config.yaml": SDK_CONFIG_YML }, async (absolutePathToFernConfig) => {
            expect((await loadSdkConfig({ absolutePathToFernConfig })).type).toBe("loaded");
        });
    });

    it("rejects a document that is not valid YAML", async () => {
        await withFernDirectory({ "sdk-config.yml": "targets: [\n" }, async (absolutePathToFernConfig) => {
            const loaded = await loadSdkConfig({ absolutePathToFernConfig });
            expect(loaded.type).toBe("invalid");
            if (loaded.type === "invalid") {
                expect(loaded.message).toContain("not valid YAML");
            }
        });
    });

    it("rejects a document that is valid YAML but not an SDK Config", async () => {
        await withFernDirectory({ "sdk-config.yml": "schemaVersion: sdk-config/v1\n" }, async (absolutePath) => {
            const loaded = await loadSdkConfig({ absolutePathToFernConfig: absolutePath });
            expect(loaded.type).toBe("invalid");
            if (loaded.type === "invalid") {
                expect(loaded.message).toContain("not a valid SDK Config");
            }
        });
    });
});

describe("buildSdkConfigIrFromSdkConfig", () => {
    it("selects the target matching the generator's language", async () => {
        const built = build(await loadFixture());
        expect(built.success).toBe(true);
        if (built.success) {
            expect(built.sdkConfigIr.target.language).toBe("typescript");
            expect(built.sdkConfigIr.package.packageName).toBe("@abbey/movies");
        }
    });

    it("lets a target override root configuration", async () => {
        const built = build(await loadFixture(), { language: "python", generatorName: "fernapi/fern-python-sdk" });
        expect(built.success).toBe(true);
        if (built.success) {
            // sdkVersion is overridden on the python target; sdkName is only at the root.
            expect(built.sdkConfigIr.target.sdkVersion).toBe("9.9.9");
            expect(built.sdkConfigIr.target.sdkName).toBe("Abbey Movies");
        }
    });

    it("carries root configuration the target does not override", async () => {
        const built = build(await loadFixture());
        expect(built.success).toBe(true);
        if (built.success) {
            expect(built.sdkConfigIr.target.sdkVersion).toBe("2.3.0");
            expect(built.sdkConfigIr.client.timeoutMs).toBe(30_000);
            expect(built.sdkConfigIr.generation.includeWatermark).toBe(true);
            expect(built.sdkConfigIr.docs.includeApiReference).toBe(true);
        }
    });

    it("splits a target's flat generation block into common and language-specific halves", async () => {
        const built = build(await loadFixture());
        expect(built.success).toBe(true);
        if (built.success) {
            // packageManager is TypeScript-only, so it belongs under generation.language.typescript
            // rather than beside the settings every language shares.
            expect(built.sdkConfigIr.generation.language?.typescript).toEqual({ packageManager: "pnpm" });
            expect(built.sdkConfigIr.generation).not.toHaveProperty("packageManager");
        }
    });

    // The adapter rejects any other value, and it is the only input to the flag that selects Fern's
    // generated surface over Postman's -- so a document cannot be allowed to change it.
    it("always declares a Fern source origin", async () => {
        const built = build(await loadFixture());
        expect(built.success).toBe(true);
        if (built.success) {
            expect(built.sdkConfigIr.target.sourceOrigin).toBe("fern");
        }
    });

    it("generates into the output mount even when the document asks for another delivery", async () => {
        const publishing = SDK_CONFIG_YML.replace(
            "output:\n  delivery: files\n  path: ./sdk",
            "output:\n  delivery: zip\n  fileName: sdk.zip"
        );
        const built = build(await loadFixture(publishing));
        expect(built.success).toBe(true);
        if (built.success) {
            expect(built.sdkConfigIr.output).toMatchObject({ delivery: "files", path: "/fern/output" });
            expect(built.warnings).toHaveLength(1);
            expect(built.warnings[0]).toContain("zip");
            expect(built.sdkConfigIr.compatibility?.unsupportedFields?.[0]?.code).toBe(
                "LOCAL_RUN_REQUIRES_FILES_DELIVERY"
            );
        }
    });

    it("refuses a language the document has no target for", async () => {
        const built = build(await loadFixture(), { language: "go", generatorName: "fernapi/fern-go-sdk" });
        expect(built.success).toBe(false);
        if (!built.success) {
            expect(built.message).toContain('no "go" target');
            expect(built.message).toContain("typescript, python");
        }
    });
});

describe("collectOnPremSourceSpecs", () => {
    const context = { generatorName: "fernapi/fern-typescript-sdk" };

    it("maps an OpenAPI spec to the coordinates the adapter reads", () => {
        const collected = collectOnPremSourceSpecs(OPENAPI_MANIFEST, context);
        expect(collected).toEqual({
            success: true,
            specs: [{ specUrl: "/fern/specs/openapi.yml", specType: "openapi" }]
        });
    });

    // The adapter reads source.specs[0] and ignores the rest, so generating would quietly produce an
    // SDK covering one spec.
    it("refuses a workspace with more than one spec rather than covering only the first", () => {
        const collected = collectOnPremSourceSpecs(
            {
                specs: [
                    { type: "openapi", specPath: "/fern/specs/movies.yml" },
                    { type: "openapi", specPath: "/fern/specs/users.yml" }
                ]
            },
            context
        );
        expect(collected.success).toBe(false);
        if (!collected.success) {
            expect(collected.message).toContain("movies.yml, /fern/specs/users.yml");
        }
    });

    it.each([
        "graphql",
        "protobuf",
        "openrpc"
    ] as const)("refuses %s, which the adapter cannot consume, on the host", (type) => {
        const collected = collectOnPremSourceSpecs({ specs: [{ type, specPath: `/fern/specs/api.${type}` }] }, context);
        expect(collected.success).toBe(false);
        if (!collected.success) {
            expect(collected.message).toContain(type);
        }
    });

    it("refuses an empty manifest", () => {
        expect(collectOnPremSourceSpecs(undefined, context).success).toBe(false);
        expect(collectOnPremSourceSpecs({ specs: [] }, context).success).toBe(false);
    });
});

describe("resolveSdkConfigIr", () => {
    it("tells an unmigrated workspace how to migrate, naming the generator that requires it", async () => {
        await withFernDirectory({}, async (absolutePathToFernConfig) => {
            const resolved = await resolveSdkConfigIr({
                generatorInvocation: generatorInvocation(),
                absolutePathToFernConfig,
                organization: "abbey",
                outputPath: "/fern/output",
                rawSpecsManifest: OPENAPI_MANIFEST
            });
            expect(resolved.success).toBe(false);
            if (!resolved.success) {
                expect(resolved.message).toContain("fernapi/fern-typescript-sdk@4.0.0");
                expect(resolved.message).toContain("fern sdk migrate");
                expect(resolved.message).toContain("generators.archived.yml");
            }
        });
    });

    it("builds the IR from sdk-config.yml when the workspace has been migrated", async () => {
        await withFernDirectory({ "sdk-config.yml": SDK_CONFIG_YML }, async (absolutePathToFernConfig) => {
            const resolved = await resolveSdkConfigIr({
                generatorInvocation: generatorInvocation(),
                absolutePathToFernConfig,
                organization: "abbey",
                outputPath: "/fern/output",
                rawSpecsManifest: OPENAPI_MANIFEST
            });
            expect(resolved.success).toBe(true);
            if (resolved.success) {
                expect(resolved.sdkConfigIr.target).toMatchObject({
                    language: "typescript",
                    sdkName: "Abbey Movies",
                    organization: "abbey",
                    sourceOrigin: "fern"
                });
            }
        });
    });
});
