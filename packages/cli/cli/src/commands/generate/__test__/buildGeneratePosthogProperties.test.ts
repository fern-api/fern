import type { fernConfigJson, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import type { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { buildGeneratePosthogProperties, type GenerationTelemetryInput } from "../buildGeneratePosthogProperties.js";

/** `getUserIdFromToken` decodes without verifying, so a well-formed unsigned token is enough. */
function createUnsignedJwt(payload: Record<string, string>): string {
    const encode = (value: Record<string, string>) => Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.`;
}

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
        groupNames: ["sdks"],
        generatorName: undefined,
        token: undefined,
        sdkGenApiEnabled: false,
        cliReleaseEnvironment: "prod",
        ...overrides
    });
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
        expect(properties.generatorNames).toEqual(["fernapi/fern-python-sdk", "fernapi/fern-typescript-sdk"]);
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
            }).generatorNames
        ).toEqual(["fernapi/fern-typescript-sdk"]);

        expect(
            build({
                generations: [
                    { kind: "legacy", workspace: legacyWorkspace, resolvedGroupNames: ["sdks"], generatorIndex: 0 }
                ]
            }).generatorNames
        ).toEqual(["fernapi/fern-python-sdk"]);
    });

    it("includes SDK Config generations alongside legacy groups and de-duplicates generator names", () => {
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
        expect(properties.generatorNames).toEqual([
            "fernapi/fern-go-sdk",
            "fernapi/fern-python-sdk",
            "fernapi/fern-typescript-sdk"
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

    it("identifies the user behind a user token", () => {
        const value = createUnsignedJwt({ sub: "auth0|user-123" });

        expect(build({ token: { type: "user", value } })).toMatchObject({ authType: "user", userId: "auth0|user-123" });
    });

    it("reports organization tokens and anonymous runs without a user ID", () => {
        expect(build({ token: { type: "organization", value: "org-token" } })).toMatchObject({
            authType: "organization",
            userId: undefined
        });
        expect(build({ token: undefined })).toMatchObject({ authType: "none", userId: undefined });
    });

    it.each([
        { sdkGenApiEnabled: true, cliReleaseEnvironment: "pre-prod" as const },
        { sdkGenApiEnabled: false, cliReleaseEnvironment: "prod" as const },
        { sdkGenApiEnabled: undefined, cliReleaseEnvironment: "beta" as const }
    ])("reports sdkGenApiEnabled=$sdkGenApiEnabled for the $cliReleaseEnvironment release environment", ({
        sdkGenApiEnabled,
        cliReleaseEnvironment
    }) => {
        expect(build({ sdkGenApiEnabled, cliReleaseEnvironment })).toMatchObject({
            sdkGenApiEnabled,
            cliReleaseEnvironment
        });
    });
});
