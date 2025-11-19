import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { DynamicSnippetsCsharpTestGenerator } from "./csharp/DynamicSnippetsCsharpTestGenerator";
import { DynamicSnippetsTestSuite } from "./DynamicSnippetsTestSuite";
import { DynamicSnippetsGoTestGenerator } from "./go/DynamicSnippetsGoTestGenerator";
import { DynamicSnippetsJavaTestGenerator } from "./java/DynamicSnippetsJavaTestGenerator";
import { DynamicSnippetsPhpTestGenerator } from "./php/DynamicSnippetsPhpTestGenerator";
import { DynamicSnippetsPythonTestGenerator } from "./python/DynamicSnippetsPythonTestGenerator";
import { DynamicSnippetsRubyTestGenerator } from "./ruby/DynamicSnippetsRubyTestGenerator";
import { DynamicSnippetsRustTestGenerator } from "./rust/DynamicSnippetsRustTestGenerator";
import { DynamicSnippetsSwiftTestGenerator } from "./swift/DynamicSnippetsSwiftTestGenerator";
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

type GeneratorConfig = {
    // Represents unstable generators due to example generation issues, which
    // shouldn't be run in certain environments.
    unstable?: boolean;

    // The generator to use for this language.
    generator: DynamicSnippetsGenerator;
};

export class DynamicSnippetsTestGenerator {
    private static readonly GENERATORS: Record<generatorsYml.GenerationLanguage, GeneratorConfig | undefined> = {
        csharp: { generator: DynamicSnippetsCsharpTestGenerator },
        go: { generator: DynamicSnippetsGoTestGenerator },
        java: { generator: DynamicSnippetsJavaTestGenerator },
        php: { generator: DynamicSnippetsPhpTestGenerator },

        // TODO: Re-enable dynamic snippet tests when example generation is resolved.
        typescript: { generator: DynamicSnippetsTypeScriptTestGenerator, unstable: true },
        python: { generator: DynamicSnippetsPythonTestGenerator },
        ruby: { generator: DynamicSnippetsRubyTestGenerator },
        rust: { generator: DynamicSnippetsRustTestGenerator },
        swift: { generator: DynamicSnippetsSwiftTestGenerator }
    };

    constructor(
        private readonly context: TaskContext,
        private readonly testSuite: DynamicSnippetsTestSuite
    ) {}

    public async generateTests({
        outputDir,
        language,
        skipUnstable
    }: {
        outputDir: AbsoluteFilePath;
        language: generatorsYml.GenerationLanguage;
        skipUnstable?: boolean;
    }): Promise<void> {
        const config = DynamicSnippetsTestGenerator.GENERATORS[language];
        if (config == null || (config.unstable && skipUnstable)) {
            this.context.logger.debug(`Skipping dynamic snippets test generation for language "${language}"`);
            return;
        }
        return new config.generator(this.context, this.testSuite.ir, this.testSuite.config).generateTests({
            outputDir,
            requests: this.testSuite.requests
        });
    }
}
