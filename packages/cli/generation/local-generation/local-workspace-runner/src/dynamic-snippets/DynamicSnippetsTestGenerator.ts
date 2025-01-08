import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { DynamicSnippetsTestSuite } from "./DynamicSnippetsTestSuite";
import { DynamicSnippetsGoTestGenerator } from "./go/DynamicSnippetsGoTestGenerator";

export class DynamicSnippetsTestGenerator {
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
        switch (language) {
            case "go":
                return new DynamicSnippetsGoTestGenerator(
                    this.context,
                    this.testSuite.ir,
                    this.testSuite.config
                ).generateTests({
                    outputDir,
                    requests: this.testSuite.requests
                });
            default:
                this.context.logger.debug(`Skipping dynamic snippets test generation for language "${language}"`);
        }
    }
}
