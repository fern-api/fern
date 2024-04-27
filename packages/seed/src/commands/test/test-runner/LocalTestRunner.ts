import { SNIPPET_JSON_FILENAME, SNIPPET_TEMPLATES_JSON_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LocalTaskHandler } from "@fern-api/local-workspace-runner/src/LocalTaskHandler";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { LocalBuildInfo } from "../../../config/api";
import { runScript } from "../../../runScript";
import { INPUTS_DIRECTORY_NAME } from "../../../utils/constants";
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
            workingDir: workingDir
        });
        if (result.exitCode !== 0) {
            throw new Error(`Failed to locally build ${this.generator.workspaceName}.`);
        }
    }

    async runGenerator({ outputDir, taskContext }: TestRunner.DoRunArgs): Promise<void> {
        const localConfig = await this.getLocalConfigOrthrow();
        const localOutputDirectory = await tmp.dir();
        const localGeneratorConfigFile = await tmp.file();
        const generatorConfig = await this.getLocalGeneratorConfig({
            outputDir,
            localOutputDir: AbsoluteFilePath.of(localOutputDirectory.path)
        });
        await writeFile(localGeneratorConfigFile.path, JSON.stringify(generatorConfig, undefined, 2));
        taskContext.logger.info(`Wrote generator config to ${localGeneratorConfigFile.path}`);

        const workingDir = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(localConfig.workingDirectory))
        );
        const result = await runScript({
            commands: [`${localConfig.runCommand} ${localGeneratorConfigFile.path}`],
            doNotPipeOutput: false,
            logger: taskContext.logger,
            workingDir: workingDir,
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
                absolutePathToLocalSnippetTemplateJSON: join(
                    outputDir,
                    RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME)
                ),
                absolutePathToTmpSnippetJSON: join(outputDir, RelativeFilePath.of(SNIPPET_JSON_FILENAME)),
                absolutePathToTmpSnippetTemplatesJSON:
                    generatorConfig.output.snippetTemplateFilepath != null
                        ? AbsoluteFilePath.of(generatorConfig.output.snippetTemplateFilepath)
                        : undefined
            });
            await localTaskHandler.copyGeneratedFiles();
            taskContext.logger.info(`Wrote generated files to ${outputDir}`);
        }
    }

    /**
     * A local generator config is written with modified paths to
     * the IR and output directories to match the user's machine.
     *
     * For example, instead of the ir living at `/fern/input/ir.json` it may live at
     * `/Users/<username>/fern/seed/csharp/imdb/.inputs/ir.json`.
     */
    private async getLocalGeneratorConfig({
        outputDir,
        localOutputDir
    }: {
        outputDir: AbsoluteFilePath;
        localOutputDir: AbsoluteFilePath;
    }): Promise<FernGeneratorExec.GeneratorConfig> {
        const absoluteFilepathToGeneratorConfig = join(
            outputDir,
            RelativeFilePath.of(INPUTS_DIRECTORY_NAME),
            RelativeFilePath.of("config.json")
        );
        const rawContents = await readFile(absoluteFilepathToGeneratorConfig, "utf8");
        const generatorConfig = JSON.parse(rawContents) as FernGeneratorExec.GeneratorConfig;
        return {
            ...generatorConfig,
            irFilepath: join(outputDir, RelativeFilePath.of(INPUTS_DIRECTORY_NAME), RelativeFilePath.of("ir.json")),
            output: {
                ...generatorConfig.output,
                path: localOutputDir,
                snippetFilepath: join(localOutputDir, RelativeFilePath.of(SNIPPET_JSON_FILENAME))
            }
        };
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
