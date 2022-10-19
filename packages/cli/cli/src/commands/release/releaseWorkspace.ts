import { assertNever } from "@fern-api/core-utils";
import { MavenGeneratorPublishing, NpmGeneratorPublishing } from "@fern-api/generators-configuration";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-client";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function releaseWorkspace({
    workspace,
    organization,
    context,
    version,
}: {
    workspace: Workspace;
    organization: string;
    context: TaskContext;
    version: string;
}): Promise<void> {
    const intermediateRepresentation = await generateIrForWorkspace({
        workspace,
        context,
        generationLanguage: undefined,
    });
    await runRemoteGenerationForWorkspace({
        workspace,
        intermediateRepresentation,
        organization,
        context,
        version,
        generatorConfigs: workspace.generatorsConfiguration.release.map((generator) => {
            let outputMode;
            if (generator.github != null) {
                const repository = generator.github.repository;
                const separatorIndex = repository.indexOf("/");
                outputMode = FernFiddle.OutputMode.github({
                    owner: repository.substring(0, separatorIndex),
                    repo: repository.substring(separatorIndex + 1),
                    publishInfo: getGitHubPublishingInfo(generator.publishing),
                });
            } else {
                outputMode = FernFiddle.OutputMode.publish({
                    registryOverrides: {
                        npm:
                            generator.publishing.type === "npm"
                                ? {
                                      registryUrl: generator.publishing.url ?? "https://registry.npmjs.org",
                                      packageName: generator.publishing.packageName,
                                      token: generator.publishing.token ?? "",
                                  }
                                : undefined,
                        maven:
                            generator.publishing.type === "maven"
                                ? {
                                      registryUrl:
                                          generator.publishing.url ??
                                          "https://s01.oss.sonatype.org/content/repositories/releases/",
                                      username: generator.publishing.username ?? "",
                                      password: generator.publishing.password ?? "",
                                      coordinate: generator.publishing.coordinate,
                                  }
                                : undefined,
                    },
                });
            }
            return {
                id: generator.name,
                version: generator.version,
                outputMode,
                customConfig: generator.config,
            };
        }),
        generatorInvocations: workspace.generatorsConfiguration.release,
    });
}

function getGitHubPublishingInfo(
    releaseGeneratorPublishing: NpmGeneratorPublishing | MavenGeneratorPublishing
): FernFiddle.GithubPublishInfo {
    switch (releaseGeneratorPublishing.type) {
        case "npm":
            return FernFiddle.GithubPublishInfo.npm({
                registryUrl: releaseGeneratorPublishing.url ?? "https://registry.npmjs.org",
                packageName: releaseGeneratorPublishing.packageName,
                token: releaseGeneratorPublishing.token,
            });
        case "maven":
            return FernFiddle.GithubPublishInfo.maven({
                registryUrl:
                    releaseGeneratorPublishing.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
                coordinate: releaseGeneratorPublishing.coordinate,
                credentials:
                    releaseGeneratorPublishing.username != null && releaseGeneratorPublishing.password != null
                        ? {
                              username: releaseGeneratorPublishing.username,
                              password: releaseGeneratorPublishing.password,
                          }
                        : undefined,
            });
        default:
            assertNever(releaseGeneratorPublishing);
    }
}
