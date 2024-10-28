import { generateDynamicSnippetsTestSuite } from "@fern-api/dynamic-snippets";
import { Audiences } from "@fern-api/configuration";
import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DynamicSnippetsTestGenerator } from "./DynamicSnippetsTestGenerator";
import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

export async function generateDynamicSnippetTests({
    context,
    workspace,
    config,
    audiences,
    language,
    outputDir
}: {
    context: TaskContext;
    workspace: AbstractAPIWorkspace<unknown>;
    config: FernGeneratorExec.GeneratorConfig;
    audiences: Audiences;
    language: generatorsYml.GenerationLanguage;
    outputDir: AbsoluteFilePath;
}): Promise<void> {
    const testSuite = await generateDynamicSnippetsTestSuite({ workspace, config, audiences, language });
    return new DynamicSnippetsTestGenerator(context, testSuite).generateTests({ language, outputDir });
}
