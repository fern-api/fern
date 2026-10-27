import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { bundleRemoteOpenAPI, type OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createLogger, LogLevel } from "@fern-api/logger";
import {
    createFernSdkGenApiRequest,
    prepareFernSdkGenApiRoutes,
    SDK_CONFIG_UNPINNED_GENERATOR_VERSION
} from "@fern-api/remote-workspace-runner";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";
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
            isSdkGenApiEnabled: () => true,
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

    it("resolves migrated source paths from their shared project root", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        const configDirectory = path.join(directory, "build_configs", "fern", "airweave", "fern");
        const specPath = path.join(directory, "specs", "airweave", "openapi.yml");
        const overridesPath = path.join(configDirectory, "definition", "overrides.yml");
        const duplicateSpecPath = path.join(configDirectory, "specs", "airweave", "openapi.yml");
        const duplicateOverridesPath = path.join(
            configDirectory,
            "build_configs",
            "fern",
            "airweave",
            "fern",
            "definition",
            "overrides.yml"
        );
        await mkdir(path.dirname(specPath), { recursive: true });
        await mkdir(path.dirname(overridesPath), { recursive: true });
        await mkdir(path.dirname(duplicateSpecPath), { recursive: true });
        await mkdir(path.dirname(duplicateOverridesPath), { recursive: true });
        await writeFile(specPath, "openapi: 3.0.0\ninfo:\n  title: Airweave\n  version: 1.0.0\npaths: {}\n");
        await writeFile(overridesPath, "{}\n");
        await writeFile(duplicateSpecPath, "openapi: 3.0.0\ninfo:\n  title: Wrong API\n  version: 1.0.0\npaths: {}\n");
        await writeFile(duplicateOverridesPath, "wrong: true\n");

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "airweave",
                source: {
                    specs: [
                        {
                            id: "airweave",
                            type: "openapi",
                            path: "./specs/airweave/openapi.yml",
                            overrides: ["./build_configs/fern/airweave/fern/definition/overrides.yml"]
                        }
                    ]
                },
                targets: [{ language: "typescript", output: { delivery: "files" } }]
            }),
            absolutePathToConfig: path.join(configDirectory, "sdk-config.yml"),
            sourceRoot: directory,
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        expect(workspace.allSpecs[0]).toMatchObject({
            absoluteFilepath: specPath,
            absoluteFilepathToOverrides: [overridesPath]
        });
        await cleanup();
    });

    it("keeps missing sources anchored to the owning project source root", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-workspace-"));
        temporaryDirectories.push(directory);
        const projectDirectory = path.join(directory, "project");
        const configDirectory = path.join(projectDirectory, "fern");
        const coincidentalSpecPath = path.join(directory, "specs", "openapi.yml");
        await mkdir(path.dirname(coincidentalSpecPath), { recursive: true });
        await mkdir(configDirectory, { recursive: true });
        await writeFile(
            coincidentalSpecPath,
            "openapi: 3.0.0\ninfo:\n  title: Wrong API\n  version: 1.0.0\npaths: {}\n"
        );

        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: parseSdkConfigV1({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./specs/openapi.yml" }] },
                targets: [{ language: "typescript", output: { delivery: "files" } }]
            }),
            absolutePathToConfig: path.join(configDirectory, "sdk-config.yml"),
            sourceRoot: projectDirectory,
            cliVersion: "0.0.0",
            context: createMockTaskContext()
        });

        expect(workspace.allSpecs[0]).toMatchObject({
            absoluteFilepath: path.join(projectDirectory, "specs", "openapi.yml")
        });
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

