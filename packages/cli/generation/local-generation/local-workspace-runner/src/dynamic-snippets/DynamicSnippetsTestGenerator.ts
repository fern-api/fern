import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { DynamicSnippetsTestSuite } from "./DynamicSnippetsTestSuite";
import { DynamicSnippetsCsharpTestGenerator } from "./csharp/DynamicSnippetsCsharpTestGenerator";
import { DynamicSnippetsGoTestGenerator } from "./go/DynamicSnippetsGoTestGenerator";
import { DynamicSnippetsJavaTestGenerator } from "./java/DynamicSnippetsJavaTestGenerator";
import { DynamicSnippetsPhpTestGenerator } from "./php/DynamicSnippetsPhpTestGenerator";
import { DynamicSnippetsTypeScriptTestGenerator } from "./typescript/DynamicSnippetsTypeScriptTestGenerator";

interface DynamicSnippetsGenerator {
    new (
        context: TaskContext,
        ir: dynamic.DynamicIntermediateRepresentation,
        config: FernGeneratorExec.GeneratorConfig
    ): {
        generateTests(params: {
            outputDir: AbsoluteFilePath;
            requests: dynamic.EndpointSnippetRequest[];
        }): Promise<void>;
    };
}

export class DynamicSnippetsTestGenerator {
    private static readonly GENERATORS: Record<generatorsYml.GenerationLanguage, DynamicSnippetsGenerator | undefined> =
        {
            csharp: DynamicSnippetsCsharpTestGenerator,
            go: DynamicSnippetsGoTestGenerator,
            java: DynamicSnippetsJavaTestGenerator,
            php: DynamicSnippetsPhpTestGenerator,
            typescript: undefined, // TODO: Re-enable dynamic snippet tests when example generation is resolved.
            python: undefined,
            ruby: undefined,
            swift: undefined
        };

    constructor(
        private readonly context: TaskContext,
        private readonly testSuite: DynamicSnippetsTestSuite
    ) {}

    public async generateTests({
        outputDir,
        language
    }: {
        outputDir: AbsoluteFilePath;
        language: generatorsYml.GenerationLanguage;
    }): Promise<void> {
        const generator = DynamicSnippetsTestGenerator.GENERATORS[language];
        if (generator == null) {
            this.context.logger.debug(`Skipping dynamic snippets test generation for language "${language}"`);
            return;
        }
        return new generator(this.context, this.testSuite.ir, this.testSuite.config).generateTests({
            outputDir,
            requests: this.testSuite.requests
        });
    }
}
