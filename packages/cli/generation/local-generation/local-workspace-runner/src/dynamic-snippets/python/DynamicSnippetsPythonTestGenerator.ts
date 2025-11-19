import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { DynamicSnippetsGenerator } from "@fern-api/python-dynamic-snippets";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

export class DynamicSnippetsPythonTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(
        private readonly context: TaskContext,
        private readonly ir: dynamic.DynamicIntermediateRepresentation,
        private readonly generatorConfig: FernGeneratorExec.GeneratorConfig
    ) {
        // Note: the local-workspace-runner uses convertIr which always returns a DynamicIntermediateRepresentation
        //       that is actually of the latest version in the workspace.
        //       (regardless of version that the dynamic IR is being asked for in the language-specific generator)
        //       This appears to have been always an additive change, so this hasn't broken anything
        //       In v61 we're adding support for more types for the response, which is a mutation of the interface.
        //       This really shouldn't break the language-specific dynamic code generator, because there was never
        //       a need to check the `type` of the response.
        //       In order to not force a version bump of the language-specific dynamic code generator,
        //       we're casting the IR to `as unknown as any` until the individual generators have updated
        //
        //       This doesn't really fix the underlying problem, where the local-workspace-runner is providing
        //       the latest IR to the language-specific dynamic code generator regardless.
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // biome-ignore lint/suspicious/noExplicitAny: workaround for version incompatibility - see note above
            ir: convertIr(this.ir) as unknown as any,
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
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest);
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
        return join(outputDir, RelativeFilePath.of(`dynamic-snippets/example${idx}/snippet.py`));
    }
}
