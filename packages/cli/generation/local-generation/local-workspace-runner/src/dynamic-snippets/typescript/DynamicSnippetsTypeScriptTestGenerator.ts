import { mkdir, writeFile } from "fs/promises"
import path from "path"

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils"
import { dynamic } from "@fern-api/ir-sdk"
import { TaskContext } from "@fern-api/task-context"
import { DynamicSnippetsGenerator } from "@fern-api/typescript-dynamic-snippets"

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk"

import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest"
import { convertIr } from "../utils/convertIr"

export class DynamicSnippetsTypeScriptTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator

    constructor(
        private readonly context: TaskContext,
        private readonly ir: dynamic.DynamicIntermediateRepresentation,
        private readonly generatorConfig: FernGeneratorExec.GeneratorConfig
    ) {
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(this.ir),
            config: this.buildGeneratorConfig(this.generatorConfig)
        })
    }

    public async generateTests({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath
        requests: dynamic.EndpointSnippetRequest[]
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...")
        for (const [idx, request] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request)
                if (convertedRequest == null) {
                    continue
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest)
                const dynamicSnippetFilePath = this.getTestFilePath({ outputDir, idx })
                await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true })
                await writeFile(dynamicSnippetFilePath, response.snippet)
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                )
            }
        }
        this.context.logger.debug("Done generating dynamic snippet tests")
    }

    private getTestFilePath({ outputDir, idx }: { outputDir: AbsoluteFilePath; idx: number }): AbsoluteFilePath {
        return join(outputDir, RelativeFilePath.of(`src/dynamic-snippets/example${idx}/snippet.ts`))
    }

    /*
     * Builds a generator configuration that can be used to produce dynamic snippets within
     * the generated TypeScript SDK.
     */
    private buildGeneratorConfig(config: FernGeneratorExec.GeneratorConfig): FernGeneratorExec.GeneratorConfig {
        const outputMode = config.output.mode
        if (outputMode.type !== "github") {
            throw new Error("GitHub output mode is required for TypeScript dynamic snippet tests")
        }
        const publishInfo = outputMode.publishInfo
        if (!publishInfo || publishInfo.type !== "npm") {
            throw new Error("NPM publish info is required for TypeScript dynamic snippet tests")
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
        }
    }
}
