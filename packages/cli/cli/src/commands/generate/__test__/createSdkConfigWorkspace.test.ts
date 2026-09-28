import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { bundleRemoteOpenAPI } from "@fern-api/lazy-fern-workspace";
import {
    createFernSdkGenApiRequest,
    prepareFernSdkGenApiRoutes,
    SDK_CONFIG_UNPINNED_GENERATOR_VERSION
} from "@fern-api/remote-workspace-runner";
import { createMockTaskContext } from "@fern-api/task-context";
import { parseSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSdkConfigWorkspace } from "../createSdkConfigWorkspace.js";

vi.mock("@fern-api/configuration-loader", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/configuration-loader")>()),
    getLatestGeneratorVersion: vi.fn()
}));

vi.mock("@fern-api/lazy-fern-workspace", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/lazy-fern-workspace")>()),
    bundleRemoteOpenAPI: vi.fn()
}));

describe("createSdkConfigWorkspace", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.resetAllMocks();
        vi.unstubAllGlobals();
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("constructs sources without resolving an omitted generator version through FDR", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        await mkdir(path.join(directory, "specs"));
        await writeFile(
            path.join(directory, "specs", "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                sdkVersion: "1.0.0",
                source: {
                    specs: [
                        {
                            id: "payments",
                            type: "openapi",
                            path: "./specs/openapi.yml",
                            namespace: "payments"
                        }
                    ]
                },
                api: { audiences: [] },
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [
                    {
                        language: "typescript",
                        output: { delivery: "files", path: "./generated/typescript" }
                    }
                ]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        expect(workspace.allSpecs).toMatchObject([
            {
                type: "openapi",
                absoluteFilepath: path.join(directory, "specs", "openapi.yml"),
                namespace: "payments"
            }
        ]);
        expect(workspace.generatorsConfiguration?.groups).toMatchObject([
            {
                groupName: "sdk-config",
                generators: [
                    {
                        name: "fernapi/fern-typescript-sdk",
                        version: SDK_CONFIG_UNPINNED_GENERATOR_VERSION,
                        language: "typescript",
                        absolutePathToLocalOutput: path.join(directory, "generated", "typescript")
                    }
                ]
            }
        ]);
        expect(workspace.generatorsConfiguration?.absolutePathToConfiguration).toBe(
            path.join(directory, "sdk-config.yml")
        );
        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        const generatorInvocation = workspace.generatorsConfiguration?.groups[0]?.generators[0];
        if (generatorInvocation == null) {
            throw new Error("Expected the SDK Config generator invocation");
        }
        const sdkConfigV1 = {
            sdkName: "payments",
            sdkVersion: "1.0.0",
            targets: [{ body: Buffer.from('{"schemaVersion":"sdk-config/v1"}'), language: "typescript" }]
        };
        const [prepared] = prepareFernSdkGenApiRoutes({
            generators: [generatorInvocation],
            enabled: true,
            sdkConfigV1,
            requireEnvVars: true,
            isPreview: false
        });
        if (prepared?.route == null) {
            throw new Error("Expected the unpinned SDK Config route");
        }
        const request = createFernSdkGenApiRequest({
            apiName: "Payments",
            organization: "acme",
            cliVersion: "0.0.0",
            generatorInvocation: prepared.generatorInvocation,
            sdkGenApiRoute: prepared.route,
            sdkVersion: "1.0.0",
            specsTarGzBuffer: Buffer.from("archive"),
            payload: { payloadKind: "sdk-config-v1", body: sdkConfigV1.targets[0]?.body ?? Buffer.alloc(0) }
        });
        expect(request.targets[0]?.fernGenerator).toEqual({ id: "fernapi/fern-typescript-sdk" });
        expect(JSON.stringify(request)).not.toContain(SDK_CONFIG_UNPINNED_GENERATOR_VERSION);
        await cleanup();
    });

    it("preserves an explicitly pinned generator version without resolving latest", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        await writeFile(
            path.join(directory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: {
                    specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }]
                },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [
                    {
                        language: "typescript",
                        generatorVersion: "4.0.0",
                        output: { delivery: "zip" }
                    }
                ]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        expect(workspace.generatorsConfiguration?.groups[0]?.generators[0]).toMatchObject({
            name: "fernapi/fern-typescript-sdk",
            version: "4.0.0"
        });
        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        await cleanup();
    });

    it("uses per-language indexes for default duplicate-language files directories", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        await writeFile(
            path.join(directory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );

        const firstConfig = parseSdkConfigV1({
            schemaVersion: "sdk-config/v1",
            sdkName: "payments",
            source: { specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }] },
            api: {},
            client: {},
            package: {},
            docs: {},
            generation: {},
            targets: [{ language: "typescript", output: { delivery: "files" } }]
        });
        const secondConfig = parseSdkConfigV1({
            schemaVersion: "sdk-config/v1",
            sdkName: "payments",
            source: { specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }] },
            api: {},
            client: {},
            package: {},
            docs: {},
            generation: {},
            targets: [{ language: "typescript", output: { delivery: "files" } }]
        });
        const middleConfig = parseSdkConfigV1({
            schemaVersion: "sdk-config/v1",
            sdkName: "payments",
            source: { specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }] },
            api: {},
            client: {},
            package: {},
            docs: {},
            generation: {},
            targets: [{ language: "python", output: { delivery: "files" } }]
        });
        const firstTarget = firstConfig.targets[0];
        const secondTarget = secondConfig.targets[0];
        const middleTarget = middleConfig.targets[0];
        if (firstTarget == null || secondTarget == null || middleTarget == null) {
            throw new Error("Expected individually validated SDK Config targets");
        }

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: {
                ...firstConfig,
                targets: [firstTarget, middleTarget, secondTarget]
            },
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        const generators = workspace.generatorsConfiguration?.groups[0]?.generators;
        expect(generators?.map((generator) => generator.absolutePathToLocalOutput)).toEqual([
            path.join(directory, "generated", "typescript-0"),
            path.join(directory, "generated", "python"),
            path.join(directory, "generated", "typescript-1")
        ]);
        expect(generators?.map((generator) => generator.sdkConfigTargetIndex)).toEqual([0, 1, 2]);
        await cleanup();
    });

    it("maps SDK Config import settings to the Fern importer settings", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        await writeFile(
            path.join(directory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Sample API\n  version: 1.0.0\npaths: {}\n"
        );

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "sample-sdk",
                source: {
                    apiImportSettings: {
                        respectReadonlySchemas: true,
                        discriminatedUnionV2: true,
                        undiscriminatedUnionsWithLiterals: true,
                        inlineAllOfSchemas: true,
                        resolveSchemaCollisions: true,
                        asyncApiMessageNaming: "v2"
                    },
                    specs: [
                        {
                            id: "sample-api",
                            type: "openapi",
                            path: "./openapi.yml",
                            apiImportSettings: { discriminatedUnionV2: false }
                        }
                    ]
                },
                targets: [{ language: "python", output: { delivery: "files" } }]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        const spec = workspace.allSpecs[0];
        if (spec?.type !== "openapi") {
            throw new Error("Expected an OpenAPI specification");
        }
        expect(spec.settings).toMatchObject({
            respectReadonlySchemas: true,
            discriminatedUnionV2: false,
            shouldUseUndiscriminatedUnionsWithLiterals: true,
            inlineAllOfSchemas: true,
            resolveSchemaCollisions: true,
            asyncApiNaming: "v2"
        });
        await cleanup();
    });

    it("materializes a bundled OpenAPI URL source and cleans it up", async () => {
        vi.mocked(bundleRemoteOpenAPI).mockResolvedValue({
            openapi: "3.0.0",
            info: { title: "Payments", version: "1.0.0" },
            paths: {}
        });
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);

        const created = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: {
                    specs: [
                        {
                            id: "payments",
                            type: "openapi",
                            url: "https://example.com/openapi.yaml"
                        }
                    ]
                },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [{ language: "typescript", generatorVersion: "4.0.0", output: { delivery: "zip" } }]
            }),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        const materialized = created.workspace.allSpecs[0];
        if (materialized?.type !== "openapi") {
            throw new Error("Expected an OpenAPI specification");
        }
        expect(bundleRemoteOpenAPI).toHaveBeenCalledWith("https://example.com/openapi.yaml");
        expect(JSON.parse(await readFile(materialized.absoluteFilepath, "utf-8"))).toMatchObject({
            info: { title: "Payments" }
        });

        await created.cleanup();
        await expect(access(materialized.absoluteFilepath)).rejects.toThrow();
    });

    it.each(["asyncapi", "graphql"] as const)("rejects unsupported %s URL sources", async (type) => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);

        await expect(
            createSdkConfigWorkspace({
                sdkConfig: parseSdkConfigV1({
                    schemaVersion: "sdk-config/v1",
                    sdkName: "payments",
                    source: {
                        specs: [{ id: "payments", type, url: `https://example.com/${type}.yaml` }]
                    },
                    api: {},
                    client: {},
                    package: {},
                    docs: {},
                    generation: {},
                    targets: [{ language: "typescript", generatorVersion: "4.0.0", output: { delivery: "zip" } }]
                }),
                absolutePathToConfig: path.join(directory, "sdk-config.yml"),
                cliVersion: "0.0.0",
                context: {
                    failAndThrow: (message: string) => {
                        throw new Error(message);
                    }
                } as never
            })
        ).rejects.toThrow(`SDK Config ${type} URL source 'payments' is not supported`);
    });
});
