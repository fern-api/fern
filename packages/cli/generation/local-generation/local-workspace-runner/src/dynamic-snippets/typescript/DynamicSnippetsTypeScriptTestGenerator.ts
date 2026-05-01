import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { CliError, TaskContext } from "@fern-api/task-context";

import { DynamicSnippetsGenerator } from "@fern-api/typescript-dynamic-snippets";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { DynamicSnippetsTestRequest } from "../DynamicSnippetsTestSuite.js";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest.js";
import { convertIr } from "../utils/convertIr.js";

export class DynamicSnippetsTypeScriptTestGenerator {
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
            config: this.buildGeneratorConfig(this.generatorConfig)
        });
    }

    public async generateTests({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath;
        requests: DynamicSnippetsTestRequest[];
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...");
        for (const [idx, { endpointId, request }] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest, {
                    endpointId
                });
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
        return join(outputDir, RelativeFilePath.of(`src/dynamic-snippets/example${idx}/snippet.ts`));
    }

    /*
     * Builds a generator configuration that can be used to produce dynamic snippets within
     * the generated TypeScript SDK.
     */
    private buildGeneratorConfig(config: FernGeneratorExec.GeneratorConfig): FernGeneratorExec.GeneratorConfig {
        const outputMode = config.output.mode;
        if (outputMode.type !== "github") {
            throw new CliError({
                message: "GitHub output mode is required for TypeScript dynamic snippet tests",
                code: CliError.Code.ConfigError
            });
        }
        const publishInfo = outputMode.publishInfo;
        if (!publishInfo || publishInfo.type !== "npm") {
            throw new CliError({
                message: "NPM publish info is required for TypeScript dynamic snippet tests",
                code: CliError.Code.ConfigError
            });
        }
        return {
            ...config,
            output: {
                ...config.output,
                mode: {
                    ...outputMode,
                    publishInfo: {
                        ...publishInfo,
                        packageName: "../.."
                    }
                }
            }
        };
    }
}
