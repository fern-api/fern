import { assertNever } from "@fern-api/core-utils";
import { FernFiddle } from "@fern-fern/fiddle-client";
import { GeneratorPublishingSchema } from "./schemas/GeneratorPublishingSchema";
import { MavenPublishingSchema } from "./schemas/MavenPublishingSchema";
import { NpmPublishingSchema } from "./schemas/NpmPublishingSchema";
import { ReleaseGeneratorInvocationSchema } from "./schemas/ReleaseGeneratorInvocationSchema";

export function getOutputModeForRelease(generatorInvocation: ReleaseGeneratorInvocationSchema): FernFiddle.OutputMode {
    if (generatorInvocation.github != null) {
        const repository = generatorInvocation.github.repository;
        const separatorIndex = repository.indexOf("/");
        return FernFiddle.OutputMode.github({
            owner: repository.substring(0, separatorIndex),
            repo: repository.substring(separatorIndex + 1),
            publishInfo: getGitHubPublishingInfo(generatorInvocation.publishing),
        });
    } else {
        return FernFiddle.OutputMode.publish({
            registryOverrides: {
                npm: isNpmPublishing(generatorInvocation.publishing)
                    ? {
                          registryUrl: generatorInvocation.publishing.npm.url ?? "https://registry.npmjs.org",
                          packageName: generatorInvocation.publishing.npm["package-name"],
                          token: generatorInvocation.publishing.npm.token ?? "",
                      }
                    : undefined,
                maven: isMavenPublishing(generatorInvocation.publishing)
                    ? {
                          registryUrl:
                              generatorInvocation.publishing.maven.url ??
                              "https://s01.oss.sonatype.org/content/repositories/releases/",
                          username: generatorInvocation.publishing.maven.username ?? "",
                          password: generatorInvocation.publishing.maven.password ?? "",
                          coordinate: generatorInvocation.publishing.maven.coordinate,
                      }
                    : undefined,
            },
        });
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
