import { Audiences } from "@fern-api/config-management-commons";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage, GeneratorGroup } from "@fern-api/generators-configuration";
import { runLocalGenerationForSeed } from "@fern-api/local-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPublishInfo } from "@fern-fern/fiddle-sdk/types/api";
import { GeneratorType } from "@fern-fern/seed-config/api";
import { ParsedDockerName } from "../../cli";

const DUMMY_ORGANIZATION = "seed";
const ALL_AUDIENCES: Audiences = { type: "all" };

export async function runDockerForWorkspace({
    generatorType,
    absolutePathToOutput,
    docker,
    language,
    workspace,
    taskContext,
    customConfig,
    irVersion,
}: {
    generatorType: GeneratorType;
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: GenerationLanguage;
    workspace: FernWorkspace;
    taskContext: TaskContext;
    customConfig: unknown;
    irVersion?: string;
}): Promise<void> {
    const publishInfo = getPublishInfo(language);

    const generatorGroup: GeneratorGroup = {
        groupName: "DUMMY",
        audiences: ALL_AUDIENCES,
        generators: [
            {
                name: docker.name,
                version: docker.version,
                config: customConfig,
                outputMode:
                    generatorType === "Server"
                        ? FernFiddle.remoteGen.OutputMode.downloadFiles()
                        : FernFiddle.remoteGen.OutputMode.github({
                              repo: `seed-${language}`,
                              owner: "fern-api",
                              publishInfo,
                          }),
                absolutePathToLocalOutput: absolutePathToOutput,
                language,
            },
        ],
    };
    await runLocalGenerationForSeed({
        organization: DUMMY_ORGANIZATION,
        workspace,
        generatorGroup,
        keepDocker: true,
        context: taskContext,
        irVersionOverride: irVersion,
    });
}

function getPublishInfo(language: GenerationLanguage): GithubPublishInfo | undefined {
    switch (language) {
        case "java":
            return FernFiddle.GithubPublishInfo.maven({
                coordinate: "",
                registryUrl: "",
            });
        case "python":
            return FernFiddle.GithubPublishInfo.pypi({
                packageName: "",
                registryUrl: "",
            });
        case "typescript":
            return FernFiddle.GithubPublishInfo.npm({
                packageName: "",
                registryUrl: "",
            });
        case "go":
            return undefined;
        default:
            assertNever(language);
    }
}
