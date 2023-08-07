import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
import { GenerationLanguage, GeneratorGroup } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, loadWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import path from "path";
import { ParsedDockerName } from "../cli";

export const FIXTURE = {
    EXHAUSTIVE: "exhaustive",
    BASIC_AUTH: "basic-auth",
    CUSTOM_AUTH: "custom-auth",
    ERROR_PROPERTY: "error-property",
} as const;

export async function runTests({
    irVersion,
    language,
    fixture,
    docker,
    taskContext,
}: {
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixture: string | undefined;
    docker: ParsedDockerName;
    taskContext: TaskContext;
}): Promise<void> {
    const testCases = fixture != null ? [fixture] : Object.values(FIXTURE);
    for (const testCase of testCases) {
        taskContext.logger.info(`Running tests for fixture ${testCase}`);
        const absolutePathToWorkspace = AbsoluteFilePath.of(path.join(__dirname, FERN_DIRECTORY, testCase));
        const workspace = await loadWorkspace({
            absolutePathToWorkspace,
            context: taskContext,
            cliVersion: "DUMMY",
        });
        if (!workspace.didSucceed) {
            taskContext.logger.error(`Failed to load workspace for fixture ${testCase}`);
            continue;
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error(`Expected fixture ${testCase} to be a fern workspace. Found OpenAPI instead!`);
            continue;
        }
        const ir = await getIntermediateRepresentation({
            fernWorkspace: workspace.workspace,
            taskContext,
            generationLanguage: language,
            irVersion,
        });
        taskContext.logger.info(`Generated IR for fixture ${testCase} ${typeof ir}`);
        await runDockerForWorkspace({
            docker,
            workspace: workspace.workspace,
            language,
            taskContext,
            fixture: testCase,
            irVersion,
        });
    }
}

const ALL_AUDIENCES: Audiences = { type: "all" };

async function getIntermediateRepresentation({
    fernWorkspace,
    generationLanguage,
    irVersion,
    taskContext,
}: {
    fernWorkspace: FernWorkspace;
    generationLanguage: GenerationLanguage;
    irVersion: string | undefined;
    taskContext: TaskContext;
}): Promise<unknown> {
    const ir = await generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage,
        audiences: ALL_AUDIENCES,
    });
    if (irVersion != null) {
        return await migrateIntermediateRepresentationThroughVersion({
            intermediateRepresentation: ir,
            context: taskContext,
            version: irVersion,
        });
    }
    return ir;
}

const DUMMY_ORGANIZATION = "seed";

async function runDockerForWorkspace({
    fixture,
    docker,
    language,
    workspace,
    taskContext,
    irVersion,
}: {
    fixture: string;
    docker: ParsedDockerName;
    language: GenerationLanguage;
    workspace: FernWorkspace;
    taskContext: TaskContext;
    irVersion?: string;
}): Promise<void> {
    const absolutePathToOutput = AbsoluteFilePath.of(resolve(cwd(), "seed", fixture));
    const generatorGroup: GeneratorGroup = {
        groupName: "DUMMY",
        audiences: ALL_AUDIENCES,
        generators: [
            {
                name: docker.name,
                version: docker.version,
                config: undefined,
                outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles(),
                absolutePathToLocalOutput: absolutePathToOutput,
                language,
            },
        ],
        docs: undefined,
    };
    await runLocalGenerationForWorkspace({
        organization: DUMMY_ORGANIZATION,
        workspace,
        generatorGroup,
        keepDocker: true,
        context: taskContext,
        irOverrideVersion: irVersion,
    });
}
