import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { WorkspaceLoaderFailureType } from "@fern-api/lazy-fern-workspace";
import { Logger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import assert from "assert";

import { handleFailedWorkspaceParserResult } from "../handleFailedWorkspaceParserResult.js";
import { loadAPIWorkspace } from "../loadAPIWorkspace.js";

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
