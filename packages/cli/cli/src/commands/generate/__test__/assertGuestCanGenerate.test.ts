import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { findGuestIncompatibleGenerators } from "../assertGuestCanGenerate.js";
import type { GenerationTelemetryInput } from "../buildGeneratePosthogProperties.js";

function createGenerator(name: string, outputMode: FernFiddle.remoteGen.OutputMode): generatorsYml.GeneratorInvocation {
    return {
        name,
        version: "1.0.0",
        language: undefined,
        config: undefined,
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        outputMode,
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: undefined,
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };
}

const download = createGenerator("fernapi/fern-python-sdk", FernFiddle.remoteGen.OutputMode.downloadFiles({}));
const github = createGenerator("fernapi/fern-typescript-sdk", {
    type: "github"
} as unknown as FernFiddle.remoteGen.OutputMode);
const publish = createGenerator("fernapi/fern-go-sdk", {
    type: "publishV2"
} as unknown as FernFiddle.remoteGen.OutputMode);

function legacyGeneration(generators: generatorsYml.GeneratorInvocation[]): GenerationTelemetryInput {
    const workspace = {
        workspaceName: "payments",
        generatorsConfiguration: {
            absolutePathToConfiguration: AbsoluteFilePath.of("/project/fern/generators.yml"),
            api: undefined,
            defaultGroup: "sdks",
            groupAliases: {},
            groups: [{ groupName: "sdks", audiences: { type: "all" }, generators, reviewers: undefined }],
            rawConfiguration: {},
            reviewers: undefined,
            whitelabel: undefined,
            ai: undefined,
            replay: undefined
        } as generatorsYml.GeneratorsConfiguration
    } as unknown as AbstractAPIWorkspace<unknown>;
    return { kind: "legacy", workspace, resolvedGroupNames: ["sdks"] };
}

describe("findGuestIncompatibleGenerators", () => {
    it("accepts download-only generators", () => {
        expect(
            findGuestIncompatibleGenerators({
                generations: [legacyGeneration([download])],
                isAutomation: false,
                preview: false
            })
        ).toEqual([]);
    });

    it("names generators that would push to GitHub or publish", () => {
        expect(
            findGuestIncompatibleGenerators({
                generations: [legacyGeneration([download, github, publish])],
                isAutomation: false,
                preview: false
            })
        ).toEqual([
            { name: "fernapi/fern-typescript-sdk", outputMode: "github" },
            { name: "fernapi/fern-go-sdk", outputMode: "publishV2" }
        ]);
    });

    it("accepts everything with --preview, which writes locally", () => {
        expect(
            findGuestIncompatibleGenerators({
                generations: [legacyGeneration([github, publish])],
                isAutomation: false,
                preview: true
            })
        ).toEqual([]);
    });
});
