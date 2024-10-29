import { generateDynamicSnippetsTestSuite } from "@fern-api/dynamic-snippets";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DynamicSnippetsTestGenerator } from "./DynamicSnippetsTestGenerator";
import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";

export async function generateDynamicSnippetTests({
    context,
    ir,
    config,
    language,
    outputDir
}: {
    context: TaskContext;
    ir: IntermediateRepresentation;
    config: FernGeneratorExec.GeneratorConfig;
    language: generatorsYml.GenerationLanguage;
    outputDir: AbsoluteFilePath;
}): Promise<void> {
    const testSuite = await generateDynamicSnippetsTestSuite({ ir, config });
    return new DynamicSnippetsTestGenerator(context, testSuite).generateTests({ language, outputDir });
}
