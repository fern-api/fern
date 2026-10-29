import type { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { ConjureWorkspace, convertProtobufSpecs, LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import {
    createGroupedSpecsTarGzArchiveSettled,
    validateSdkConfigImportSettings
} from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { type FernSdkConfigV1Payload, type FernSourceArchiveRequest } from "@fern-api/remote-workspace-runner";
import { createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFernSourceArchiveResolver } from "../createFernSourceArchiveResolver.js";

vi.mock("@fern-api/lazy-fern-workspace", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/lazy-fern-workspace")>()),
    convertProtobufSpecs: vi.fn()
}));

vi.mock("@fern-api/local-workspace-runner", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/local-workspace-runner")>()),
    createGroupedSpecsTarGzArchiveSettled: vi.fn(),
    validateSdkConfigImportSettings: vi.fn()
}));

function makeGenerator(): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-sdk",
        version: "4.0.0",
        config: {},
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        automation: { generate: false, upgrade: false, preview: false, verify: false },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/test-output"),
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        language: "typescript",
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };
}

describe("createFernSourceArchiveResolver", () => {
    beforeEach(() => {
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockReset();
        vi.mocked(validateSdkConfigImportSettings).mockReset();
    });

    it("returns an actionable error when the workspace cannot expose source specs", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new ConjureWorkspace({
            context,
            generatorsConfiguration: undefined,
            workspaceName: "conjure-api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/conjure-api"),
            relativePathToConjureDirectory: RelativeFilePath.of("conjure")
        });
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const request: FernSourceArchiveRequest = {
            generatorIndex: 3,
            sdkConfigTargetIndex: 1,
            generatorInvocation,
            sdkGenApiRoute: {
                generatorId: generatorInvocation.name,
                language: "typescript",
                requestedVersion: generatorInvocation.version,
                cutoverVersion: "4.0.0",
                configKind: "sdk-config-v1",
                payloadKind: "sdk-config-v1"
            }
        };

        const resolution = await createFernSourceArchiveResolver({ workspace, context, group })([request]);

        expect(resolution.sourceArchives).toEqual(new Map());
        expect(resolution.errors.get(3)).toMatchObject({
            message:
                "Generator index 3 (fernapi/fern-typescript-sdk) requires a source archive, but workspace type conjure does not expose source specs"
        });
    });

    it("builds an archive from a composed workspace's namespaced dependency specs", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const usersSpec: Spec = {
            type: "openapi",
            absoluteFilepath: AbsoluteFilePath.of("/apis/users-api/users-openapi.json"),
            absoluteFilepathToOverrides: undefined,
            absoluteFilepathToOverlays: undefined,
            source: {
                type: "openapi",
                file: AbsoluteFilePath.of("/apis/users-api/users-openapi.json")
            },
            namespace: "users"
        };
        const paymentsSpec: Spec = {
            type: "openapi",
            absoluteFilepath: AbsoluteFilePath.of("/apis/payments-api/payments-openapi.json"),
            absoluteFilepathToOverrides: undefined,
            absoluteFilepathToOverlays: undefined,
            source: { type: "openapi", file: AbsoluteFilePath.of("/apis/payments-api/payments-openapi.json") },
            namespace: "payments"
        };
        const workspace = new LazyFernWorkspace({
            context,
            generatorsConfiguration: undefined,
            workspaceName: "combined",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/combined")
        });
        vi.spyOn(workspace, "composesSourceSpecs").mockResolvedValue(true);
        vi.spyOn(workspace, "getAllSpecsForGenerator").mockResolvedValue([usersSpec, paymentsSpec]);
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const request: FernSourceArchiveRequest = {
            generatorIndex: 0,
            sdkConfigTargetIndex: 0,
            generatorInvocation,
            sdkGenApiRoute: {
                generatorId: generatorInvocation.name,
                language: "typescript",
                requestedVersion: generatorInvocation.version,
                cutoverVersion: "4.0.0",
                configKind: "sdk-config-v1",
                payloadKind: "sdk-config-v1"
            }
        };
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [] },
                specIndexesByGeneratorIndex: new Map([[0, [0, 1]]])
            },
            errorsByGeneratorIndex: new Map()
        });

        const resolution = await createFernSourceArchiveResolver({ workspace, context, group })([request]);

        expect(resolution.errors).toEqual(new Map());
        expect(resolution.sourceArchives.get(0)).toMatchObject({ specIndexes: [0, 1] });
        expect(createGroupedSpecsTarGzArchiveSettled).toHaveBeenCalledWith(
            expect.objectContaining({
                generatorSelections: [{ generatorIndex: 0, specs: [usersSpec, paymentsSpec] }]
            })
        );
    });

    it("rejects a Fern Definition routed to sdk-gen-api as deprecated", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new LazyFernWorkspace({
            context,
            generatorsConfiguration: undefined,
            workspaceName: "imdb",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/imdb")
        });
        vi.spyOn(workspace, "composesSourceSpecs").mockResolvedValue(false);
        const getAllSpecsForGenerator = vi.spyOn(workspace, "getAllSpecsForGenerator");
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const request: FernSourceArchiveRequest = {
            generatorIndex: 0,
            generatorInvocation,
            sdkGenApiRoute: {
                generatorId: generatorInvocation.name,
                language: "typescript",
                requestedVersion: generatorInvocation.version,
                cutoverVersion: "4.0.0",
                configKind: "legacy-fern",
                payloadKind: "fern-runtime-bundle"
            }
        };

        const resolution = await createFernSourceArchiveResolver({ workspace, context, group })([request]);

        expect(resolution.sourceArchives).toEqual(new Map());
        expect(resolution.errors.get(0)).toMatchObject({
            message: expect.stringMatching(
                /^Workspace imdb uses a Fern Definition, which is deprecated and not supported for SDK generation through sdk-gen-api\./
            )
        });
        expect(getAllSpecsForGenerator).not.toHaveBeenCalled();
    });

    it("preserves the preparation error when archive outcomes violate the invariant", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new OSSWorkspace({
            allSpecs: [],
            specs: [],
            generatorsConfiguration: undefined,
            workspaceName: "openapi-api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/openapi-api")
        });
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const request: FernSourceArchiveRequest = {
            generatorIndex: 1,
            sdkConfigTargetIndex: 0,
            generatorInvocation,
            sdkGenApiRoute: {
                generatorId: generatorInvocation.name,
                language: "typescript",
                requestedVersion: generatorInvocation.version,
                cutoverVersion: "4.0.0",
                configKind: "sdk-config-v1",
                payloadKind: "sdk-config-v1"
            }
        };
        const preparationError = new Error("source preparation failed");
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [] },
                specIndexesByGeneratorIndex: new Map([[1, []]])
            },
            errorsByGeneratorIndex: new Map([[1, preparationError]])
        });

        await expect(
            createFernSourceArchiveResolver({
                workspace,
                context,
                group,
                sdkConfigV1: {
                    sdkName: "api",
                    sdkVersion: "1.0.0",
                    audiences: [],
                    targets: [
                        { body: Buffer.from("{}"), language: "typescript", clientPathParameterStyle: "inline" },
                        { body: Buffer.from("{}"), language: "typescript", clientPathParameterStyle: "wrapped" }
                    ]
                }
            })([request])
        ).rejects.toMatchObject({
            message: "Generator index 1 produced both a source archive and a source preparation error",
            cause: preparationError
        });
        expect(createGroupedSpecsTarGzArchiveSettled).toHaveBeenCalledWith(
            expect.objectContaining({ audiences: { type: "select", audiences: [] } })
        );
        expect(validateSdkConfigImportSettings).toHaveBeenCalledWith([], {
            clientPathParameterStyle: "inline"
        });
    });

    it("uses the selected target path parameter style and falls back to the root style", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const workspace = new OSSWorkspace({
            allSpecs: [],
            specs: [],
            generatorsConfiguration: undefined,
            workspaceName: "openapi-api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/tmp/openapi-api")
        });
        const group: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: { type: "all" },
            generators: [generatorInvocation],
            reviewers: undefined
        };
        const route = {
            generatorId: generatorInvocation.name,
            language: "typescript" as const,
            requestedVersion: generatorInvocation.version,
            cutoverVersion: "4.0.0",
            configKind: "sdk-config-v1" as const,
            payloadKind: "sdk-config-v1" as const
        };
        const requests: FernSourceArchiveRequest[] = [
            { generatorIndex: 0, sdkConfigTargetIndex: 1, generatorInvocation, sdkGenApiRoute: route },
            { generatorIndex: 1, generatorInvocation, sdkGenApiRoute: route }
        ];
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [] },
                specIndexesByGeneratorIndex: new Map([
                    [0, []],
                    [1, []]
                ])
            },
            errorsByGeneratorIndex: new Map()
        });

        await createFernSourceArchiveResolver({
            workspace,
            context,
            group,
            sdkConfigV1: {
                sdkName: "api",
                sdkVersion: "1.0.0",
                clientPathParameterStyle: "inline",
                targets: [
                    { body: Buffer.from("{}"), language: "typescript" },
                    { body: Buffer.from("{}"), language: "typescript", clientPathParameterStyle: "wrapped" }
                ]
            }
        })(requests);

        expect(validateSdkConfigImportSettings).toHaveBeenNthCalledWith(1, [], {
            clientPathParameterStyle: "wrapped"
        });
        expect(validateSdkConfigImportSettings).toHaveBeenNthCalledWith(2, [], {
            clientPathParameterStyle: "inline"
        });
    });
});

