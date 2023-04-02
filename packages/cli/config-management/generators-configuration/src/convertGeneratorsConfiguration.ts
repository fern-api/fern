import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import {
    GenerationLanguage,
    GeneratorGroup,
    GeneratorInvocation,
    GeneratorsConfiguration,
} from "./GeneratorsConfiguration";
import { GeneratorGroupSchema } from "./schemas/GeneratorGroupSchema";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";
import { GeneratorOutputSchema } from "./schemas/GeneratorOutputSchema";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration,
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): GeneratorsConfiguration {
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        rawConfiguration: rawGeneratorsConfiguration,
        defaultGroup: rawGeneratorsConfiguration["default-group"],
        groups:
            rawGeneratorsConfiguration.groups != null
                ? Object.entries(rawGeneratorsConfiguration.groups).map(([groupName, group]) =>
                      convertGroup({
                          absolutePathToGeneratorsConfiguration,
                          groupName,
                          group,
                      })
                  )
                : [],
    };
}

function convertGroup({
    absolutePathToGeneratorsConfiguration,
    groupName,
    group,
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    groupName: string;
    group: GeneratorGroupSchema;
}): GeneratorGroup {
    return {
        groupName,
        audiences: group.audiences == null ? { type: "all" } : { type: "select", audiences: group.audiences },
        generators: group.generators.map((generator) =>
            convertGenerator({ absolutePathToGeneratorsConfiguration, generator })
        ),
    };
}

function convertGenerator({
    absolutePathToGeneratorsConfiguration,
    generator,
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
}): GeneratorInvocation {
    return {
        name: generator.name,
        version: generator.version,
        config: generator.config,
        outputMode: convertOutputMode(generator),
        absolutePathToLocalOutput:
            generator.output?.location === "local-file-system"
                ? resolve(dirname(absolutePathToGeneratorsConfiguration), generator.output.path)
                : undefined,
        language: getLanguageFromGeneratorName(generator.name),
    };
}

function convertOutputMode(generator: GeneratorInvocationSchema): FernFiddle.OutputMode {
    if (generator.github != null) {
        const indexOfFirstSlash = generator.github.repository.indexOf("/");
        return FernFiddle.OutputMode.github({
            owner: generator.github.repository.slice(0, indexOfFirstSlash),
            repo: generator.github.repository.slice(indexOfFirstSlash + 1),
            publishInfo: generator.output != null ? getGithubPublishInfo(generator.output) : undefined,
        });
    }
    if (generator.output == null) {
        return FernFiddle.remoteGen.OutputMode.publish({ registryOverrides: {} });
    }
    switch (generator.output.location) {
        case "local-file-system":
            return FernFiddle.OutputMode.downloadFiles();
        case "npm":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: generator.output.url ?? "https://registry.npmjs.org",
                    packageName: generator.output["package-name"],
                    token: generator.output.token ?? "",
                })
            );
        case "maven":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.mavenOverride({
                    registryUrl: generator.output.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
                    username: generator.output.username ?? "",
                    password: generator.output.password ?? "",
                    coordinate: generator.output.coordinate,
                })
            );
        case "postman":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.postman({
                    apiKey: generator.output["api-key"],
                    workspaceId: generator.output["workspace-id"],
                })
            );
        case "pypi":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.pypiOverride({
                    registryUrl: generator.output.url ?? "https://upload.pypi.org/legacy/",
                    username: generator.output.username ?? "",
                    password: generator.output.password ?? "",
                    coordinate: generator.output["package-name"],
                })
            );
        default:
            assertNever(generator.output);
    }
}

function getGithubPublishInfo(output: GeneratorOutputSchema): FernFiddle.GithubPublishInfo {
    switch (output.location) {
        case "local-file-system":
            throw new Error("Cannot use local-file-system with github publishing");
        case "npm":
            return FernFiddle.GithubPublishInfo.npm({
                registryUrl: output.url ?? "https://registry.npmjs.org",
                packageName: output["package-name"],
                token: output.token,
            });
        case "maven":
            return FernFiddle.GithubPublishInfo.maven({
                registryUrl: output.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
                coordinate: output.coordinate,
                credentials:
                    output.username != null && output.password != null
                        ? {
                              username: output.username,
                              password: output.password,
                          }
                        : undefined,
            });
        case "postman":
            return FernFiddle.GithubPublishInfo.postman({
                apiKey: output["api-key"],
                workspaceId: output["workspace-id"],
            });
        case "pypi":
            return FernFiddle.GithubPublishInfo.pypi({
                registryUrl: output.url ?? "https://upload.pypi.org/legacy/",
                packageName: output["package-name"],
                credentials:
                    output.token != null
                        ? {
                              username: "__token__",
                              password: output.token,
                          }
                        : {
                              username: output.username ?? "",
                              password: output.password ?? "",
                          },
            });
        default:
            assertNever(output);
    }
}

function getLanguageFromGeneratorName(generatorName: string) {
    if (generatorName.includes("typescript")) {
        return GenerationLanguage.TYPESCRIPT;
    }
    if (generatorName.includes("java") || generatorName.includes("spring")) {
        return GenerationLanguage.JAVA;
    }
    if (generatorName.includes("python") || generatorName.includes("fastapi") || generatorName.includes("pydantic")) {
        return GenerationLanguage.PYTHON;
    }
    return undefined;
}
