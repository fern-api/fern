import { SNIPPET_JSON_FILENAME, SNIPPET_TEMPLATES_JSON_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getGeneratorConfig, getIntermediateRepresentation } from "@fern-api/local-workspace-runner";
import { LocalTaskHandler } from "@fern-api/local-workspace-runner/src/LocalTaskHandler";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import * as GeneratorExecSerialization from "@fern-fern/generator-exec-sdk/serialization";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { LocalBuildInfo } from "../../../config/api";
import { runScript } from "../../../runScript";
import { DUMMY_ORGANIZATION } from "../../../utils/constants";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation";
import { TestRunner } from "./TestRunner";

export class LocalTestRunner extends TestRunner {
    async build(): Promise<void> {
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

    async runGenerator({
        outputDir,
        taskContext,
        fernWorkspace,
        fixture,
        language,
        customConfig,
        publishConfig,
        outputMode,
        irVersion,
        publishMetadata,
        readme
    }: TestRunner.DoRunArgs): Promise<void> {
        const generatorConfigFile = await tmp.file();
        const absolutePathToGeneratorConfig = AbsoluteFilePath.of(generatorConfigFile.path);

        const irFile = await tmp.file();
        const absolutePathToIntermediateRepresentation = AbsoluteFilePath.of(irFile.path);

        const localOutputDirectory = await tmp.dir();
        const absolutePathToLocalOutputDirectory = AbsoluteFilePath.of(localOutputDirectory.path);

        const generatorInvocation = getGeneratorInvocation({
            absolutePathToOutput: absolutePathToLocalOutputDirectory,
            docker: this.getParsedDockerName(),
            language,
            customConfig,
            publishConfig,
            outputMode,
            fixtureName: fixture,
            irVersion,
            publishMetadata,
            readme
        });
        const ir = await getIntermediateRepresentation({
            workspace: fernWorkspace,
            audiences: {
                type: "all"
            },
            context: taskContext,
            irVersionOverride: irVersion,
            generatorInvocation
        });
        let generatorConfig = getGeneratorConfig({
            generatorInvocation,
            customConfig,
            workspaceName: fernWorkspace.definition.rootApiFile.contents.name,
            outputVersion: undefined,
            organization: DUMMY_ORGANIZATION,
            absolutePathToSnippetTemplates: AbsoluteFilePath.of(
                join(absolutePathToLocalOutputDirectory, RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME))
            ),
            writeUnitTests: true,
            generateOauthClients: true,
            generatePaginatedClients: true,
            absolutePathToSnippet: AbsoluteFilePath.of(
                join(absolutePathToLocalOutputDirectory, RelativeFilePath.of(SNIPPET_JSON_FILENAME))
            )
        }).config;
        generatorConfig = {
            ...generatorConfig,
            irFilepath: absolutePathToIntermediateRepresentation,
            output: {
                ...generatorConfig.output,
                path: absolutePathToLocalOutputDirectory,
                snippetTemplateFilepath: join(
                    absolutePathToLocalOutputDirectory,
                    RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME)
                ),
                snippetFilepath: join(absolutePathToLocalOutputDirectory, RelativeFilePath.of(SNIPPET_JSON_FILENAME))
            }
        };

        await writeFile(absolutePathToIntermediateRepresentation, JSON.stringify(ir, undefined, 4));
        taskContext.logger.info(`Wrote IR to ${absolutePathToIntermediateRepresentation}`);

        await writeFile(
            absolutePathToGeneratorConfig,
            JSON.stringify(await GeneratorExecSerialization.GeneratorConfig.jsonOrThrow(generatorConfig), undefined, 2)
        );
        taskContext.logger.info(`Wrote generator config to ${absolutePathToGeneratorConfig}`);

        const localConfig = await this.getLocalConfigOrthrow();
        const workingDir = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(localConfig.workingDirectory))
        );
        const result = await runScript({
            commands: [`${localConfig.runCommand} ${absolutePathToGeneratorConfig}`],
            doNotPipeOutput: false,
            logger: taskContext.logger,
            workingDir,
            env: localConfig.env ?? {}
        });
        if (result.exitCode !== 0) {
            taskContext.logger.info(`Failed to generate files for ${this.generator.workspaceName}.`);
        } else {
            const localTaskHandler: LocalTaskHandler = new LocalTaskHandler({
                context: taskContext,
                absolutePathToLocalOutput: outputDir,
                absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(localOutputDirectory.path),
                absolutePathToLocalSnippetJSON:
                    generatorConfig.output.snippetFilepath != null
                        ? AbsoluteFilePath.of(generatorConfig.output.snippetFilepath)
                        : undefined,
                absolutePathToLocalSnippetTemplateJSON:
                    generatorConfig.output.snippetTemplateFilepath != null
                        ? AbsoluteFilePath.of(generatorConfig.output.snippetTemplateFilepath)
                        : undefined,
                absolutePathToTmpSnippetJSON: join(outputDir, RelativeFilePath.of(SNIPPET_JSON_FILENAME)),
                absolutePathToTmpSnippetTemplatesJSON: join(
                    outputDir,
                    RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME)
                )
            });
            await localTaskHandler.copyGeneratedFiles();
            taskContext.logger.info(`Wrote generated files to ${outputDir}`);
        }
    }

    private async getLocalConfigOrthrow(): Promise<LocalBuildInfo> {
        if (this.generator.workspaceConfig.local == null) {
            throw new Error(
                `Attempted to run ${this.generator.workspaceName} locally. No local configuration in seed.yml found.`
            );
        }
        return this.generator.workspaceConfig.local;
    }
}