describe("createSdkConfigWorkspace protobuf sources", () => {
    const temporaryDirectories: string[] = [];
    const PROTO = 'syntax = "proto3";\npackage acme.v1;\nservice Users {}\n';

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    async function createDirectory(): Promise<string> {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-proto-"));
        temporaryDirectories.push(directory);
        return directory;
    }

    async function writeFiles(directory: string, files: Record<string, string>): Promise<void> {
        for (const [relativePath, contents] of Object.entries(files)) {
            await mkdir(path.dirname(path.join(directory, relativePath)), { recursive: true });
            await writeFile(path.join(directory, relativePath), contents);
        }
    }

    function recordingContext(): { context: TaskContext; warnings: string[] } {
        const warnings: string[] = [];
        const logger = createLogger((level, ...args) => {
            if (level === LogLevel.Warn) {
                warnings.push(args.join(" "));
            }
        });
        return {
            warnings,
            context: {
                ...createMockTaskContext({ logger }),
                failAndThrow: (message?: string, error?: unknown): never => {
                    throw new Error(message, { cause: error });
                }
            }
        };
    }

    function protoConfig(
        specs: Array<Record<string, unknown>>,
        apiImportSettings?: Record<string, unknown>
    ): ReturnType<typeof parseSdkConfigV1> {
        return parseSdkConfigV1({
            schemaVersion: "sdk-config/v1",
            sdkName: "acme",
            source: { specs, ...(apiImportSettings != null ? { apiImportSettings } : {}) },
            targets: [{ language: "typescript", output: { delivery: "files" } }]
        });
    }

    async function load({
        directory,
        specs,
        apiImportSettings,
        sourceRoot,
        context = recordingContext().context
    }: {
        directory: string;
        specs: Array<Record<string, unknown>>;
        apiImportSettings?: Record<string, unknown>;
        sourceRoot?: string;
        context?: TaskContext;
    }): Promise<OSSWorkspace> {
        const { workspace, cleanup } = await createSdkConfigWorkspace({
            sdkConfig: protoConfig(specs, apiImportSettings),
            absolutePathToConfig: path.join(directory, "sdk-config.yml"),
            sourceRoot,
            cliVersion: "0.0.0",
            context
        });
        await cleanup();
        return workspace;
    }

    it("loads a local root without a target, defaulting fromOpenApi to false", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });

        const workspace = await load({ directory, specs: [{ id: "users", proto: { root: "./proto" } }] });

        expect(workspace.allSpecs).toEqual([
            {
                type: "protobuf",
                absoluteFilepathToProtobufRoot: path.join(directory, "proto"),
                absoluteFilepathToProtobufTarget: undefined,
                absoluteFilepathToOverrides: undefined,
                relativeFilepathToProtobufRoot: "./proto",
                dependencies: [],
                generateLocally: false,
                fromOpenAPI: false,
                settings: expect.any(Object)
            }
        ]);
        expect(workspace.specs).toEqual([]);
    });

    it("loads a local root with a target, dependencies and local generation", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });

        const workspace = await load({
            directory,
            specs: [
                {
                    id: "users",
                    proto: {
                        root: "./proto",
                        target: "./proto/acme/v1/users.proto",
                        dependencies: ["buf.build/googleapis/googleapis"],
                        localGeneration: true
                    }
                }
            ]
        });

        expect(workspace.allSpecs[0]).toMatchObject({
            type: "protobuf",
            absoluteFilepathToProtobufRoot: path.join(directory, "proto"),
            absoluteFilepathToProtobufTarget: path.join(directory, "proto", "acme", "v1", "users.proto"),
            dependencies: ["buf.build/googleapis/googleapis"],
            generateLocally: true,
            fromOpenAPI: false
        });
    });

    it("resolves a single override", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO, "overrides/a.yml": "{}\n" });

        const workspace = await load({
            directory,
            specs: [{ id: "users", proto: { root: "./proto", overrides: ["./overrides/a.yml"] } }]
        });

        expect(workspace.allSpecs[0]).toMatchObject({
            absoluteFilepathToOverrides: [path.join(directory, "overrides", "a.yml")]
        });
    });

    it("keeps multiple overrides in their configured order", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, {
            "proto/acme/v1/users.proto": PROTO,
            "overrides/a.yml": "{}\n",
            "overrides/b.yml": "{}\n",
            "overrides/c.yml": "{}\n"
        });

        const workspace = await load({
            directory,
            specs: [
                {
                    id: "users",
                    proto: {
                        root: "./proto",
                        overrides: ["./overrides/c.yml", "./overrides/a.yml", "./overrides/b.yml"]
                    }
                }
            ]
        });

        expect(workspace.allSpecs[0]).toMatchObject({
            absoluteFilepathToOverrides: [
                path.join(directory, "overrides", "c.yml"),
                path.join(directory, "overrides", "a.yml"),
                path.join(directory, "overrides", "b.yml")
            ]
        });
    });

    it("puts a fromOpenApi: true source in specs only", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });

        const workspace = await load({
            directory,
            specs: [{ id: "users", proto: { root: "./proto", fromOpenApi: true } }]
        });

        expect(workspace.specs).toMatchObject([{ type: "protobuf", fromOpenAPI: true }]);
        expect(workspace.allSpecs).toEqual([]);
    });

    it("puts an explicit fromOpenApi: false source in allSpecs only", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });

        const workspace = await load({
            directory,
            specs: [{ id: "users", proto: { root: "./proto", fromOpenApi: false } }]
        });

        expect(workspace.allSpecs).toMatchObject([{ type: "protobuf", fromOpenAPI: false }]);
        expect(workspace.specs).toEqual([]);
    });

    it("resolves local paths against the source root, including parent segments", async () => {
        const directory = await createDirectory();
        const configDirectory = path.join(directory, "fern");
        await writeFiles(directory, {
            "protos/acme/v1/users.proto": PROTO,
            "fern/overrides.yml": "{}\n"
        });

        const fromSourceRoot = await load({
            directory: configDirectory,
            sourceRoot: directory,
            specs: [
                {
                    id: "users",
                    proto: {
                        root: "./protos",
                        target: "./protos/acme/v1/users.proto",
                        overrides: ["./fern/overrides.yml"]
                    }
                }
            ]
        });
        const fromConfigDirectory = await load({
            directory: configDirectory,
            specs: [{ id: "users", proto: { root: "../protos", target: "../protos/acme/v1/users.proto" } }]
        });

        expect(fromSourceRoot.allSpecs[0]).toMatchObject({
            absoluteFilepathToProtobufRoot: path.join(directory, "protos"),
            absoluteFilepathToProtobufTarget: path.join(directory, "protos", "acme", "v1", "users.proto"),
            absoluteFilepathToOverrides: [path.join(directory, "fern", "overrides.yml")]
        });
        expect(fromConfigDirectory.allSpecs[0]).toMatchObject({
            absoluteFilepathToProtobufRoot: path.join(directory, "protos"),
            absoluteFilepathToProtobufTarget: path.join(directory, "protos", "acme", "v1", "users.proto")
        });
    });

    it.each([
        ["root", { root: "./missing" }, "missing"],
        ["target", { root: "./proto", target: "./proto/missing.proto" }, "proto/missing.proto"]
    ])("fails with a config error when the %s does not exist", async (_, proto, missingPath) => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });

        await expect(load({ directory, specs: [{ id: "users", proto }] })).rejects.toThrow(
            new RegExp(`SDK Config protobuf source 'users'.*${missingPath.replace(".", "\\.")}`)
        );
    });

    describe("git roots", () => {
        async function createRepository(): Promise<string> {
            const repository = await createDirectory();
            await writeFiles(repository, {
                "protos/acme/v1/users.proto": PROTO,
                "protos/acme/v1/orders.proto": PROTO.replace("Users", "Orders")
            });
            const git = (...args: string[]) =>
                promisify(execFile)("git", ["-c", "user.name=test", "-c", "user.email=test@example.com", ...args], {
                    cwd: repository
                });
            await git("init", "--quiet", "--initial-branch=main");
            await git("add", ".");
            await git("commit", "--quiet", "-m", "protos");
            return `file://${repository}`;
        }

        it("clones the repository and resolves the target against the repository root", async () => {
            const repository = await createRepository();
            const directory = await createDirectory();
            await writeFiles(directory, { "overrides.yml": "{}\n" });

            const workspace = await load({
                directory,
                specs: [
                    {
                        id: "users",
                        proto: {
                            root: { git: { repo: repository, ref: "main", path: "protos" } },
                            target: "protos/acme/v1/users.proto",
                            overrides: ["./overrides.yml"],
                            fromOpenApi: true
                        }
                    }
                ]
            });

            const spec = workspace.specs[0];
            if (spec?.type !== "protobuf") {
                throw new Error("Expected a protobuf spec");
            }
            expect(path.basename(spec.absoluteFilepathToProtobufRoot)).toBe("protos");
            expect(spec.absoluteFilepathToProtobufTarget).toBe(
                path.join(spec.absoluteFilepathToProtobufRoot, "acme", "v1", "users.proto")
            );
            expect(spec.absoluteFilepathToOverrides).toEqual([path.join(directory, "overrides.yml")]);
            expect(spec.relativeFilepathToProtobufRoot).toBe("protos");
            expect(
                await readFile(path.join(spec.absoluteFilepathToProtobufRoot, "acme", "v1", "users.proto"), "utf-8")
            ).toBe(PROTO);
        });

        it("clones a git root without a ref or target", async () => {
            const repository = await createRepository();
            const directory = await createDirectory();

            const workspace = await load({
                directory,
                specs: [{ id: "users", proto: { root: { git: { repo: repository, path: "protos" } } } }]
            });

            const spec = workspace.allSpecs[0];
            if (spec?.type !== "protobuf") {
                throw new Error("Expected a protobuf spec");
            }
            expect(spec.absoluteFilepathToProtobufTarget).toBeUndefined();
            expect(spec.fromOpenAPI).toBe(false);
            expect(
                await readFile(path.join(spec.absoluteFilepathToProtobufRoot, "acme", "v1", "orders.proto"), "utf-8")
            ).toContain("Orders");
        });
    });

    it("maps merged import settings onto the protobuf spec", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });

        const workspace = await load({
            directory,
            apiImportSettings: { respectReadonlySchemas: true, discriminatedUnionV2: true },
            specs: [
                {
                    id: "users",
                    proto: { root: "./proto" },
                    apiImportSettings: { discriminatedUnionV2: false, idiomaticRequestNames: true }
                }
            ]
        });

        expect(workspace.allSpecs[0]).toMatchObject({
            settings: {
                respectReadonlySchemas: true,
                discriminatedUnionV2: false,
                shouldUseIdiomaticRequestNames: true
            }
        });
    });

    it("warns that a namespace is not applied to a protobuf source", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, { "proto/acme/v1/users.proto": PROTO });
        const { context, warnings } = recordingContext();

        const workspace = await load({
            directory,
            context,
            specs: [{ id: "users", namespace: "users", proto: { root: "./proto" } }]
        });

        expect(workspace.allSpecs).toHaveLength(1);
        expect(warnings).toEqual([expect.stringContaining("SDK Config protobuf source 'users' sets namespace")]);
    });

    it("loads OpenAPI and protobuf sources together in configured order", async () => {
        const directory = await createDirectory();
        await writeFiles(directory, {
            "proto/acme/v1/users.proto": PROTO,
            "openapi.yml": "openapi: 3.0.0\ninfo:\n  title: Orders\n  version: 1.0.0\npaths: {}\n"
        });

        const workspace = await load({
            directory,
            specs: [
                { id: "users", proto: { root: "./proto", fromOpenApi: true } },
                { id: "orders", type: "openapi", path: "./openapi.yml" },
                { id: "docs-only", proto: { root: "./proto" } }
            ]
        });

        expect(workspace.specs.map((spec) => spec.type)).toEqual(["protobuf", "openapi"]);
        expect(workspace.allSpecs.map((spec) => spec.type)).toEqual(["openapi", "protobuf"]);
    });
});