describe("createFernSourceArchiveResolver protobuf sources", () => {
    const route = {
        generatorId: "fernapi/fern-typescript-sdk",
        language: "typescript" as const,
        requestedVersion: "4.0.0",
        cutoverVersion: "4.0.0",
        configKind: "sdk-config-v1" as const,
        payloadKind: "sdk-config-v1" as const
    };
    const group = (generatorInvocation: generatorsYml.GeneratorInvocation): generatorsYml.GeneratorGroup => ({
        groupName: "test",
        audiences: { type: "all" },
        generators: [generatorInvocation],
        reviewers: undefined
    });

    function plainSpec(): OpenAPISpec {
        const file = AbsoluteFilePath.of("/api/plain.yml");
        return {
            type: "openapi",
            absoluteFilepath: file,
            absoluteFilepathToOverrides: undefined,
            absoluteFilepathToOverlays: undefined,
            source: { type: "openapi", file }
        };
    }

    function protoSpec(name: string, fromOpenAPI: boolean): ProtobufSpec {
        return {
            type: "protobuf",
            absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(`/api/${name}`),
            absoluteFilepathToProtobufTarget: undefined,
            absoluteFilepathToOverrides: [AbsoluteFilePath.of(`/api/${name}-overrides.yml`)],
            relativeFilepathToProtobufRoot: RelativeFilePath.of(name),
            generateLocally: true,
            fromOpenAPI,
            dependencies: []
        };
    }

    function converted(proto: ProtobufSpec, file: string): OpenAPISpec {
        return {
            type: "openapi",
            absoluteFilepath: AbsoluteFilePath.of(`/tmp/${file}.yaml`),
            absoluteFilepathToOverrides: proto.absoluteFilepathToOverrides,
            absoluteFilepathToOverlays: undefined,
            source: {
                type: "protobuf",
                root: proto.absoluteFilepathToProtobufRoot,
                file: AbsoluteFilePath.of(`${proto.absoluteFilepathToProtobufRoot}/${file}.proto`)
            }
        };
    }

    function ossWorkspace(sourceSpecs: Spec[]): OSSWorkspace {
        return new OSSWorkspace({
            allSpecs: sourceSpecs.filter((spec) => spec.type !== "protobuf" || !spec.fromOpenAPI),
            specs: sourceSpecs.filter(
                (spec): spec is OpenAPISpec | ProtobufSpec =>
                    spec.type === "openapi" || (spec.type === "protobuf" && spec.fromOpenAPI)
            ),
            sourceSpecs,
            generatorsConfiguration: undefined,
            workspaceName: "api",
            cliVersion: "0.0.0",
            absoluteFilePath: AbsoluteFilePath.of("/api")
        });
    }

    function sdkConfigV1(specs: unknown[]): FernSdkConfigV1Payload {
        const body = Buffer.from(JSON.stringify({ source: { specs }, targets: [{ language: "typescript" }] }));
        return { sdkName: "api", sdkVersion: "1.0.0", targets: [{ body, language: "typescript" }] };
    }

    beforeEach(() => {
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockReset();
        vi.mocked(validateSdkConfigImportSettings).mockReset();
        vi.mocked(convertProtobufSpecs).mockReset();
    });

    it("uploads converted protos, drops docs-only protos and rewrites the SDK Config sources to match", async () => {
        const warn = vi.fn();
        const context = createMockTaskContext({ logger: { ...CONSOLE_LOGGER, warn } });
        const generatorInvocation = makeGenerator();
        const orders = protoSpec("orders", true);
        const docs = protoSpec("docs", false);
        const plain = plainSpec();
        const workspace = ossWorkspace([orders, docs, plain]);
        const ordersA = converted(orders, "a");
        const ordersB = converted(orders, "b");
        const convertCached = vi
            .spyOn(workspace, "getConvertedProtobufSpecsCached")
            .mockResolvedValue([{ protobufSpec: orders, openApiSpecs: [ordersA, ordersB] }]);
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: {
                    specs: [
                        { type: "openapi", origin: "protobuf", specPath: "/fern/specs/openapi0.json" },
                        { type: "openapi", origin: "protobuf", specPath: "/fern/specs/openapi1.json" },
                        { type: "openapi", specPath: "/fern/specs/openapi2.json" }
                    ]
                },
                specIndexesByGeneratorIndex: new Map([[0, [0, 1, 2]]])
            },
            errorsByGeneratorIndex: new Map()
        });
        const plainConfigured = { id: "plain", type: "openapi", path: "./plain.yml" };

        const resolution = await createFernSourceArchiveResolver({
            workspace,
            context,
            group: group(generatorInvocation),
            sdkConfigV1: sdkConfigV1([
                { id: "orders", proto: { root: "./orders", fromOpenApi: true } },
                { id: "docs", proto: { root: "./docs" } },
                plainConfigured
            ])
        })([{ generatorIndex: 0, sdkConfigTargetIndex: 0, generatorInvocation, sdkGenApiRoute: route }]);

        expect(resolution.errors).toEqual(new Map());
        expect(convertCached).toHaveBeenCalledTimes(1);
        expect(convertProtobufSpecs).not.toHaveBeenCalled();
        expect(createGroupedSpecsTarGzArchiveSettled).toHaveBeenCalledWith(
            expect.objectContaining({ generatorSelections: [{ generatorIndex: 0, specs: [ordersA, ordersB, plain] }] })
        );
        expect(validateSdkConfigImportSettings).toHaveBeenCalledWith([ordersA, ordersB, plain], {
            clientPathParameterStyle: undefined
        });
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("is docs-only (from-openapi is false)"));
        expect(resolution.sourceArchives.get(0)?.sdkConfigSourceSpecs).toEqual([
            { id: "orders:a.proto", type: "openapi", path: "fern/specs/openapi0.json" },
            { id: "orders:b.proto", type: "openapi", path: "fern/specs/openapi1.json" },
            plainConfigured
        ]);
    });

    it("leaves SDK Config sources alone when nothing was converted or dropped", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const plain = plainSpec();
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }] },
                specIndexesByGeneratorIndex: new Map([[0, [0]]])
            },
            errorsByGeneratorIndex: new Map()
        });

        const resolution = await createFernSourceArchiveResolver({
            workspace: ossWorkspace([plain]),
            context,
            group: group(generatorInvocation),
            sdkConfigV1: sdkConfigV1([{ id: "plain", type: "openapi", path: "./plain.yml" }])
        })([{ generatorIndex: 0, sdkConfigTargetIndex: 0, generatorInvocation, sdkGenApiRoute: route }]);

        expect(resolution.sourceArchives.get(0)).toBeDefined();
        expect(resolution.sourceArchives.get(0)).not.toHaveProperty("sdkConfigSourceSpecs");
    });

    it("converts the protos of a generator-level specs override afresh", async () => {
        const context = createMockTaskContext();
        const orders = protoSpec("orders", true);
        const ordersA = converted(orders, "a");
        const workspace = ossWorkspace([]);
        vi.spyOn(workspace, "getSdkSourceSpecs").mockResolvedValue([orders]);
        vi.mocked(convertProtobufSpecs).mockResolvedValue([{ protobufSpec: orders, openApiSpecs: [ordersA] }]);
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [{ type: "openapi", origin: "protobuf", specPath: "/fern/specs/openapi0.json" }] },
                specIndexesByGeneratorIndex: new Map([[0, [0]]])
            },
            errorsByGeneratorIndex: new Map()
        });
        const generatorInvocation: generatorsYml.GeneratorInvocation = {
            ...makeGenerator(),
            apiOverride: { specs: [{ proto: { root: "orders", "from-openapi": true } }] }
        };

        const resolution = await createFernSourceArchiveResolver({
            workspace,
            context,
            group: group(generatorInvocation)
        })([{ generatorIndex: 0, generatorInvocation, sdkGenApiRoute: route }]);

        expect(resolution.errors).toEqual(new Map());
        expect(convertProtobufSpecs).toHaveBeenCalledWith({ context, specs: [orders] });
        expect(createGroupedSpecsTarGzArchiveSettled).toHaveBeenCalledWith(
            expect.objectContaining({ generatorSelections: [{ generatorIndex: 0, specs: [ordersA] }] })
        );
    });

    it("keeps raw source selection for routes that are not SDK Config", async () => {
        const context = createMockTaskContext();
        const generatorInvocation = makeGenerator();
        const docs = protoSpec("docs", false);
        const workspace = ossWorkspace([docs]);
        const getSdkSourceSpecs = vi.spyOn(workspace, "getSdkSourceSpecs");
        vi.mocked(createGroupedSpecsTarGzArchiveSettled).mockResolvedValue({
            archive: {
                buffer: Buffer.alloc(0),
                manifest: { specs: [{ type: "protobuf", specPath: "/fern/specs/protobuf0" }] },
                specIndexesByGeneratorIndex: new Map([[0, [0]]])
            },
            errorsByGeneratorIndex: new Map()
        });

        await createFernSourceArchiveResolver({ workspace, context, group: group(generatorInvocation) })([
            {
                generatorIndex: 0,
                generatorInvocation,
                sdkGenApiRoute: { ...route, configKind: "legacy-fern", payloadKind: "fern-runtime-bundle" }
            }
        ]);

        expect(getSdkSourceSpecs).not.toHaveBeenCalled();
        expect(createGroupedSpecsTarGzArchiveSettled).toHaveBeenCalledWith(
            expect.objectContaining({ generatorSelections: [{ generatorIndex: 0, specs: [docs] }] })
        );
    });
});
