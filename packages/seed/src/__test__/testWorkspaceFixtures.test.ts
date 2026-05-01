import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { TestRunner } from "../commands/test/test-runner/index.js";
import { testGenerator } from "../commands/test/testWorkspaceFixtures.js";
import { BaselineConfiguration, FixtureConfigurations } from "../config/api/index.js";
import { GeneratorWorkspace } from "../loadGeneratorWorkspaces.js";

interface RunCall {
    fixture: string;
    isBaseline: boolean;
    outputFolder: string | undefined;
    disableDynamicSnippetTests: boolean | undefined;
    customConfig: unknown;
}

class RecordingRunner {
    public calls: RunCall[] = [];

    public async build(): Promise<void> {}
    public async cleanup(): Promise<void> {}

    public async run(args: TestRunner.RunArgs): Promise<TestRunner.TestResult> {
        this.calls.push({
            fixture: args.fixture,
            isBaseline: args.isBaseline === true,
            outputFolder: args.configuration?.outputFolder,
            disableDynamicSnippetTests: args.configuration?.disableDynamicSnippetTests,
            customConfig: args.configuration?.customConfig
        });
        return {
            type: "success",
            id: args.fixture,
            outputFolder: args.isBaseline === true ? "baseline" : (args.configuration?.outputFolder ?? ""),
            metrics: {}
        };
    }
}

const makeGenerator = ({
    fixtures,
    baselineConfigurations
}: {
    fixtures?: Record<string, FixtureConfigurations[]>;
    baselineConfigurations?: Record<string, BaselineConfiguration>;
} = {}): GeneratorWorkspace => ({
    workspaceName: "csharp-sdk",
    absolutePathToWorkspace: AbsoluteFilePath.of("/seed/csharp-sdk"),
    workspaceConfig: {
        image: "test",
        displayName: "csharp-sdk",
        irVersion: "1.0.0",
        test: {} as never,
        publish: {} as never,
        defaultOutputMode: "github",
        generatorType: "SDK",
        fixtures,
        baselineConfigurations
    }
});

describe("testGenerator", () => {
    it("runs baseline exactly once when input lists multiple variants of the same fixture (B-2)", async () => {
        const runner = new RecordingRunner();
        const generator = makeGenerator({
            fixtures: {
                examples: [
                    { outputFolder: "omit-fern-headers", customConfig: { omit: true } },
                    { outputFolder: "client-filename", customConfig: { filename: "x" } }
                ]
            }
        });

        await testGenerator({
            runner: runner as unknown as TestRunner,
            generator,
            fixtures: ["examples:omit-fern-headers", "examples:client-filename"],
            inspect: false
        });

        const baselineCalls = runner.calls.filter((c) => c.isBaseline);
        expect(baselineCalls).toHaveLength(1);
        expect(baselineCalls[0]?.fixture).toBe("examples");

        const variantOutputFolders = runner.calls.filter((c) => !c.isBaseline).map((c) => c.outputFolder);
        expect(variantOutputFolders.sort()).toEqual(["client-filename", "omit-fern-headers"]);
    });

    it("threads baselineConfigurations into the baseline run (B-1)", async () => {
        const runner = new RecordingRunner();
        const generator = makeGenerator({
            fixtures: {
                "csharp-grpc-proto": [{ outputFolder: "package-id", customConfig: { "package-id": "Seed.Client" } }]
            },
            baselineConfigurations: {
                "csharp-grpc-proto": { disableDynamicSnippetTests: true }
            }
        });

        await testGenerator({
            runner: runner as unknown as TestRunner,
            generator,
            fixtures: ["csharp-grpc-proto"],
            inspect: false
        });

        const baselineCall = runner.calls.find((c) => c.isBaseline);
        expect(baselineCall).toBeDefined();
        expect(baselineCall?.disableDynamicSnippetTests).toBe(true);
    });

    it("passes undefined configuration when no baselineConfigurations entry exists", async () => {
        const runner = new RecordingRunner();
        const generator = makeGenerator({
            fixtures: { simple: [{ outputFolder: "v1", customConfig: { x: 1 } }] }
        });

        await testGenerator({
            runner: runner as unknown as TestRunner,
            generator,
            fixtures: ["simple"],
            inspect: false
        });

        const baselineCall = runner.calls.find((c) => c.isBaseline);
        expect(baselineCall).toBeDefined();
        expect(baselineCall?.disableDynamicSnippetTests).toBeUndefined();
        expect(baselineCall?.customConfig).toBeUndefined();
    });

    it("runs all variants when input lists fixture without :variant suffix even alongside :variant input", async () => {
        const runner = new RecordingRunner();
        const generator = makeGenerator({
            fixtures: {
                examples: [
                    { outputFolder: "a", customConfig: {} },
                    { outputFolder: "b", customConfig: {} },
                    { outputFolder: "c", customConfig: {} }
                ]
            }
        });

        await testGenerator({
            runner: runner as unknown as TestRunner,
            generator,
            fixtures: ["examples:a", "examples"],
            inspect: false
        });

        const baselineCalls = runner.calls.filter((c) => c.isBaseline);
        expect(baselineCalls).toHaveLength(1);

        const variantFolders = runner.calls.filter((c) => !c.isBaseline).map((c) => c.outputFolder);
        expect(variantFolders.sort()).toEqual(["a", "b", "c"]);
    });
});
