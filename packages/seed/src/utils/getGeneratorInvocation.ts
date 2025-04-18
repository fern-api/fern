import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPublishInfo, PublishOutputModeV2 } from "@fern-fern/fiddle-sdk/api";
import * as FernFiddleSerialization from "@fern-fern/fiddle-sdk/serialization";

import { OutputMode } from "../config/api";
import { ParsedDockerName } from "../utils/parseDockerOrThrow";

export async function getGeneratorInvocation({
    absolutePathToOutput,
    docker,
    language,
    customConfig,
    publishConfig,
    outputMode,
    fixtureName,
    irVersion,
    publishMetadata,
    readme
}: {
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: generatorsYml.GenerationLanguage | undefined;
    customConfig: unknown;
    publishConfig: unknown;
    outputMode: OutputMode;
    fixtureName: string;
    irVersion: string;
    publishMetadata: unknown;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<generatorsYml.GeneratorInvocation> {
    return {
        name: docker.name,
        version: docker.version,
        config: customConfig,
        outputMode: await getOutputMode({ outputMode, language, fixtureName, publishConfig }),
        absolutePathToLocalOutput: absolutePathToOutput,
        absolutePathToLocalSnippets: undefined,
        language,
        keywords: undefined,
        smartCasing: false,
        disableExamples: false,
        irVersionOverride: irVersion,
        publishMetadata:
            publishMetadata != null
                ? await FernFiddleSerialization.PublishingMetadata.parseOrThrow(publishMetadata)
                : undefined,
        readme,
        settings: undefined
    };
}

async function getOutputMode({
    outputMode,
    language,
    fixtureName,
    publishConfig
}: {
    outputMode: OutputMode;
    language: generatorsYml.GenerationLanguage | undefined;
    fixtureName: string;
    publishConfig: unknown;
}): Promise<FernFiddle.OutputMode> {
    switch (outputMode) {
        case "github":
            const githubPublishInfo =
                publishConfig != null
                    ? await FernFiddleSerialization.GithubPublishInfo.parseOrThrow(publishConfig)
                    : undefined;
            return FernFiddle.OutputMode.github({
                repo: "fern",
                owner: fixtureName,
                publishInfo:
                    githubPublishInfo ??
                    (language != null ? getGithubPublishInfo({ language, fixtureName }) : undefined)
            });
        case "local_files":
            return FernFiddle.remoteGen.OutputMode.downloadFiles({});
        case "publish": {
            if (language == null) {
                throw new Error("Seed requires a language to be specified to test in publish mode");
            }
            const publishOutputModeConfig = publishConfig != null ? (publishConfig as PublishOutputModeV2) : undefined;
            return FernFiddle.remoteGen.OutputMode.publishV2(
                publishOutputModeConfig ?? getPublishInfo({ language, fixtureName })
            );
        }
        default:
            assertNever(outputMode);
    }
}

function getGithubPublishInfo({
    language,
    fixtureName
}: {
    language: generatorsYml.GenerationLanguage;
    fixtureName: string;
}): GithubPublishInfo | undefined {
    switch (language) {
        case "java":
            return FernFiddle.GithubPublishInfo.maven({
                coordinate: `com.fern:${fixtureName}`,
                registryUrl: ""
            });
        case "python":
            return FernFiddle.GithubPublishInfo.pypi({
                packageName: `fern_${fixtureName}`,
                registryUrl: "",
                pypiMetadata: {
                    keywords: ["fern", "test"],
                    documentationLink: "https://buildwithfern.com/learn",
                    homepageLink: "https://buildwithfern.com/"
                }
            });
        case "typescript":
            return FernFiddle.GithubPublishInfo.npm({
                packageName: `@fern/${fixtureName}`,
                registryUrl: ""
            });
        case "go":
            return undefined;
        case "ruby":
            return FernFiddle.GithubPublishInfo.rubygems({
                packageName: `fern_${fixtureName}`,
                registryUrl: ""
            });
        case "csharp":
            return FernFiddle.GithubPublishInfo.nuget({
                packageName: `Fern${fixtureName}`,
                registryUrl: ""
            });
        case "swift":
            return undefined;
        case "php":
            return undefined;
        default:
            assertNever(language);
    }
}

function getPublishInfo({
    language,
    fixtureName
}: {
    language: generatorsYml.GenerationLanguage;
    fixtureName: string;
}): PublishOutputModeV2 {
    switch (language) {
        case "java":
            return FernFiddle.remoteGen.PublishOutputModeV2.mavenOverride({
                username: "fern",
                password: "fern1!",
                registryUrl: "https://maven.com",
                coordinate: `com.fern:${fixtureName}`
            });
        case "python":
            return FernFiddle.remoteGen.PublishOutputModeV2.pypiOverride({
                username: "fern",
                password: "fern1!",
                registryUrl: "https://pypi.com",
                coordinate: `fern-${fixtureName}`
            });
        case "typescript":
            return FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                token: "fern1!",
                registryUrl: "https://maven.com",
                packageName: `@fern/${fixtureName}`
            });
        case "go":
            throw new Error("Seed doesn't support publish mode in Go!");
        case "ruby":
            throw new Error("Seed doesn't support publish mode in Ruby!");
        case "csharp":
            throw new Error("Seed doesn't support publish mode in C#!");
        case "swift":
            throw new Error("Seed doesn't support publish mode in Swift");
        case "php":
            throw new Error("Seed doesn't support publish mode in Swift");
        default:
            assertNever(language);
    }
}
