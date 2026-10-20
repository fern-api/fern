import { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import * as Github from "@fern-api/github";
import {
    ConjureWorkspace,
    LazyFernWorkspace,
    OSSWorkspace,
    WorkspaceLoader,
    WorkspaceLoaderFailureType
} from "@fern-api/lazy-fern-workspace";
import { CliError, createMockTaskContext, TaskAbortSignal } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadAPIWorkspace, loadSingleNamespaceAPIWorkspace } from "../loadAPIWorkspace.js";
import { createMockLogger, loggedMessages } from "./createMockLogger.js";

vi.mock("@fern-api/configuration-loader", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/configuration-loader")>();
    return { ...actual, loadGeneratorsConfiguration: vi.fn(actual.loadGeneratorsConfiguration) };
});

vi.mock("@fern-api/github", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/github")>()),
    cloneRepositoryAtRef: vi.fn()
}));

const OPENAPI_CONTENTS = "openapi: 3.0.0\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}\n";
const GRAPHQL_CONTENTS = "type Query {\n  hello: String\n}\n";
const MISCONFIGURED_FAILURE = {
    didSucceed: false,
    failures: { openapi: { type: WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY } }
};

describe("loadAPIWorkspace branches", () => {
    let tmpDir: string;
    let workspaceDir: AbsoluteFilePath;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-api-workspace-branches-"));
        workspaceDir = AbsoluteFilePath.of(path.join(tmpDir, "my-api"));
        await mkdir(workspaceDir, { recursive: true });
    });

    afterEach(async () => {
        vi.clearAllMocks();
        await rm(tmpDir, { recursive: true, force: true });
    });

    /** Writes the given files (relative to the workspace directory), creating parent directories. */
    async function writeFiles(files: Record<string, string>): Promise<void> {
        for (const [relativePath, contents] of Object.entries(files)) {
            const absolutePath = path.join(workspaceDir, relativePath);
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, contents);
        }
    }

    function abs(relativePath: string): AbsoluteFilePath {
        return join(workspaceDir, RelativeFilePath.of(relativePath));
    }

    function fileMissing(key: string): WorkspaceLoader.FailedResult {
        return {
            didSucceed: false,
            failures: { [RelativeFilePath.of(key)]: { type: WorkspaceLoaderFailureType.FILE_MISSING } }
        };
    }

    /** Only the error-responses setting is populated; every other setting is left unset. */
    function settingsWithErrorResponses(
        errorResponses: NonNullable<generatorsYml.APIDefinitionSettings["errorResponses"]>
    ): generatorsYml.APIDefinitionSettings {
        return { errorResponses } as unknown as generatorsYml.APIDefinitionSettings;
    }

    function ossDefinition(
        schemaPath: string,
        overrides: Partial<generatorsYml.APIDefinitionLocation> = {}
    ): generatorsYml.APIDefinitionLocation {
        return {
            schema: { type: "oss", path: schemaPath },
            origin: undefined,
            overrides: undefined,
            overlays: undefined,
            audiences: [],
            settings: undefined,
            ...overrides
        };
    }

    function protobufDefinition(
        schema: Partial<generatorsYml.ProtoAPIDefinitionSchema>,
        overrides: Partial<generatorsYml.APIDefinitionLocation> = {}
    ): generatorsYml.APIDefinitionLocation {
        return {
            schema: {
                type: "protobuf",
                root: "proto",
                target: "",
                localGeneration: false,
                fromOpenAPI: false,
                dependencies: [],
                ...schema
            },
            origin: undefined,
            overrides: undefined,
            overlays: undefined,
            audiences: [],
            settings: undefined,
            ...overrides
        };
    }

    async function loadSingle(
        definitions: generatorsYml.APIDefinitionLocation[],
        namespace: string | undefined = undefined
    ): Promise<Spec[] | WorkspaceLoader.Result> {
        return loadSingleNamespaceAPIWorkspace({ absolutePathToWorkspace: workspaceDir, namespace, definitions });
    }

    async function loadSingleSpecs(
        definitions: generatorsYml.APIDefinitionLocation[],
        namespace: string | undefined = undefined
    ): Promise<Spec[]> {
        const result = await loadSingle(definitions, namespace);
        if (!Array.isArray(result)) {
            throw new Error(`Expected specs but received ${JSON.stringify(result)}`);
        }
        return result;
    }

    async function loadWorkspaceResult(
        generatorsYmlContents: string | undefined,
        options: { lenient?: boolean; context?: ReturnType<typeof createMockTaskContext> } = {}
    ): Promise<WorkspaceLoader.Result> {
        if (generatorsYmlContents != null) {
            await writeFiles({ "generators.yml": generatorsYmlContents });
        }
        return loadAPIWorkspace({
            absolutePathToWorkspace: workspaceDir,
            context: options.context ?? createMockTaskContext(),
            cliVersion: "1.2.3",
            workspaceName: "my-workspace",
            lenient: options.lenient
        });
    }

    async function loadOSSWorkspace(generatorsYmlContents: string): Promise<OSSWorkspace> {
        const result = await loadWorkspaceResult(generatorsYmlContents);
        if (!result.didSucceed) {
            throw new Error(`Expected success but received ${JSON.stringify(result)}`);
        }
        if (!(result.workspace instanceof OSSWorkspace)) {
            throw new Error(`Expected an OSSWorkspace but received ${result.workspace.constructor.name}`);
        }
        return result.workspace;
    }

    describe("loadSingleNamespaceAPIWorkspace", () => {
        it("returns no specs for no definitions", async () => {
            expect(await loadSingle([])).toEqual([]);
        });

        describe("openapi", () => {
            beforeEach(async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
            });

            it("loads a relative spec with defaults", async () => {
                const [spec, ...rest] = await loadSingleSpecs([ossDefinition("openapi.yml")], "my-namespace");

                expect(rest).toEqual([]);
                expect(spec).toMatchObject({
                    type: "openapi",
                    absoluteFilepath: abs("openapi.yml"),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: { type: "openapi", file: abs("openapi.yml") },
                    namespace: "my-namespace",
                    settings: { audiences: [] }
                });
            });

            it("passes audiences through and defaults undefined audiences to an empty list", async () => {
                const [withAudiences, withoutAudiences] = await loadSingleSpecs([
                    ossDefinition("openapi.yml", { audiences: ["public", "beta"] }),
                    ossDefinition("openapi.yml", { audiences: undefined })
                ]);

                expect((withAudiences as OpenAPISpec).settings?.audiences).toEqual(["public", "beta"]);
                expect((withoutAudiences as OpenAPISpec).settings?.audiences).toEqual([]);
            });

            it("uses the asyncapi source type when the schema declares one", async () => {
                const [spec] = await loadSingleSpecs([
                    {
                        ...ossDefinition("openapi.yml"),
                        schema: { type: "oss", path: "openapi.yml", sourceType: "asyncapi" }
                    }
                ]);

                expect(spec).toMatchObject({ type: "openapi", source: { type: "asyncapi", file: abs("openapi.yml") } });
            });

            it("resolves a single override path", async () => {
                await writeFiles({ "overrides.yml": "{}" });
                const [spec] = await loadSingleSpecs([ossDefinition("openapi.yml", { overrides: "overrides.yml" })]);

                expect((spec as OpenAPISpec).absoluteFilepathToOverrides).toBe(abs("overrides.yml"));
            });

            it("resolves an array of override paths in order", async () => {
                await writeFiles({ "a.yml": "{}", "b.yml": "{}" });
                const [spec] = await loadSingleSpecs([ossDefinition("openapi.yml", { overrides: ["a.yml", "b.yml"] })]);

                expect((spec as OpenAPISpec).absoluteFilepathToOverrides).toEqual([abs("a.yml"), abs("b.yml")]);
            });

            it("accepts an empty override array", async () => {
                const [spec] = await loadSingleSpecs([ossDefinition("openapi.yml", { overrides: [] })]);

                expect((spec as OpenAPISpec).absoluteFilepathToOverrides).toEqual([]);
            });

            it("resolves overlays", async () => {
                await writeFiles({ "overlay.yml": "{}" });
                const [spec] = await loadSingleSpecs([ossDefinition("openapi.yml", { overlays: "overlay.yml" })]);

                expect((spec as OpenAPISpec).absoluteFilepathToOverlays).toBe(abs("overlay.yml"));
            });

            it("resolves a string error-responses schema to an absolute path", async () => {
                await writeFiles({ "errors.yml": "{}" });
                const settings = settingsWithErrorResponses({ schema: "errors.yml", name: "ApiError" });

                const [spec] = await loadSingleSpecs([ossDefinition("openapi.yml", { settings })]);

                expect((spec as OpenAPISpec).settings?.errorResponses).toEqual({
                    schema: abs("errors.yml"),
                    name: "ApiError"
                });
            });

            it("leaves an inline error-responses schema untouched", async () => {
                const settings = settingsWithErrorResponses({ schema: { type: "object" }, name: "ApiError" });

                const [spec] = await loadSingleSpecs([ossDefinition("openapi.yml", { settings })]);

                expect((spec as OpenAPISpec).settings?.errorResponses).toEqual({
                    schema: { type: "object" },
                    name: "ApiError"
                });
            });

            it("accepts an absolute path when it was resolved from a git source", async () => {
                const [spec] = await loadSingleSpecs([
                    ossDefinition(abs("openapi.yml"), { resolvedAbsolutePath: true, audiences: ["x"] })
                ]);

                expect(spec).toMatchObject({
                    absoluteFilepath: abs("openapi.yml"),
                    source: { type: "openapi", file: abs("openapi.yml") }
                });
            });

            it("rejects a user-specified absolute path, even if the file exists", async () => {
                const result = await loadSingle([ossDefinition(abs("openapi.yml"))]);

                expect(result).toEqual({
                    didSucceed: false,
                    failures: {
                        "generators.yml": {
                            type: WorkspaceLoaderFailureType.ABSOLUTE_FILEPATH,
                            filepath: abs("openapi.yml")
                        }
                    }
                });
            });

            it("rejects a user-specified absolute path before checking that it exists", async () => {
                const result = await loadSingle([ossDefinition("/does/not/exist.yml")]);

                expect(result).toMatchObject({
                    didSucceed: false,
                    failures: { "generators.yml": { type: WorkspaceLoaderFailureType.ABSOLUTE_FILEPATH } }
                });
            });

            it.each([
                {
                    name: "a missing spec file",
                    definition: () => ossDefinition("missing.yml"),
                    expectedKey: "missing.yml"
                },
                {
                    name: "a missing spec file resolved from a git source (reported by basename)",
                    definition: () => ossDefinition("/clone/dir/nested/gone.yml", { resolvedAbsolutePath: true }),
                    expectedKey: "gone.yml"
                },
                {
                    name: "a missing single override",
                    definition: () => ossDefinition("openapi.yml", { overrides: "missing-override.yml" }),
                    expectedKey: "missing-override.yml"
                },
                {
                    name: "a missing override in an array (the first missing one is reported)",
                    definition: () =>
                        ossDefinition("openapi.yml", {
                            overrides: ["openapi.yml", "missing-1.yml", "missing-2.yml"]
                        }),
                    expectedKey: "missing-1.yml"
                },
                {
                    name: "a missing overlay",
                    definition: () => ossDefinition("openapi.yml", { overlays: "missing-overlay.yml" }),
                    expectedKey: "missing-overlay.yml"
                },
                {
                    name: "a missing error-responses schema file",
                    definition: () =>
                        ossDefinition("openapi.yml", {
                            settings: settingsWithErrorResponses({ schema: "missing-errors.yml" })
                        }),
                    expectedKey: "missing-errors.yml"
                }
            ])("fails with FILE_MISSING for $name", async ({ definition, expectedKey }) => {
                expect(await loadSingle([definition()])).toEqual(fileMissing(expectedKey));
            });

            it("checks the spec before overrides, overlays and error responses", async () => {
                const result = await loadSingle([
                    ossDefinition("missing.yml", {
                        overrides: "missing-override.yml",
                        overlays: "missing-overlay.yml"
                    })
                ]);

                expect(result).toEqual(fileMissing("missing.yml"));
            });

            it("checks overrides before overlays", async () => {
                const result = await loadSingle([
                    ossDefinition("openapi.yml", {
                        overrides: "missing-override.yml",
                        overlays: "missing-overlay.yml"
                    })
                ]);

                expect(result).toEqual(fileMissing("missing-override.yml"));
            });

            it("stops at the first failing definition and discards earlier specs", async () => {
                const result = await loadSingle([ossDefinition("openapi.yml"), ossDefinition("missing.yml")]);

                expect(result).toEqual(fileMissing("missing.yml"));
            });
        });

        describe("protobuf", () => {
            beforeEach(async () => {
                await writeFiles({ "proto/service.proto": 'syntax = "proto3";\n', "overrides.yml": "{}" });
            });

            it("loads a root without a target", async () => {
                const [spec] = await loadSingleSpecs([protobufDefinition({ root: "proto" })]);

                expect(spec).toMatchObject({
                    type: "protobuf",
                    absoluteFilepathToProtobufRoot: abs("proto"),
                    absoluteFilepathToProtobufTarget: undefined,
                    absoluteFilepathToOverrides: undefined,
                    relativeFilepathToProtobufRoot: "proto",
                    dependencies: [],
                    generateLocally: false,
                    fromOpenAPI: false,
                    settings: { audiences: [] }
                });
            });

            it("loads a root with a target, overrides, dependencies and flags", async () => {
                const [spec] = await loadSingleSpecs([
                    protobufDefinition(
                        {
                            root: "proto",
                            target: "proto/service.proto",
                            dependencies: ["buf.build/googleapis/googleapis"],
                            localGeneration: true,
                            fromOpenAPI: true
                        },
                        { overrides: "overrides.yml", audiences: ["public"] }
                    )
                ]);

                expect(spec).toMatchObject({
                    type: "protobuf",
                    absoluteFilepathToProtobufRoot: abs("proto"),
                    absoluteFilepathToProtobufTarget: abs("proto/service.proto"),
                    absoluteFilepathToOverrides: abs("overrides.yml"),
                    relativeFilepathToProtobufRoot: "proto",
                    dependencies: ["buf.build/googleapis/googleapis"],
                    generateLocally: true,
                    fromOpenAPI: true,
                    settings: { audiences: ["public"] }
                });
            });

            it("defaults undefined audiences to an empty list", async () => {
                const [spec] = await loadSingleSpecs([protobufDefinition({ root: "proto" }, { audiences: undefined })]);

                expect((spec as ProtobufSpec).settings?.audiences).toEqual([]);
            });

            it("resolves an array of overrides", async () => {
                await writeFiles({ "o2.yml": "{}" });
                const [spec] = await loadSingleSpecs([
                    protobufDefinition({ root: "proto" }, { overrides: ["overrides.yml", "o2.yml"] })
                ]);

                expect((spec as ProtobufSpec).absoluteFilepathToOverrides).toEqual([
                    abs("overrides.yml"),
                    abs("o2.yml")
                ]);
            });

            it("does not check that protobuf overrides exist", async () => {
                const [spec] = await loadSingleSpecs([
                    protobufDefinition({ root: "proto" }, { overrides: "missing.yml" })
                ]);

                expect((spec as ProtobufSpec).absoluteFilepathToOverrides).toBe(abs("missing.yml"));
            });

            it("uses absolute root and target paths directly when resolved from a git source", async () => {
                const [spec] = await loadSingleSpecs([
                    protobufDefinition(
                        { root: abs("proto"), target: abs("proto/service.proto") },
                        { resolvedAbsolutePath: true }
                    )
                ]);

                expect(spec).toMatchObject({
                    absoluteFilepathToProtobufRoot: abs("proto"),
                    absoluteFilepathToProtobufTarget: abs("proto/service.proto"),
                    relativeFilepathToProtobufRoot: "proto"
                });
            });

            // Absolute protobuf paths that were not resolved from a git source are joined onto the workspace through
            // RelativeFilePath.of, which throws a plain Error instead of returning a failure.
            it.each([
                { name: "root", schema: { root: "/proto" }, resolved: undefined, offending: "/proto" },
                {
                    name: "root with resolvedAbsolutePath=false",
                    schema: { root: "/proto" },
                    resolved: false,
                    offending: "/proto"
                },
                {
                    name: "target",
                    schema: { root: "proto", target: "/proto/service.proto" },
                    resolved: undefined,
                    offending: "/proto/service.proto"
                }
            ])("throws a plain Error for an absolute $name", async ({ schema, resolved, offending }) => {
                await expect(
                    loadSingle([protobufDefinition(schema, { resolvedAbsolutePath: resolved })])
                ).rejects.toThrow(`Filepath is not relative: ${offending}`);
            });

            it("throws a plain Error when a root resolved from a git source is missing, instead of returning FILE_MISSING", async () => {
                await expect(
                    loadSingle([protobufDefinition({ root: "/clone/dir/gone-proto" }, { resolvedAbsolutePath: true })])
                ).rejects.toThrow("Filepath is not relative: /clone/dir/gone-proto");
            });

            it.each([
                {
                    name: "a missing root",
                    definition: () => protobufDefinition({ root: "missing-proto" }),
                    expectedKey: "missing-proto"
                },
                {
                    name: "a missing relative target",
                    definition: () => protobufDefinition({ root: "proto", target: "proto/missing.proto" }),
                    expectedKey: "proto/missing.proto"
                },
                {
                    name: "a missing target resolved from a git source (reported by basename)",
                    definition: () =>
                        protobufDefinition(
                            { root: abs("proto"), target: "/clone/dir/proto/gone.proto" },
                            { resolvedAbsolutePath: true }
                        ),
                    expectedKey: "gone.proto"
                }
            ])("fails with FILE_MISSING for $name", async ({ definition, expectedKey }) => {
                expect(await loadSingle([definition()])).toEqual(fileMissing(expectedKey));
            });

            it("checks the root before the target", async () => {
                const result = await loadSingle([
                    protobufDefinition({ root: "missing-proto", target: "missing.proto" })
                ]);

                expect(result).toEqual(fileMissing("missing-proto"));
            });
        });

        describe("openrpc", () => {
            const openRpcDefinition = (
                schemaPath: string,
                overrides: Partial<generatorsYml.APIDefinitionLocation> = {}
            ): generatorsYml.APIDefinitionLocation => ({
                ...ossDefinition(schemaPath, overrides),
                schema: { type: "openrpc", path: schemaPath }
            });

            it("loads a spec with overrides and namespace", async () => {
                const [spec] = await loadSingleSpecs(
                    [openRpcDefinition("rpc.json", { overrides: ["o1.yml", "o2.yml"] })],
                    "rpc-ns"
                );

                expect(spec).toEqual({
                    type: "openrpc",
                    absoluteFilepath: abs("rpc.json"),
                    absoluteFilepathToOverrides: [abs("o1.yml"), abs("o2.yml")],
                    namespace: "rpc-ns"
                });
            });

            it("does not check that the file or its overrides exist", async () => {
                const [spec] = await loadSingleSpecs([openRpcDefinition("missing.json", { overrides: "missing.yml" })]);

                expect(spec).toEqual({
                    type: "openrpc",
                    absoluteFilepath: abs("missing.json"),
                    absoluteFilepathToOverrides: abs("missing.yml"),
                    namespace: undefined
                });
            });

            it("throws a plain Error for an absolute path instead of returning ABSOLUTE_FILEPATH", async () => {
                await expect(loadSingle([openRpcDefinition("/absolute/rpc.json")])).rejects.toThrow(
                    "Filepath is not relative: /absolute/rpc.json"
                );
            });
        });

        describe("graphql", () => {
            const graphqlDefinition = (
                schemaPath: string,
                examples: string | undefined = undefined,
                overrides: Partial<generatorsYml.APIDefinitionLocation> = {}
            ): generatorsYml.APIDefinitionLocation => ({
                ...ossDefinition(schemaPath, overrides),
                schema: { type: "graphql", path: schemaPath, examples }
            });

            beforeEach(async () => {
                await writeFiles({ "schema.graphql": GRAPHQL_CONTENTS, "examples.json": "[]" });
            });

            it("loads a schema without examples", async () => {
                const [spec] = await loadSingleSpecs([graphqlDefinition("schema.graphql")]);

                expect(spec).toEqual({
                    type: "graphql",
                    absoluteFilepath: abs("schema.graphql"),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToExamples: undefined,
                    namespace: undefined
                });
            });

            it("loads a schema with examples, overrides and a namespace", async () => {
                const [spec] = await loadSingleSpecs(
                    [graphqlDefinition("schema.graphql", "examples.json", { overrides: "o.yml" })],
                    "gql"
                );

                expect(spec).toEqual({
                    type: "graphql",
                    absoluteFilepath: abs("schema.graphql"),
                    absoluteFilepathToOverrides: abs("o.yml"),
                    absoluteFilepathToExamples: abs("examples.json"),
                    namespace: "gql"
                });
            });

            it.each([
                {
                    name: "the schema file is missing",
                    definition: () => graphqlDefinition("missing.graphql", "examples.json"),
                    expectedKey: "missing.graphql"
                },
                {
                    name: "the examples file is missing",
                    definition: () => graphqlDefinition("schema.graphql", "missing-examples.json"),
                    expectedKey: "missing-examples.json"
                }
            ])("fails with FILE_MISSING when $name", async ({ definition, expectedKey }) => {
                expect(await loadSingle([definition()])).toEqual(fileMissing(expectedKey));
            });

            it("does not check that graphql overrides exist", async () => {
                const [spec] = await loadSingleSpecs([
                    graphqlDefinition("schema.graphql", undefined, { overrides: "missing.yml" })
                ]);

                expect(spec).toMatchObject({ absoluteFilepathToOverrides: abs("missing.yml") });
            });
        });

        it("loads a mix of spec types in order", async () => {
            await writeFiles({
                "openapi.yml": OPENAPI_CONTENTS,
                "proto/a.proto": "",
                "schema.graphql": GRAPHQL_CONTENTS
            });
            const specs = await loadSingleSpecs([
                ossDefinition("openapi.yml"),
                protobufDefinition({ root: "proto" }),
                { ...ossDefinition("rpc.json"), schema: { type: "openrpc", path: "rpc.json" } },
                {
                    ...ossDefinition("schema.graphql"),
                    schema: { type: "graphql", path: "schema.graphql", examples: undefined }
                }
            ]);

            expect(specs.map((spec) => spec.type)).toEqual(["openapi", "protobuf", "openrpc", "graphql"]);
        });
    });

    describe("loadAPIWorkspace", () => {
        describe("conjure", () => {
            it("returns a ConjureWorkspace without checking the conjure directory", async () => {
                const result = await loadWorkspaceResult("api:\n  specs:\n    conjure: conjure-defs\n");

                expect(result.didSucceed).toBe(true);
                if (!result.didSucceed) {
                    return;
                }
                expect(result.workspace).toBeInstanceOf(ConjureWorkspace);
                expect(result.workspace.workspaceName).toBe("my-workspace");
                expect(result.workspace.cliVersion).toBe("1.2.3");
                expect(result.workspace.absoluteFilePath).toBe(workspaceDir);
                expect(result.workspace.generatorsConfiguration?.api?.type).toBe("conjure");
                expect(result.workspace.changelog).toBeUndefined();
            });

            it("takes precedence over a definition/ directory", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n" });
                const result = await loadWorkspaceResult("api:\n  specs:\n    conjure: conjure-defs\n");

                expect(result.didSucceed && result.workspace).toBeInstanceOf(ConjureWorkspace);
            });
        });

        describe("single namespace", () => {
            it("loads openapi specs into an OSSWorkspace", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS, "other.yml": OPENAPI_CONTENTS });
                const workspace = await loadOSSWorkspace(
                    "api:\n  specs:\n    - openapi: openapi.yml\n    - openapi: other.yml\n      namespace: null\n"
                );

                expect(workspace.workspaceName).toBe("my-workspace");
                expect(workspace.cliVersion).toBe("1.2.3");
                expect(workspace.absoluteFilePath).toBe(workspaceDir);
                expect(workspace.generatorsConfiguration?.api?.type).toBe("singleNamespace");
                expect(workspace.specs.map((spec) => spec.type)).toEqual(["openapi", "openapi"]);
                expect(workspace.allSpecs).toEqual(workspace.specs);
                expect(workspace.allSpecs.map((spec) => (spec as OpenAPISpec).absoluteFilepath)).toEqual([
                    abs("openapi.yml"),
                    abs("other.yml")
                ]);
                expect(workspace.allSpecs.map((spec) => (spec as OpenAPISpec).namespace)).toEqual([
                    undefined,
                    undefined
                ]);
            });

            it("loads overrides, overlays and an error-responses schema from generators.yml", async () => {
                await writeFiles({
                    "openapi.yml": OPENAPI_CONTENTS,
                    "o1.yml": "{}",
                    "o2.yml": "{}",
                    "overlay.yml": "{}",
                    "errors.yml": "{}"
                });
                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: openapi.yml",
                        "      overrides:",
                        "        - o1.yml",
                        "        - o2.yml",
                        "      overlays: overlay.yml",
                        "      settings:",
                        "        error-responses:",
                        "          schema: errors.yml",
                        ""
                    ].join("\n")
                );

                const [spec] = workspace.allSpecs as OpenAPISpec[];
                expect(spec?.absoluteFilepathToOverrides).toEqual([abs("o1.yml"), abs("o2.yml")]);
                expect(spec?.absoluteFilepathToOverlays).toBe(abs("overlay.yml"));
                expect(spec?.settings?.errorResponses?.schema).toBe(abs("errors.yml"));
            });

            it("loads a single override string", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS, "o1.yml": "{}" });
                const workspace = await loadOSSWorkspace(
                    "api:\n  specs:\n    - openapi: openapi.yml\n      overrides: o1.yml\n"
                );

                expect((workspace.allSpecs[0] as OpenAPISpec).absoluteFilepathToOverrides).toBe(abs("o1.yml"));
            });

            it("loads the deprecated top-level openapi key", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                const workspace = await loadOSSWorkspace("openapi: openapi.yml\n");

                expect(workspace.allSpecs.map((spec) => spec.type)).toEqual(["openapi"]);
            });

            it("loads asyncapi specs as openapi-typed specs with an asyncapi source", async () => {
                await writeFiles({ "asyncapi.yml": "asyncapi: 2.0.0\n" });
                const workspace = await loadOSSWorkspace("api:\n  specs:\n    - asyncapi: asyncapi.yml\n");

                expect(workspace.allSpecs[0]).toMatchObject({
                    type: "openapi",
                    source: { type: "asyncapi", file: abs("asyncapi.yml") }
                });
            });

            it("returns the failure from the single-namespace loader", async () => {
                const result = await loadWorkspaceResult("api:\n  specs:\n    - openapi: missing.yml\n");

                expect(result).toEqual(fileMissing("missing.yml"));
            });

            it("returns the ABSOLUTE_FILEPATH failure for a user-specified absolute path", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                const absolutePath = abs("openapi.yml");
                const result = await loadWorkspaceResult(`api:\n  specs:\n    - openapi: ${absolutePath}\n`);

                expect(result).toEqual({
                    didSucceed: false,
                    failures: {
                        "generators.yml": { type: WorkspaceLoaderFailureType.ABSOLUTE_FILEPATH, filepath: absolutePath }
                    }
                });
            });

            it("resolves git sources before loading, treating the clone path as absolute", async () => {
                const cloneDir = path.join(tmpDir, "clone");
                await mkdir(path.join(cloneDir, "specs"), { recursive: true });
                await writeFile(path.join(cloneDir, "specs", "remote.yml"), OPENAPI_CONTENTS);
                vi.mocked(Github.cloneRepositoryAtRef).mockResolvedValue(cloneDir);

                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi:",
                        "        git:",
                        "          repo: https://github.com/org/specs.git",
                        "          ref: main",
                        "          path: specs/remote.yml",
                        ""
                    ].join("\n")
                );

                expect(Github.cloneRepositoryAtRef).toHaveBeenCalledWith({
                    repositoryUrl: "https://github.com/org/specs.git",
                    ref: "main"
                });
                expect((workspace.allSpecs[0] as OpenAPISpec).absoluteFilepath).toContain(
                    path.join("clone", "specs", "remote.yml")
                );
            });

            it("accepts a legacy string api configuration", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                const workspace = await loadOSSWorkspace("api: openapi.yml\n");

                expect(workspace.allSpecs.map((spec) => spec.type)).toEqual(["openapi"]);
            });
        });

        describe("spec filtering", () => {
            it("omits openrpc and non-fromOpenAPI protobuf specs from `specs` but keeps them in `allSpecs`", async () => {
                await writeFiles({
                    "openapi.yml": OPENAPI_CONTENTS,
                    "rpc.json": "{}",
                    "proto/a.proto": ""
                });
                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: openapi.yml",
                        "    - openrpc: rpc.json",
                        "    - proto:",
                        "        root: proto",
                        ""
                    ].join("\n")
                );

                expect(workspace.specs.map((spec) => spec.type)).toEqual(["openapi"]);
                expect(workspace.allSpecs.map((spec) => spec.type)).toEqual(["openapi", "openrpc", "protobuf"]);
            });

            it("keeps fromOpenAPI protobuf specs in `specs` but removes them from `allSpecs`", async () => {
                await writeFiles({
                    "openapi.yml": OPENAPI_CONTENTS,
                    "proto/a.proto": ""
                });
                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: openapi.yml",
                        "    - proto:",
                        "        root: proto",
                        "        from-openapi: true",
                        ""
                    ].join("\n")
                );

                expect(workspace.specs.map((spec) => spec.type)).toEqual(["openapi", "protobuf"]);
                expect(workspace.allSpecs.map((spec) => spec.type)).toEqual(["openapi"]);
            });

            it("treats from-openapi false and true protobuf specs independently", async () => {
                await writeFiles({ "proto-a/a.proto": "", "proto-b/b.proto": "" });
                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - proto:",
                        "        root: proto-a",
                        "    - proto:",
                        "        root: proto-b",
                        "        from-openapi: true",
                        ""
                    ].join("\n")
                );

                expect(workspace.specs.map((spec) => (spec as ProtobufSpec).relativeFilepathToProtobufRoot)).toEqual([
                    "proto-b"
                ]);
                expect(workspace.allSpecs.map((spec) => (spec as ProtobufSpec).relativeFilepathToProtobufRoot)).toEqual(
                    ["proto-a"]
                );
            });

            it("keeps graphql specs in both `specs` and `allSpecs`", async () => {
                await writeFiles({ "schema.graphql": GRAPHQL_CONTENTS });
                const workspace = await loadOSSWorkspace("api:\n  specs:\n    - graphql: schema.graphql\n");

                expect(workspace.specs.map((spec) => spec.type)).toEqual(["graphql"]);
                expect(workspace.allSpecs.map((spec) => spec.type)).toEqual(["graphql"]);
            });

            it("returns the failure when a graphql schema is missing", async () => {
                const result = await loadWorkspaceResult("api:\n  specs:\n    - graphql: missing.graphql\n");

                expect(result).toEqual(fileMissing("missing.graphql"));
            });

            it("returns the failure when a graphql examples file is missing", async () => {
                await writeFiles({ "schema.graphql": GRAPHQL_CONTENTS });
                const result = await loadWorkspaceResult(
                    "api:\n  specs:\n    - graphql: schema.graphql\n      examples: missing-examples.json\n"
                );

                expect(result).toEqual(fileMissing("missing-examples.json"));
            });
        });

        describe("multiple namespaces", () => {
            it("loads namespaced specs followed by root specs", async () => {
                await writeFiles({
                    "a.yml": OPENAPI_CONTENTS,
                    "b.yml": OPENAPI_CONTENTS,
                    "root.yml": OPENAPI_CONTENTS
                });
                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: root.yml",
                        "    - openapi: a.yml",
                        "      namespace: alpha",
                        "    - openapi: b.yml",
                        "      namespace: beta",
                        ""
                    ].join("\n")
                );

                expect(workspace.generatorsConfiguration?.api?.type).toBe("multiNamespace");
                expect(
                    workspace.allSpecs.map((spec) => [
                        path.basename((spec as OpenAPISpec).absoluteFilepath),
                        (spec as OpenAPISpec).namespace
                    ])
                ).toEqual([
                    ["a.yml", "alpha"],
                    ["b.yml", "beta"],
                    ["root.yml", undefined]
                ]);
            });

            it("groups several specs under the same namespace", async () => {
                await writeFiles({ "a.yml": OPENAPI_CONTENTS, "b.yml": OPENAPI_CONTENTS });
                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: a.yml",
                        "      namespace: alpha",
                        "    - openapi: b.yml",
                        "      namespace: alpha",
                        ""
                    ].join("\n")
                );

                expect(workspace.allSpecs.map((spec) => (spec as OpenAPISpec).namespace)).toEqual(["alpha", "alpha"]);
            });

            it("loads a multi-namespace configuration that has no root definitions (empty rootDefinitions list)", async () => {
                await writeFiles({ "a.yml": OPENAPI_CONTENTS });
                const workspace = await loadOSSWorkspace(
                    "api:\n  specs:\n    - openapi: a.yml\n      namespace: alpha\n"
                );

                expect(workspace.allSpecs).toHaveLength(1);
            });

            it("loads the deprecated `namespaces` configuration, which has undefined rootDefinitions", async () => {
                await writeFiles({ "a.yml": OPENAPI_CONTENTS, "b.yml": OPENAPI_CONTENTS });
                const result = await loadWorkspaceResult(
                    "api:\n  namespaces:\n    alpha: a.yml\n    beta:\n      path: b.yml\n"
                );

                expect(result.didSucceed).toBe(true);
                if (!result.didSucceed || !(result.workspace instanceof OSSWorkspace)) {
                    throw new Error("Expected an OSSWorkspace");
                }
                const api = result.workspace.generatorsConfiguration?.api;
                expect(api?.type === "multiNamespace" && api.rootDefinitions).toBeUndefined();
                expect(result.workspace.allSpecs.map((spec) => (spec as OpenAPISpec).namespace)).toEqual([
                    "alpha",
                    "beta"
                ]);
            });

            it("uses the `name` of a graphql spec as its namespace", async () => {
                await writeFiles({ "schema.graphql": GRAPHQL_CONTENTS });
                const workspace = await loadOSSWorkspace(
                    "api:\n  specs:\n    - graphql: schema.graphql\n      name: gql-ns\n"
                );

                expect(workspace.allSpecs.map((spec) => spec.type === "graphql" && spec.namespace)).toEqual(["gql-ns"]);
            });

            it("returns the failure from a namespace", async () => {
                await writeFiles({ "a.yml": OPENAPI_CONTENTS });
                const result = await loadWorkspaceResult(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: a.yml",
                        "      namespace: alpha",
                        "    - openapi: missing.yml",
                        "      namespace: beta",
                        ""
                    ].join("\n")
                );

                expect(result).toEqual(fileMissing("missing.yml"));
            });

            it("returns the failure from the root definitions after the namespaces succeeded", async () => {
                await writeFiles({ "a.yml": OPENAPI_CONTENTS });
                const result = await loadWorkspaceResult(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: a.yml",
                        "      namespace: alpha",
                        "    - openapi: missing-root.yml",
                        ""
                    ].join("\n")
                );

                expect(result).toEqual(fileMissing("missing-root.yml"));
            });

            it("reports the first failing namespace in declaration order", async () => {
                const result = await loadWorkspaceResult(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi: missing-alpha.yml",
                        "      namespace: alpha",
                        "    - openapi: missing-beta.yml",
                        "      namespace: beta",
                        ""
                    ].join("\n")
                );

                expect(result).toEqual(fileMissing("missing-alpha.yml"));
            });

            it("resolves git sources in namespaced and root definitions", async () => {
                const cloneDir = path.join(tmpDir, "clone");
                await mkdir(cloneDir, { recursive: true });
                await writeFile(path.join(cloneDir, "ns.yml"), OPENAPI_CONTENTS);
                await writeFile(path.join(cloneDir, "root.yml"), OPENAPI_CONTENTS);
                vi.mocked(Github.cloneRepositoryAtRef).mockResolvedValue(cloneDir);

                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - openapi:",
                        "        git:",
                        "          repo: https://github.com/org/specs.git",
                        "          path: ns.yml",
                        "      namespace: alpha",
                        "    - openapi:",
                        "        git:",
                        "          repo: https://github.com/org/specs.git",
                        "          path: root.yml",
                        ""
                    ].join("\n")
                );

                expect(Github.cloneRepositoryAtRef).toHaveBeenCalledTimes(2);
                expect(workspace.allSpecs.map((spec) => path.basename((spec as OpenAPISpec).absoluteFilepath))).toEqual(
                    ["ns.yml", "root.yml"]
                );
            });
        });

        describe("protobuf resolved from a git source", () => {
            it("uses the cloned absolute root and target and reports the basename of the root", async () => {
                const cloneDir = path.join(tmpDir, "clone");
                await mkdir(path.join(cloneDir, "proto"), { recursive: true });
                await writeFile(path.join(cloneDir, "proto", "service.proto"), "");
                vi.mocked(Github.cloneRepositoryAtRef).mockResolvedValue(cloneDir);

                const workspace = await loadOSSWorkspace(
                    [
                        "api:",
                        "  specs:",
                        "    - proto:",
                        "        root:",
                        "          git:",
                        "            repo: https://github.com/org/protos.git",
                        "            path: proto",
                        "        target: proto/service.proto",
                        ""
                    ].join("\n")
                );

                const [spec] = workspace.allSpecs as ProtobufSpec[];
                expect(spec?.absoluteFilepathToProtobufRoot).toContain(path.join("clone", "proto"));
                expect(spec?.absoluteFilepathToProtobufTarget).toContain(path.join("clone", "proto", "service.proto"));
                expect(spec?.relativeFilepathToProtobufRoot).toBe("proto");
            });
        });

        describe("lenient flag", () => {
            const GENERATORS_WITH_UNKNOWN_KEY = "api:\n  specs:\n    - openapi: openapi.yml\nsome-unknown-key: true\n";

            it("rejects unrecognized keys by default", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                await expect(loadWorkspaceResult(GENERATORS_WITH_UNKNOWN_KEY)).rejects.toThrow(/some-unknown-key/);
            });

            it("tolerates unrecognized keys when lenient is true", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                const result = await loadWorkspaceResult(GENERATORS_WITH_UNKNOWN_KEY, { lenient: true });

                expect(result.didSucceed).toBe(true);
            });

            it("rejects unrecognized keys when lenient is explicitly false", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                await expect(loadWorkspaceResult(GENERATORS_WITH_UNKNOWN_KEY, { lenient: false })).rejects.toThrow(
                    /some-unknown-key/
                );
            });
        });

        describe("changelog", () => {
            it("loads markdown files from the changelog directory onto the workspace", async () => {
                await writeFiles({
                    "openapi.yml": OPENAPI_CONTENTS,
                    "changelog/2024-01-01.md": "# Release",
                    "changelog/ignored.txt": "not markdown"
                });
                const workspace = await loadOSSWorkspace("api:\n  specs:\n    - openapi: openapi.yml\n");

                expect(workspace.changelog?.files).toEqual([
                    { absoluteFilepath: abs("changelog/2024-01-01.md"), contents: "# Release" }
                ]);
            });

            it("has no changelog when there is no changelog directory", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                const workspace = await loadOSSWorkspace("api:\n  specs:\n    - openapi: openapi.yml\n");

                expect(workspace.changelog).toBeUndefined();
            });

            it("swallows a failure to read the changelog and continues without one", async () => {
                // A directory named *.md makes readFile fail with EISDIR while listing changelog files.
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS });
                await mkdir(path.join(workspaceDir, "changelog", "broken.md"), { recursive: true });
                const workspace = await loadOSSWorkspace("api:\n  specs:\n    - openapi: openapi.yml\n");

                expect(workspace.changelog).toBeUndefined();
            });

            it("passes the changelog to a LazyFernWorkspace", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n", "changelog/entry.md": "hello" });
                const result = await loadWorkspaceResult(undefined);

                expect(result.didSucceed && result.workspace.changelog?.files).toHaveLength(1);
            });
        });

        describe("definition/ directory", () => {
            it("returns a LazyFernWorkspace when there is no generators.yml", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n" });
                const result = await loadWorkspaceResult(undefined);

                expect(result.didSucceed).toBe(true);
                if (!result.didSucceed) {
                    return;
                }
                expect(result.workspace).toBeInstanceOf(LazyFernWorkspace);
                expect(result.workspace.workspaceName).toBe("my-workspace");
                expect(result.workspace.cliVersion).toBe("1.2.3");
                expect(result.workspace.absoluteFilePath).toBe(workspaceDir);
                expect(result.workspace.generatorsConfiguration).toBeUndefined();
            });

            it("returns a LazyFernWorkspace carrying the generators configuration when there is no api section", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n" });
                const result = await loadWorkspaceResult("default-group: local\n");

                expect(result.didSucceed && result.workspace).toBeInstanceOf(LazyFernWorkspace);
                expect(result.didSucceed && result.workspace.generatorsConfiguration?.defaultGroup).toBe("local");
            });

            it("falls back to the definition/ directory when the api section has no specs", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n" });
                const result = await loadWorkspaceResult("api:\n  specs: []\n");

                expect(result.didSucceed && result.workspace).toBeInstanceOf(LazyFernWorkspace);
            });

            it("prefers api specs over a definition/ directory", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n", "openapi.yml": OPENAPI_CONTENTS });
                const result = await loadWorkspaceResult("api:\n  specs:\n    - openapi: openapi.yml\n");

                expect(result.didSucceed && result.workspace).toBeInstanceOf(OSSWorkspace);
            });

            it("returns the spec failure instead of falling back to an existing definition/ directory", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n" });
                const result = await loadWorkspaceResult("api:\n  specs:\n    - openapi: missing.yml\n");

                expect(result).toEqual(fileMissing("missing.yml"));
            });

            it("treats an empty definition/ directory as a Fern definition", async () => {
                await mkdir(path.join(workspaceDir, "definition"));
                const result = await loadWorkspaceResult(undefined);

                expect(result.didSucceed && result.workspace).toBeInstanceOf(LazyFernWorkspace);
            });

            it("treats a plain file named definition as a Fern definition", async () => {
                await writeFiles({ definition: "not a directory" });
                const result = await loadWorkspaceResult(undefined);

                expect(result.didSucceed && result.workspace).toBeInstanceOf(LazyFernWorkspace);
            });
        });

        describe("MISCONFIGURED_DIRECTORY", () => {
            async function loadMisconfigured(
                generatorsYmlContents: string | undefined
            ): Promise<{ result: WorkspaceLoader.Result; logger: ReturnType<typeof createMockLogger> }> {
                const logger = createMockLogger();
                const result = await loadWorkspaceResult(generatorsYmlContents, {
                    context: createMockTaskContext({ logger })
                });
                return { result, logger };
            }

            const API_SECTION_HINT =
                'generators.yml has an "api" section but no valid API specs could be resolved from it. No "definition/" directory was found.';

            it.each([
                {
                    name: "there is no generators.yml",
                    generatorsYml: undefined,
                    hint: 'No generators.yml was found. No "definition/" directory was found.'
                },
                // A generators.yml without an api section still yields an (empty, single-namespace) api configuration,
                // so the "does not contain an api section" hint cannot be reached through a real generators.yml.
                { name: "generators.yml is an empty object", generatorsYml: "{}\n", hint: API_SECTION_HINT },
                {
                    name: "generators.yml only has groups",
                    generatorsYml: "default-group: local\n",
                    hint: API_SECTION_HINT
                },
                {
                    name: "the api section has an empty specs list",
                    generatorsYml: "api:\n  specs: []\n",
                    hint: API_SECTION_HINT
                }
            ])("fails with the diagnostic when $name and there is no definition/ directory", async (testCase) => {
                const { result, logger } = await loadMisconfigured(testCase.generatorsYml);

                expect(result).toEqual(MISCONFIGURED_FAILURE);
                expect(logger.debug).toHaveBeenCalledTimes(1);
                expect(logger.debug).toHaveBeenCalledWith(`Workspace diagnostic: ${testCase.hint}`);
            });

            it("reports a missing api section when the generators configuration has none", async () => {
                // loadGeneratorsConfiguration is stubbed because it always produces an api configuration today.
                vi.mocked(loadGeneratorsConfiguration).mockResolvedValueOnce({
                    absolutePathToConfiguration: abs("generators.yml"),
                    api: undefined,
                    rawConfiguration: {},
                    groups: [],
                    groupAliases: {},
                    defaultGroup: undefined,
                    reviewers: undefined,
                    whitelabel: undefined,
                    ai: undefined,
                    replay: undefined
                } as unknown as generatorsYml.GeneratorsConfiguration);
                const { result, logger } = await loadMisconfigured(undefined);

                expect(result).toEqual(MISCONFIGURED_FAILURE);
                expect(logger.debug).toHaveBeenCalledWith(
                    'Workspace diagnostic: generators.yml was found but does not contain an "api" section. No "definition/" directory was found.'
                );
            });

            it("warns about an empty API definition naming the workspace folder", async () => {
                const { result, logger } = await loadMisconfigured(undefined);

                expect(result.didSucceed).toBe(false);
                expect(loggedMessages(logger.warn)).toEqual([
                    "Detected empty API definition: my-api. Remove to resolve error."
                ]);
            });

            it("does not warn or log a diagnostic when a definition/ directory exists", async () => {
                await writeFiles({ "definition/api.yml": "name: api\n" });
                const { result, logger } = await loadMisconfigured(undefined);

                expect(result.didSucceed).toBe(true);
                expect(logger.warn).not.toHaveBeenCalled();
                expect(
                    loggedMessages(logger.debug).filter((message) => message.includes("Workspace diagnostic"))
                ).toEqual([]);
            });

            it("does not warn or log a diagnostic when specs fail to load", async () => {
                const { result, logger } = await loadMisconfigured("api:\n  specs:\n    - openapi: missing.yml\n");

                expect(result.didSucceed).toBe(false);
                expect(logger.warn).not.toHaveBeenCalled();
                expect(logger.debug).not.toHaveBeenCalled();
            });

            it("uses the last path segment of the workspace for the warning", async () => {
                const nested = AbsoluteFilePath.of(path.join(tmpDir, "apis", "payments"));
                await mkdir(nested, { recursive: true });
                const logger = createMockLogger();

                await loadAPIWorkspace({
                    absolutePathToWorkspace: nested,
                    context: createMockTaskContext({ logger }),
                    cliVersion: "0.0.0",
                    workspaceName: undefined
                });

                expect(logger.warn).toHaveBeenCalledWith(
                    "Detected empty API definition: payments. Remove to resolve error."
                );
            });
        });

        describe("generators.yml loading errors", () => {
            it("logs and aborts when generators.yml has a YAML syntax error", async () => {
                const logger = createMockLogger();
                await expect(
                    loadWorkspaceResult("api: [\n", { context: createMockTaskContext({ logger }) })
                ).rejects.toBeInstanceOf(TaskAbortSignal);
                expect(loggedMessages(logger.error)[0]).toContain("generators.yml: unexpected end of the stream");
            });

            it("throws a ConfigError for an unrecognized spec type", async () => {
                const error = await loadWorkspaceResult("api:\n  specs:\n    - bogus: thing\n").catch(
                    (e: unknown) => e
                );

                expect(error).toBeInstanceOf(CliError);
                expect((error as CliError).code).toBe(CliError.Code.ConfigError);
                expect((error as CliError).message).toContain('Unexpected key "bogus"');
            });

            it("throws a ConfigError when generators.yml and generators.legacy.yml both exist", async () => {
                await writeFiles({ "generators.yml": "{}\n", "generators.legacy.yml": "{}\n" });
                const error = await loadWorkspaceResult(undefined).catch((e: unknown) => e);

                expect(error).toBeInstanceOf(CliError);
                expect((error as CliError).message).toContain("Found both generators.yml and generators.legacy.yml");
            });

            it("reads generators.yaml when generators.yml is absent", async () => {
                await writeFiles({ "openapi.yml": OPENAPI_CONTENTS, "generators.yaml": "openapi: openapi.yml\n" });
                const result = await loadWorkspaceResult(undefined);

                expect(result.didSucceed && result.workspace).toBeInstanceOf(OSSWorkspace);
            });
        });
    });
});
