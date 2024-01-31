import { Audiences } from "@fern-api/config-management-commons";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage, GeneratorGroup } from "@fern-api/generators-configuration";
import { runLocalGenerationForSeed } from "@fern-api/local-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPublishInfo, PublishOutputModeV2 } from "@fern-fern/fiddle-sdk/types/api";
import { OutputMode } from "@fern-fern/seed-config/api";
import { ParsedDockerName } from "../../cli";

const DUMMY_ORGANIZATION = "seed";
const ALL_AUDIENCES: Audiences = { type: "all" };

export async function runDockerForWorkspace({
    absolutePathToOutput,
    docker,
    language,
    workspace,
    taskContext,
    customConfig,
    irVersion,
    outputVersion,
    outputMode,
    fixtureName
}: {
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: GenerationLanguage | undefined;
    workspace: FernWorkspace;
    taskContext: TaskContext;
    customConfig: unknown;
    irVersion?: string;
    outputVersion?: string;
    outputMode: OutputMode;
    fixtureName: string;
}): Promise<void> {
    const generatorGroup: GeneratorGroup = {
        groupName: "test",
        audiences: ALL_AUDIENCES,
        generators: [
            {
                name: docker.name,
                version: docker.version,
                config: customConfig,
                outputMode: getOutputMode({ outputMode, language, fixtureName }),
                absolutePathToLocalOutput: absolutePathToOutput,
                language,
                disableExamples: false
            }
        ]
    };
    await runLocalGenerationForSeed({
        organization: DUMMY_ORGANIZATION,
        workspace,
        generatorGroup,
        keepDocker: true,
        context: taskContext,
        irVersionOverride: irVersion,
        outputVersionOverride: outputVersion
    });
}

function getOutputMode({
    outputMode,
    language,
    fixtureName
}: {
    outputMode: OutputMode;
    language: GenerationLanguage | undefined;
    fixtureName: string;
}): FernFiddle.OutputMode {
    switch (outputMode) {
        case "github":
            return FernFiddle.OutputMode.github({
                repo: "fern",
                owner: fixtureName,
                publishInfo: language != null ? getGithubPublishInfo({ language, fixtureName }) : undefined
            });
        case "local_files":
            return FernFiddle.remoteGen.OutputMode.downloadFiles();
        case "publish": {
            if (language == null) {
                throw new Error("Seed requires a language to be specified to test in publish mode");
            }
            return FernFiddle.remoteGen.OutputMode.publishV2(getPublishInfo({ language, fixtureName }));
        }
    }
}

function getGithubPublishInfo({
    language,
    fixtureName
}: {
    language: GenerationLanguage;
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
            return undefined;
        default:
            assertNever(language);
    }
}

function getPublishInfo({
    language,
    fixtureName
}: {
    language: GenerationLanguage;
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
