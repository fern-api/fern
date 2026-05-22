import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, join, RelativeFilePath, relativePathForDisplay } from "@fern-api/fs-utils";
import { WorkspaceLoaderFailureType } from "@fern-api/lazy-fern-workspace";
import { Logger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import assert from "assert";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";

import { handleFailedWorkspaceParserResult } from "../handleFailedWorkspaceParserResult.js";
import { loadAPIWorkspace, loadSingleNamespaceAPIWorkspace } from "../loadAPIWorkspace.js";

function createCapturingLogger(): Logger & { errors: string[]; debugs: string[] } {
    const errors: string[] = [];
    const debugs: string[] = [];
    return {
        errors,
        debugs,
        disable: () => {
            // noop
        },
        enable: () => {
            // noop
        },
        trace: () => {
            // noop
        },
        debug: (...args: string[]) => {
            debugs.push(args.join(" "));
        },
        info: () => {
            // noop
        },
        warn: () => {
            // noop
        },
        error: (...args: string[]) => {
            errors.push(args.join(" "));
        },
        log: () => {
            // noop
        }
    };
}

describe("loadWorkspace", () => {
    it("fern definition", async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/simple")),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);

        const definition = await workspace.workspace.getDefinition({ context });

        const simpleYaml = definition.namedDefinitionFiles[RelativeFilePath.of("simple.yml")];
        const exampleDateTime = (simpleYaml?.contents.types?.MyDateTime as RawSchemas.BaseTypeDeclarationSchema)
            .examples?.[0]?.value;
        expect(typeof exampleDateTime).toBe("string");
    });

    it("open api", async () => {
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures")),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        expect(workspace.didSucceed).toBe(true);
        assert(workspace.didSucceed);
    });

    it("open api with absolute spec path", async () => {
        const absolutePathToFixtures = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
        const absolutePathToOpenApi = join(absolutePathToFixtures, RelativeFilePath.of("openapi.yml"));

        const specs = await loadSingleNamespaceAPIWorkspace({
            absolutePathToWorkspace: absolutePathToFixtures,
            namespace: undefined,
            definitions: [
                {
                    schema: {
                        type: "oss",
                        path: absolutePathToOpenApi
                    },
                    origin: undefined,
                    overrides: undefined,
                    overlays: undefined,
                    audiences: [],
                    settings: undefined
                }
            ]
        });

        expect(Array.isArray(specs)).toBe(true);
        assert(Array.isArray(specs));
        const spec = specs[0];
        assert(spec != null);
        expect(spec.type).toBe("openapi");
        assert(spec.type === "openapi");
        expect(spec.absoluteFilepath).toBe(absolutePathToOpenApi);
    });

    it("open api with absolute override and overlay paths", async () => {
        const absolutePathToFixtures = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
        const absolutePathToOpenApi = join(absolutePathToFixtures, RelativeFilePath.of("openapi.yml"));

        const specs = await loadSingleNamespaceAPIWorkspace({
            absolutePathToWorkspace: absolutePathToFixtures,
            namespace: undefined,
            definitions: [
                {
                    schema: {
                        type: "oss",
                        path: "openapi.yml"
                    },
                    origin: undefined,
                    overrides: absolutePathToOpenApi,
                    overlays: absolutePathToOpenApi,
                    audiences: [],
                    settings: undefined
                }
            ]
        });

        expect(Array.isArray(specs)).toBe(true);
        assert(Array.isArray(specs));
        const spec = specs[0];
        assert(spec != null);
        expect(spec.type).toBe("openapi");
        assert(spec.type === "openapi");
        expect(spec.absoluteFilepathToOverrides).toBe(absolutePathToOpenApi);
        expect(spec.absoluteFilepathToOverlays).toBe(absolutePathToOpenApi);
    });

    it("open rpc with absolute spec path", async () => {
        const absolutePathToFixtures = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
        const absolutePathToOpenRpc = join(absolutePathToFixtures, RelativeFilePath.of("openapi.yml"));

        const specs = await loadSingleNamespaceAPIWorkspace({
            absolutePathToWorkspace: absolutePathToFixtures,
            namespace: undefined,
            definitions: [
                {
                    schema: {
                        type: "openrpc",
                        path: absolutePathToOpenRpc
                    },
                    origin: undefined,
                    overrides: undefined,
                    overlays: undefined,
                    audiences: [],
                    settings: undefined
                }
            ]
        });

        expect(Array.isArray(specs)).toBe(true);
        assert(Array.isArray(specs));
        const spec = specs[0];
        assert(spec != null);
        expect(spec.type).toBe("openrpc");
        assert(spec.type === "openrpc");
        expect(spec.absoluteFilepath).toBe(absolutePathToOpenRpc);
    });

    it("graphql with absolute schema and examples paths", async () => {
        const absolutePathToFixtures = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
        const absolutePathToGraphQL = join(absolutePathToFixtures, RelativeFilePath.of("openapi.yml"));

        const specs = await loadSingleNamespaceAPIWorkspace({
            absolutePathToWorkspace: absolutePathToFixtures,
            namespace: undefined,
            definitions: [
                {
                    schema: {
                        type: "graphql",
                        path: absolutePathToGraphQL,
                        examples: absolutePathToGraphQL
                    },
                    origin: undefined,
                    overrides: undefined,
                    overlays: undefined,
                    audiences: [],
                    settings: undefined
                }
            ]
        });

        expect(Array.isArray(specs)).toBe(true);
        assert(Array.isArray(specs));
        const spec = specs[0];
        assert(spec != null);
        expect(spec.type).toBe("graphql");
        assert(spec.type === "graphql");
        expect(spec.absoluteFilepath).toBe(absolutePathToGraphQL);
        expect(spec.absoluteFilepathToExamples).toBe(absolutePathToGraphQL);
    });

    it("protobuf with absolute root and target paths", async () => {
        const absolutePathToFixtures = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
        const absolutePathToProtobufRoot = AbsoluteFilePath.of(await mkdtemp(pathJoin(tmpdir(), "fern-proto-root-")));
        const absolutePathToProtobufTarget = AbsoluteFilePath.of(pathJoin(absolutePathToProtobufRoot, "service.proto"));
        await writeFile(absolutePathToProtobufTarget, 'syntax = "proto3";\n');

        const specs = await loadSingleNamespaceAPIWorkspace({
            absolutePathToWorkspace: absolutePathToFixtures,
            namespace: undefined,
            definitions: [
                {
                    schema: {
                        type: "protobuf",
                        root: absolutePathToProtobufRoot,
                        target: absolutePathToProtobufTarget,
                        dependencies: [],
                        localGeneration: true,
                        fromOpenAPI: false
                    },
                    origin: undefined,
                    overrides: undefined,
                    overlays: undefined,
                    audiences: [],
                    settings: undefined
                }
            ]
        });

        expect(Array.isArray(specs)).toBe(true);
        assert(Array.isArray(specs));
        const spec = specs[0];
        assert(spec != null);
        expect(spec.type).toBe("protobuf");
        assert(spec.type === "protobuf");
        expect(spec.absoluteFilepathToProtobufRoot).toBe(absolutePathToProtobufRoot);
        expect(spec.absoluteFilepathToProtobufTarget).toBe(absolutePathToProtobufTarget);
        expect(spec.relativeFilepathToProtobufRoot).toBe(
            relativePathForDisplay(absolutePathToFixtures, absolutePathToProtobufRoot)
        );
    });
});

