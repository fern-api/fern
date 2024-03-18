import { Audiences, generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { runLocalGenerationForSeed } from "@fern-api/local-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPublishInfo, PublishOutputModeV2 } from "@fern-fern/fiddle-sdk/api";
import { ParsedDockerName } from "../../cli";
import { OutputMode } from "../../config/api";

const DUMMY_ORGANIZATION = "seed";
const ALL_AUDIENCES: Audiences = { type: "all" };

export async function runDockerForWorkspace({
    absolutePathToOutput,
    docker,
    language,
    workspace,
    taskContext,
    customConfig,
    publishConfig,
    selectAudiences,
    irVersion,
    outputVersion,
    outputMode,
    fixtureName,
    keepDocker
}: {
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: generatorsYml.GenerationLanguage | undefined;
    workspace: FernWorkspace;
    taskContext: TaskContext;
    customConfig: unknown;
    publishConfig: unknown;
    selectAudiences?: string[];
    irVersion?: string;
    outputVersion?: string;
    outputMode: OutputMode;
    fixtureName: string;
    keepDocker: boolean | undefined;
}): Promise<void> {
    const generatorGroup: generatorsYml.GeneratorGroup = {
        groupName: "test",
        audiences: selectAudiences != null ? { type: "select", audiences: selectAudiences } : ALL_AUDIENCES,
        generators: [
            {
                name: docker.name,
                version: docker.version,
                config: customConfig,
                outputMode: getOutputMode({ outputMode, language, fixtureName, publishConfig }),
                absolutePathToLocalOutput: absolutePathToOutput,
                language,
                smartCasing: false,
                disableExamples: false
            }
        ]
    };
    await runLocalGenerationForSeed({
        organization: DUMMY_ORGANIZATION,
        absolutePathToFernConfig: undefined,
        workspace,
        generatorGroup,
        keepDocker: keepDocker ?? false,
        context: taskContext,
        irVersionOverride: irVersion,
        outputVersionOverride: outputVersion
    });
}

function getOutputMode({
    outputMode,
    language,
    fixtureName,
    publishConfig
}: {
    outputMode: OutputMode;
    language: generatorsYml.GenerationLanguage | undefined;
    fixtureName: string;
    publishConfig: unknown;
}): FernFiddle.OutputMode {
    switch (outputMode) {
        case "github":
            const githubPublishInfo = publishConfig != null ? (publishConfig as GithubPublishInfo) : undefined;
            return FernFiddle.OutputMode.github({
                repo: "fern",
                owner: fixtureName,
                publishInfo:
                    githubPublishInfo ??
                    (language != null ? getGithubPublishInfo({ language, fixtureName }) : undefined)
            });
        case "local_files":
            return FernFiddle.remoteGen.OutputMode.downloadFiles();
        case "publish": {
            if (language == null) {
                throw new Error("Seed requires a language to be specified to test in publish mode");
            }
            const publishOutputModeConfig = publishConfig != null ? (publishConfig as PublishOutputModeV2) : undefined;
            return FernFiddle.remoteGen.OutputMode.publishV2(
                publishOutputModeConfig ?? getPublishInfo({ language, fixtureName })
            );
        }
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
                registryUrl: ""
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
        default:
            assertNever(language);
    }
}
