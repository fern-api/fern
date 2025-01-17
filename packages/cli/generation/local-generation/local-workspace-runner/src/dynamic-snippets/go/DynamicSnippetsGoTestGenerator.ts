import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { convertDynamicEndpointSnippetRequest } from "../utils/convertDynamicEndpointSnippetRequest";

export class DynamicSnippetsGoTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(
        private readonly context: TaskContext,
        private readonly ir: dynamic.DynamicIntermediateRepresentation,
        private readonly generatorConfig: FernGeneratorExec.GeneratorConfig
    ) {
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: this.ir,
            config: this.generatorConfig
        });
    }

    public async generateTests({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath;
        requests: dynamic.EndpointSnippetRequest[];
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...");
        for (const [idx, request] of requests.entries()) {
            try {
                const response = await this.dynamicSnippetsGenerator.generate(
                    convertDynamicEndpointSnippetRequest(request)
                );
                const dynamicSnippetFilePath = this.getTestFilePath({ outputDir, idx });
                await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true });
                await writeFile(dynamicSnippetFilePath, response.snippet);
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                );
            }
        }
        this.context.logger.debug("Done generating dynamic snippet tests");
    }

    private getTestFilePath({ outputDir, idx }: { outputDir: AbsoluteFilePath; idx: number }): AbsoluteFilePath {
        return join(outputDir, RelativeFilePath.of(`dynamic-snippets/example${idx}/snippet.go`));
    }
}
