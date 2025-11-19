import { generatorsYml } from "@fern-api/configuration";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { runNativeGenerationForSeed } from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import path from "path";
import { LocalBuildInfo } from "../../../config/api";
import { runScript } from "../../../runScript";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../../utils/constants";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation";
import { TestRunner } from "./TestRunner";

export class LocalTestRunner extends TestRunner {
    public async build(): Promise<void> {
        const localConfig = await this.getLocalConfigOrthrow();
        const workingDir = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(localConfig.workingDirectory))
        );
        const result = await runScript({
            commands: localConfig.buildCommand,
            doNotPipeOutput: false,
            logger: CONSOLE_LOGGER,
            workingDir
        });
        if (result.exitCode !== 0) {
            throw new Error(`Failed to locally build ${this.generator.workspaceName}.`);
        }
    }

    protected async runGenerator(args: Parameters<TestRunner["runGenerator"]>[0]): Promise<void> {
        const localConfig = await this.getLocalConfigOrthrow();
        const commands = Array.isArray(localConfig.runCommand) ? localConfig.runCommand : [localConfig.runCommand];
        await this.runGeneratorLocal(args, commands);
    }

    private async runGeneratorLocal(
        args: Parameters<TestRunner["runGenerator"]>[0],
        commands: string[]
    ): Promise<void> {
        const {
            absolutePathToFernDefinition,
            fernWorkspace,
            outputDir,
            fixture,
            taskContext,
            selectAudiences,
            outputVersion,
            language,
            customConfig,
            publishConfig,
            outputMode,
            irVersion,
            publishMetadata,
            readme,
            shouldGenerateDynamicSnippetTests,
            inspect = false,
            license
        } = args;

        const generatorGroup: generatorsYml.GeneratorGroup = {
            groupName: "test",
            reviewers: undefined,
            audiences:
                selectAudiences != null ? { type: "select" as const, audiences: selectAudiences } : ALL_AUDIENCES,
            generators: [
                await getGeneratorInvocation({
                    absolutePathToOutput: outputDir,
                    docker: this.getParsedDockerImageName(),
                    language,
                    customConfig,
                    publishConfig,
                    outputMode,
                    fixtureName: fixture,
                    irVersion,
                    publishMetadata,
                    readme,
                    license
                })
            ]
        };

        await runNativeGenerationForSeed(
            {
                organization: DUMMY_ORGANIZATION,
                absolutePathToFernConfig: absolutePathToFernDefinition,
                workspace: fernWorkspace,
                generatorGroup,
                context: taskContext,
                irVersionOverride: irVersion,
                outputVersionOverride: outputVersion,
                shouldGenerateDynamicSnippetTests,
                skipUnstableDynamicSnippetTests: true,
                inspect,
                ai: undefined
            },
            commands,
            this.generator.workspaceConfig.test.local?.workingDirectory
        );
    }

    private async getLocalConfigOrthrow(): Promise<LocalBuildInfo> {
        if (this.generator.workspaceConfig.test.local == null) {
            throw new Error(
                `Attempted to run ${this.generator.workspaceName} locally. No local configuration in seed.yml found.`
            );
        }
        return this.generator.workspaceConfig.test.local;
    }
}
