import { assertNever } from "@fern-api/core-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GeneratorPublishingSchema } from "./schemas/GeneratorPublishingSchema";
import { MavenPublishingSchema } from "./schemas/MavenPublishingSchema";
import { NpmPublishingSchema } from "./schemas/NpmPublishingSchema";
import { PostmanPublishingSchema } from "./schemas/PostmanPublishingSchema";
import { ReleaseGeneratorInvocationSchema } from "./schemas/ReleaseGeneratorInvocationSchema";

export function getOutputModeForRelease(generatorInvocation: ReleaseGeneratorInvocationSchema): FernFiddle.OutputMode {
    if (generatorInvocation.github != null) {
        const repository = generatorInvocation.github.repository;
        const separatorIndex = repository.indexOf("/");
        return FernFiddle.OutputMode.github({
            owner: repository.substring(0, separatorIndex),
            repo: repository.substring(separatorIndex + 1),
            publishInfo:
                generatorInvocation.publishing != null
                    ? getGitHubPublishingInfo(generatorInvocation.publishing)
                    : undefined,
        });
    } else if (generatorInvocation.publishing != null) {
        if (isNpmPublishing(generatorInvocation.publishing)) {
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: generatorInvocation.publishing.npm.url ?? "https://registry.npmjs.org",
                    packageName: generatorInvocation.publishing.npm["package-name"],
                    token: generatorInvocation.publishing.npm.token ?? "",
                })
            );
        } else if (isMavenPublishing(generatorInvocation.publishing)) {
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.mavenOverride({
                    registryUrl:
                        generatorInvocation.publishing.maven.url ??
                        "https://s01.oss.sonatype.org/content/repositories/releases/",
                    username: generatorInvocation.publishing.maven.username ?? "",
                    password: generatorInvocation.publishing.maven.password ?? "",
                    coordinate: generatorInvocation.publishing.maven.coordinate,
                })
            );
        } else if (isPostmanPublishing(generatorInvocation.publishing)) {
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.postman({
                    apiKey: generatorInvocation.publishing.postman["api-key"],
                    workspaceId: generatorInvocation.publishing.postman["workspace-id"],
                })
            );
        }
        assertNever(generatorInvocation.publishing);
    } else {
        // TODO(dsinghvi): Need to validate that either you are in GitHub mode or publishing is supported
        throw new Error(
            `Failed to release generator ${generatorInvocation.name} because neither publishing nor GitHub is specified!`
        );
    }
}

function getGitHubPublishingInfo(publishing: GeneratorPublishingSchema): FernFiddle.GithubPublishInfo {
    if (isNpmPublishing(publishing)) {
        return FernFiddle.GithubPublishInfo.npm({
            registryUrl: publishing.npm.url ?? "https://registry.npmjs.org",
            packageName: publishing.npm["package-name"],
            token: publishing.npm.token,
        });
    }

    if (isMavenPublishing(publishing)) {
        return FernFiddle.GithubPublishInfo.maven({
            registryUrl: publishing.maven.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
            coordinate: publishing.maven.coordinate,
            credentials:
                publishing.maven.username != null && publishing.maven.password != null
                    ? {
                          username: publishing.maven.username,
                          password: publishing.maven.password,
                      }
                    : undefined,
        });
    }

    if (isPostmanPublishing(publishing)) {
        return FernFiddle.GithubPublishInfo.postman({
            apiKey: publishing.postman["api-key"],
            workspaceId: publishing.postman["workspace-id"],
        });
    }

    assertNever(publishing);
}

function isNpmPublishing(rawPublishingSchema: GeneratorPublishingSchema): rawPublishingSchema is NpmPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as NpmPublishingSchema).npm != null;
}

function isMavenPublishing(
    rawPublishingSchema: GeneratorPublishingSchema
): rawPublishingSchema is MavenPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as MavenPublishingSchema).maven != null;
}

function isPostmanPublishing(
    rawPublishingSchema: GeneratorPublishingSchema
): rawPublishingSchema is PostmanPublishingSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawPublishingSchema as PostmanPublishingSchema).postman != null;
}
