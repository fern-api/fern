import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { readFile } from "fs/promises";
import path from "path";
import {
    GenerationLanguage,
    GeneratorGroup,
    GeneratorInvocation,
    GeneratorsConfiguration
} from "./GeneratorsConfiguration";
import { GeneratorGroupSchema } from "./schemas/GeneratorGroupSchema";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";
import { GeneratorOutputSchema } from "./schemas/GeneratorOutputSchema";
import {
    ASYNC_API_LOCATION_KEY,
    GeneratorsConfigurationSchema,
    OPENAPI_LOCATION_KEY
} from "./schemas/GeneratorsConfigurationSchema";
import { GithubLicenseSchema } from "./schemas/GithubLicenseSchema";

export async function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): Promise<GeneratorsConfiguration> {
    const pathToOpenAPI = rawGeneratorsConfiguration[OPENAPI_LOCATION_KEY];
    const pathToAsyncAPI = rawGeneratorsConfiguration[ASYNC_API_LOCATION_KEY];
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        absolutePathToAsyncAPI:
            pathToAsyncAPI != null
                ? join(dirname(absolutePathToGeneratorsConfiguration), RelativeFilePath.of(pathToAsyncAPI))
                : undefined,
        absolutePathToOpenAPI:
            pathToOpenAPI != null
                ? join(dirname(absolutePathToGeneratorsConfiguration), RelativeFilePath.of(pathToOpenAPI))
                : undefined,
        rawConfiguration: rawGeneratorsConfiguration,
        defaultGroup: rawGeneratorsConfiguration["default-group"],
        groups:
            rawGeneratorsConfiguration.groups != null
                ? await Promise.all(
                      Object.entries(rawGeneratorsConfiguration.groups).map(([groupName, group]) =>
                          convertGroup({
                              absolutePathToGeneratorsConfiguration,
                              groupName,
                              group
                          })
                      )
                  )
                : []
    };
}

async function convertGroup({
    absolutePathToGeneratorsConfiguration,
    groupName,
    group
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    groupName: string;
    group: GeneratorGroupSchema;
}): Promise<GeneratorGroup> {
    return {
        groupName,
        audiences: group.audiences == null ? { type: "all" } : { type: "select", audiences: group.audiences },
        generators: await Promise.all(
            group.generators.map((generator) => convertGenerator({ absolutePathToGeneratorsConfiguration, generator }))
        )
    };
}

async function convertGenerator({
    absolutePathToGeneratorsConfiguration,
    generator
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
}): Promise<GeneratorInvocation> {
    return {
        name: generator.name,
        version: generator.version,
        config: generator.config,
        outputMode: await convertOutputMode({ absolutePathToGeneratorsConfiguration, generator }),
        absolutePathToLocalOutput:
            generator.output?.location === "local-file-system"
                ? resolve(dirname(absolutePathToGeneratorsConfiguration), generator.output.path)
                : undefined,
        language: getLanguageFromGeneratorName(generator.name)
    };
}

async function convertOutputMode({
    absolutePathToGeneratorsConfiguration,
    generator
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
}): Promise<FernFiddle.OutputMode> {
    if (generator.github != null) {
        const indexOfFirstSlash = generator.github.repository.indexOf("/");
        const owner = generator.github.repository.slice(0, indexOfFirstSlash);
        const repo = generator.github.repository.slice(indexOfFirstSlash + 1);
        const publishInfo = generator.output != null ? getGithubPublishInfo(generator.output) : undefined;
        const license =
            generator.github.license != null
                ? await getGithubLicense({
                      absolutePathToGeneratorsConfiguration,
                      githubLicense: generator.github.license
                  })
                : undefined;
        const mode = generator.github.mode ?? "release";
        switch (mode) {
            case "commit":
            case "release":
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.commitAndRelease({
                        owner,
                        repo,
                        license,
                        publishInfo
                    })
                );
            case "pull-request":
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.pullRequest({
                        owner,
                        repo,
                        license,
                        publishInfo
                    })
                );
            case "push":
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({
                        owner,
                        repo,
                        branch: generator.github.mode === "push" ? generator.github.branch : undefined,
                        license,
                        publishInfo
                    })
                );
            default:
                assertNever(mode);
        }
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
                    token: generator.output.token ?? ""
                })
            );
        case "maven":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.mavenOverride({
                    registryUrl: generator.output.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
                    username: generator.output.username ?? "",
                    password: generator.output.password ?? "",
                    coordinate: generator.output.coordinate
                })
            );
        case "postman":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.postman({
                    apiKey: generator.output["api-key"],
                    workspaceId: generator.output["workspace-id"]
                })
            );
        case "pypi":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.pypiOverride({
                    registryUrl: generator.output.url ?? "https://upload.pypi.org/legacy/",
                    username: generator.output.token != null ? "__token__" : generator.output.password ?? "",
                    password: generator.output.token ?? generator.output.password ?? "",
                    coordinate: generator.output["package-name"]
                })
            );
        default:
            assertNever(generator.output);
    }
}

async function getGithubLicense({
    absolutePathToGeneratorsConfiguration,
    githubLicense
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    githubLicense: GithubLicenseSchema;
}): Promise<FernFiddle.GithubLicense> {
    if (typeof githubLicense === "string") {
        switch (githubLicense) {
            case "MIT":
                return FernFiddle.GithubLicense.id(FernFiddle.GithubLicenseId.Mit);
            case "Apache-2.0":
                return FernFiddle.GithubLicense.id(FernFiddle.GithubLicenseId.Apache2);
            default:
                assertNever(githubLicense);
        }
    }
    const absolutePathToLicense = join(
        AbsoluteFilePath.of(path.dirname(absolutePathToGeneratorsConfiguration)),
        RelativeFilePath.of(githubLicense.custom)
    );
    const licenseContent = await readFile(absolutePathToLicense);
    return FernFiddle.GithubLicense.file(licenseContent.toString());
}

function getGithubPublishInfo(output: GeneratorOutputSchema): FernFiddle.GithubPublishInfo {
    switch (output.location) {
        case "local-file-system":
            throw new Error("Cannot use local-file-system with github publishing");
        case "npm":
            return FernFiddle.GithubPublishInfo.npm({
                registryUrl: output.url ?? "https://registry.npmjs.org",
                packageName: output["package-name"],
                token: output.token
            });
        case "maven":
            return FernFiddle.GithubPublishInfo.maven({
                registryUrl: output.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
                coordinate: output.coordinate,
                credentials:
                    output.username != null && output.password != null
                        ? {
                              username: output.username,
                              password: output.password
                          }
                        : undefined
            });
        case "postman":
            return FernFiddle.GithubPublishInfo.postman({
                apiKey: output["api-key"],
                workspaceId: output["workspace-id"]
            });
        case "pypi":
            return FernFiddle.GithubPublishInfo.pypi({
                registryUrl: output.url ?? "https://upload.pypi.org/legacy/",
                packageName: output["package-name"],
                credentials:
                    output.token != null
                        ? {
                              username: "__token__",
                              password: output.token
                          }
                        : {
                              username: output.username ?? "",
                              password: output.password ?? ""
                          }
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
    if (generatorName.includes("go")) {
        return GenerationLanguage.GO;
    }
    return undefined;
}
