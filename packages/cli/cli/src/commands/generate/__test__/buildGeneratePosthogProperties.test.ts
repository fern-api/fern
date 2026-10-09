import type { fernConfigJson, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import type { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { buildGeneratePosthogProperties, type GenerationTelemetryInput } from "../buildGeneratePosthogProperties.js";

function createGenerator(name: string, version: string): generatorsYml.GeneratorInvocation {
    return {
        name,
        version,
        language: undefined,
        config: { secretLookingOption: "kept-out-of-requested-generators" },
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
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

function createGeneratorsConfiguration(
    groups: Array<{ groupName: string; generators: generatorsYml.GeneratorInvocation[] }>
): generatorsYml.GeneratorsConfiguration {
    return {
        absolutePathToConfiguration: AbsoluteFilePath.of("/project/fern/generators.yml"),
        api: undefined,
        defaultGroup: groups[0]?.groupName,
        groupAliases: {},
        groups: groups.map(({ groupName, generators }) => ({
            groupName,
            audiences: { type: "all" },
            generators,
            reviewers: undefined
        })),
        rawConfiguration: {},
        reviewers: undefined,
        whitelabel: undefined,
        ai: undefined,
        replay: undefined
    } as generatorsYml.GeneratorsConfiguration;
}

const pythonSdk = createGenerator("fernapi/fern-python-sdk", "4.0.0");
const typescriptSdk = createGenerator("fernapi/fern-typescript-sdk", "4.1.0");
const goSdk = createGenerator("fernapi/fern-go-sdk", "1.2.3");

const legacyWorkspace = {
    workspaceName: "payments",
    generatorsConfiguration: createGeneratorsConfiguration([
        { groupName: "sdks", generators: [pythonSdk, typescriptSdk] },
        { groupName: "go", generators: [goSdk] }
    ])
} as unknown as AbstractAPIWorkspace<unknown>;

const project: Project = {
    config: {
        _absolutePath: AbsoluteFilePath.of("/project/fern/fern.config.json"),
        organization: "acme",
        rawConfig: { organization: "acme", version: "*" },
        version: "*"
    } satisfies fernConfigJson.ProjectConfig,
    apiWorkspaces: [legacyWorkspace],
    docsWorkspaces: undefined,
    loadAPIWorkspace: () => legacyWorkspace
};

function build(
    overrides: Partial<Parameters<typeof buildGeneratePosthogProperties>[0]> = {}
): ReturnType<typeof buildGeneratePosthogProperties> {
    return buildGeneratePosthogProperties({
        project,
        generations: [{ kind: "legacy", workspace: legacyWorkspace, resolvedGroupNames: ["sdks"] }],
        isAutomation: false,
        groupNames: ["sdks"],
        generatorName: undefined,
        fernUseSdkGenApiEnv: undefined,
        sdkGenApiEnabled: false,
        ...overrides
    });
}

function requestedGeneratorNames(properties: ReturnType<typeof buildGeneratePosthogProperties>): string[] {
    return properties.requestedGenerators.map(({ name }) => name);
}

describe("buildGeneratePosthogProperties", () => {
    it("lists every generator in the resolved groups without their custom config", () => {
        const properties = build();

        expect(properties.requestedGenerators).toEqual([
            {
                workspace: "payments",
                kind: "legacy",
                group: "sdks",
                name: "fernapi/fern-python-sdk",
                version: "4.0.0",
                outputMode: "downloadFiles"
            },
            {
                workspace: "payments",
                kind: "legacy",
                group: "sdks",
                name: "fernapi/fern-typescript-sdk",
                version: "4.1.0",
                outputMode: "downloadFiles"
            }
        ]);
    });

    it("honors --generator name and index filters", () => {
        expect(
            build({
                generations: [
                    {
                        kind: "legacy",
                        workspace: legacyWorkspace,
                        resolvedGroupNames: ["sdks"],
                        generatorName: "fernapi/fern-typescript-sdk"
                    }
                ]
            }).requestedGenerators.map(({ name }) => name)
        ).toEqual(["fernapi/fern-typescript-sdk"]);

        expect(
            build({
                generations: [
                    { kind: "legacy", workspace: legacyWorkspace, resolvedGroupNames: ["sdks"], generatorIndex: 0 }
                ]
            }).requestedGenerators.map(({ name }) => name)
        ).toEqual(["fernapi/fern-python-sdk"]);
    });

    it("includes SDK Config generations alongside legacy groups", () => {
        const sdkConfigWorkspace = {
            workspaceName: "payments",
            generatorsConfiguration: createGeneratorsConfiguration([
                { groupName: "sdk-config", generators: [goSdk, createGenerator("fernapi/fern-python-sdk", "6.0.0")] }
            ])
        } satisfies GenerationTelemetryInput["workspace"];

        const properties = build({
            generations: [
                { kind: "legacy", workspace: legacyWorkspace, resolvedGroupNames: ["sdks"] },
                { kind: "sdk-config", workspace: sdkConfigWorkspace, resolvedGroupNames: ["sdk-config"] }
            ]
        });

        expect(properties.requestedGenerators.filter(({ kind }) => kind === "sdk-config")).toEqual([
            {
                workspace: "payments",
                kind: "sdk-config",
                group: "sdk-config",
                name: "fernapi/fern-go-sdk",
                version: "1.2.3",
                outputMode: "downloadFiles"
            },
            {
                workspace: "payments",
                kind: "sdk-config",
                group: "sdk-config",
                name: "fernapi/fern-python-sdk",
                version: "6.0.0",
                outputMode: "downloadFiles"
            }
        ]);
        expect(requestedGeneratorNames(properties)).toEqual([
            "fernapi/fern-python-sdk",
            "fernapi/fern-typescript-sdk",
            "fernapi/fern-go-sdk",
            "fernapi/fern-python-sdk"
        ]);
    });

    it("reports only generators that automation will run", () => {
        const optedOut: generatorsYml.GeneratorInvocation = {
            ...createGenerator("fernapi/fern-java-sdk", "3.0.0"),
            automation: { generate: false, preview: true, upgrade: true, verify: true }
        };
        const workspace = {
            workspaceName: "payments",
            generatorsConfiguration: createGeneratorsConfiguration([
                { groupName: "sdks", generators: [pythonSdk, optedOut] }
            ])
        } satisfies GenerationTelemetryInput["workspace"];
        const generations: GenerationTelemetryInput[] = [{ kind: "legacy", workspace, resolvedGroupNames: ["sdks"] }];

        expect(requestedGeneratorNames(build({ generations, isAutomation: true }))).toEqual([
            "fernapi/fern-python-sdk"
        ]);
        expect(requestedGeneratorNames(build({ generations, isAutomation: false }))).toEqual([
            "fernapi/fern-python-sdk",
            "fernapi/fern-java-sdk"
        ]);
    });

    it("reports an SDK Config target's requested output instead of the placeholder output mode", () => {
        const workspace = {
            workspaceName: "payments",
            generatorsConfiguration: createGeneratorsConfiguration([
                {
                    groupName: "sdk-config",
                    generators: [
                        { ...goSdk, sdkConfigTargetIndex: 0 },
                        { ...typescriptSdk, sdkConfigTargetIndex: 1 }
                    ]
                }
            ])
        } satisfies GenerationTelemetryInput["workspace"];

        const properties = build({
            generations: [
                {
                    kind: "sdk-config",
                    workspace,
                    resolvedGroupNames: ["sdk-config"],
                    sdkConfigV1: {
                        targets: [
                            {
                                body: Buffer.from(""),
                                language: "go",
                                requestedOutput: { type: "github", repository: "acme/go-sdk" }
                            },
                            { body: Buffer.from(""), language: "typescript" }
                        ]
                    }
                }
            ]
        });

        expect(properties.requestedGenerators.map(({ name, outputMode }) => ({ name, outputMode }))).toEqual([
            { name: "fernapi/fern-go-sdk", outputMode: "github" },
            { name: "fernapi/fern-typescript-sdk", outputMode: "download" }
        ]);
    });

    it("keeps the legacy workspaces payload", () => {
        expect(build().workspaces).toEqual([
            {
                name: "payments",
                group: "sdks",
                generators: [
                    [
                        {
                            name: "fernapi/fern-python-sdk",
                            version: "4.0.0",
                            outputMode: "downloadFiles",
                            config: { secretLookingOption: "kept-out-of-requested-generators" }
                        },
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "4.1.0",
                            outputMode: "downloadFiles",
                            config: { secretLookingOption: "kept-out-of-requested-generators" }
                        }
                    ]
                ]
            }
        ]);
    });

    it("reports the effective sdk-gen-api state separately from the env var", () => {
        expect(build({ fernUseSdkGenApiEnv: undefined, sdkGenApiEnabled: true })).toMatchObject({
            fernUseSdkGenApiEnv: false,
            sdkGenApiEnabled: true
        });
    });
});
