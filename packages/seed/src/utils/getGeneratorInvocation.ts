import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPublishInfo, PublishOutputModeV2 } from "@fern-fern/fiddle-sdk/api";
import * as FernFiddleSerialization from "@fern-fern/fiddle-sdk/serialization";

import { OutputMode } from "../config/api/index.js";
import { ParsedDockerName } from "../utils/parseDockerOrThrow.js";

export async function getGeneratorInvocation({
    absolutePathToOutput,
    docker,
    language,
    customConfig,
    publishConfig,
    outputMode,
    fixtureName,
    outputFolder,
    irVersion,
    publishMetadata,
    readme,
    license,
    smartCasing
}: {
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: generatorsYml.GenerationLanguage | undefined;
    customConfig: unknown;
    publishConfig: unknown;
    outputMode: OutputMode;
    fixtureName: string;
    outputFolder?: string;
    irVersion: string;
    publishMetadata: unknown;
    readme: generatorsYml.ReadmeSchema | undefined;
    license?: unknown;
    smartCasing?: boolean;
}): Promise<generatorsYml.GeneratorInvocation> {
    const raw =
        license != null
            ? {
                  name: docker.name,
                  version: docker.version,
                  github: {
                      repository: "fern",
                      license: license as generatorsYml.GithubLicenseSchema
                  }
              }
            : undefined;

    const effectiveFixtureName = outputFolder ? `${fixtureName}_${outputFolder}` : fixtureName;

    // When outputFolder is present, inject language-specific package/module names into customConfig
    // for artifact naming (Docker project names, package manifests, etc.)
    const effectiveConfig =
        outputFolder != null && language != null
            ? {
                  ...(customConfig as Record<string, unknown> | undefined),
                  ...getLanguageSpecificPackageConfig(language, effectiveFixtureName)
              }
            : customConfig;

    return {
        name: docker.name,
        version: docker.version,
        config: effectiveConfig,
        outputMode: await getOutputMode({ outputMode, language, fixtureName: effectiveFixtureName, publishConfig }),
        absolutePathToLocalOutput: absolutePathToOutput,
        absolutePathToLocalSnippets: undefined,
        language,
        keywords: undefined,
        smartCasing: smartCasing ?? false,
        disableExamples: false,
        irVersionOverride: irVersion,
        publishMetadata:
            publishMetadata != null
                ? await FernFiddleSerialization.PublishingMetadata.parseOrThrow(publishMetadata)
                : undefined,
        readme,
        settings: undefined,
        raw
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
        case "rust":
            return FernFiddle.GithubPublishInfo.crates({
                packageName: `fern_${fixtureName}`,
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
            throw new Error("Seed doesn't support publish mode in PHP");
        case "rust":
            throw new Error("Seed doesn't support publish mode in Rust");
        default:
            assertNever(language);
    }
}

/**
 * Generate language-specific package/module name configuration for generators
 * when outputFolder is present, ensuring compatibility with each language's
 * naming conventions for special characters like _ and -.
 */
function getLanguageSpecificPackageConfig(
    language: generatorsYml.GenerationLanguage,
    fixtureName: string
): Record<string, string> {
    switch (language) {
        case "python":
            // Python module names can't have hyphens, need underscores
            return { package_name: `fern_${fixtureName}`.replace(/-/g, "_") };
        case "java":
            // Java typically uses dots for packages, but artifact names can have hyphens
            return { package_name: `com.fern.${fixtureName}`.replace(/_/g, ".") };
        case "typescript":
            // npm packages prefer hyphens, scoped packages are common
            return { package_name: `@fern/${fixtureName}`.replace(/_/g, "-") };
        case "go":
            // Go module paths can have hyphens in the URL part
            return { module_name: `github.com/fern/${fixtureName}`.replace(/_/g, "-") };
        case "ruby":
            // Ruby gems use hyphens, but module names use underscores
            return {
                gem_name: `fern-${fixtureName}`.replace(/_/g, "-"),
                module_name: `Fern${fixtureName}`.replace(/-/g, "")
            };
        case "csharp":
            // C# NuGet packages typically use PascalCase
            return { package_name: `Fern${fixtureName}`.replace(/[-_]/g, "") };
        case "rust":
            // Rust crate names can have hyphens (converted to underscores in code)
            return { package_name: `fern_${fixtureName}`.replace(/-/g, "_") };
        case "swift":
            // Swift packages can have hyphens
            return { package_name: `Fern${fixtureName}`.replace(/[-_]/g, "") };
        case "php":
            // PHP Composer packages typically use hyphens
            return { package_name: `fern/${fixtureName}`.replace(/_/g, "-") };
        default:
            assertNever(language);
    }
}