describe("loadWorkspace MISCONFIGURED_DIRECTORY", () => {
    it("returns MISCONFIGURED_DIRECTORY when generators.yml has no api section and no definition/ dir", async () => {
        const capturingLogger = createCapturingLogger();
        const context = createMockTaskContext({ logger: capturingLogger });
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/generators-no-api-section")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        expect(result.didSucceed).toBe(false);
        assert(!result.didSucceed);

        const failures = Object.values(result.failures);
        expect(failures).toHaveLength(1);
        expect(failures[0]?.type).toBe(WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY);

        // Verify debug diagnostics were logged
        const debugMsg = capturingLogger.debugs.find((d) => d.includes("Workspace diagnostic"));
        expect(debugMsg).toBeDefined();
        expect(debugMsg).toContain("generators.yml");
        expect(debugMsg).toContain("definition/");
    });

    it("returns MISCONFIGURED_DIRECTORY when generators.yml is empty and no definition/ dir", async () => {
        const capturingLogger = createCapturingLogger();
        const context = createMockTaskContext({ logger: capturingLogger });
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/no-api-definition")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        expect(result.didSucceed).toBe(false);
        assert(!result.didSucceed);

        const failures = Object.values(result.failures);
        expect(failures).toHaveLength(1);
        expect(failures[0]?.type).toBe(WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY);

        // Verify debug diagnostics were logged
        const debugMsg = capturingLogger.debugs.find((d) => d.includes("Workspace diagnostic"));
        expect(debugMsg).toBeDefined();
        expect(debugMsg).toContain("generators.yml");
        expect(debugMsg).toContain("definition/");
    });

    it("handleFailedWorkspaceParserResult logs actionable error for MISCONFIGURED_DIRECTORY", () => {
        const capturingLogger = createCapturingLogger();
        handleFailedWorkspaceParserResult(
            {
                didSucceed: false,
                failures: {
                    [RelativeFilePath.of("openapi")]: {
                        type: WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY
                    }
                }
            },
            capturingLogger
        );

        expect(capturingLogger.errors).toHaveLength(1);
        const errorMsg = capturingLogger.errors[0];
        expect(errorMsg).toBeDefined();
        expect(errorMsg).toContain("No API definition found");
        expect(errorMsg).toContain("api section in generators.yml");
        expect(errorMsg).toContain("definition/ directory");
        expect(errorMsg).toContain("buildwithfern.com");
        // Should NOT contain the old generic message
        expect(errorMsg).not.toContain("Misconfigured fern directory");
    });
});
