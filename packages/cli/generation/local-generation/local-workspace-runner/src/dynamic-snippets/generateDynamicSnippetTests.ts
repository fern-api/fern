import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { DynamicSnippetsTestGenerator } from "./DynamicSnippetsTestGenerator";
import { generateDynamicSnippetsTestSuite } from "./generateDynamicSnippetsTestSuite";

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
