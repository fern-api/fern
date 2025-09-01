import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Style } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { DynamicSnippetsGenerator } from "@fern-api/swift-dynamic-snippets";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

export class DynamicSnippetsSwiftTestGenerator {
  private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

  public constructor(
    private readonly context: TaskContext,
    private readonly ir: dynamic.DynamicIntermediateRepresentation,
    private readonly generatorConfig: FernGeneratorExec.GeneratorConfig,
  ) {
    this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
      ir: convertIr(this.ir),
      config: this.generatorConfig,
    });
  }

  public async generateTests({
    outputDir,
    requests,
  }: {
    outputDir: AbsoluteFilePath;
    requests: dynamic.EndpointSnippetRequest[];
  }): Promise<void> {
    this.context.logger.debug("Generating dynamic snippet tests...");
    const absolutePathToOutputDir = await this.initializeProject(outputDir);
    for (const [idx, request] of requests.entries()) {
      try {
        const convertedRequest = convertDynamicEndpointSnippetRequest(request);
        if (convertedRequest == null) {
          continue;
        }
        const response = await this.dynamicSnippetsGenerator.generate(
          convertedRequest,
          {
            config: {},
            style: Style.Full,
          },
        );
        const dynamicSnippetFilePath = this.getTestFilePath({
          absolutePathToOutputDir,
          idx,
        });
        await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true });
        await writeFile(dynamicSnippetFilePath, response.snippet);
      } catch (error) {
        this.context.logger.error(
          `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`,
        );
      }
    }
    this.context.logger.debug("Done generating dynamic snippet tests");
  }

  private async initializeProject(
    outputDir: AbsoluteFilePath,
  ): Promise<AbsoluteFilePath> {
    const absolutePathToOutputDir = join(
      outputDir,
      RelativeFilePath.of("Snippets"),
    );
    await mkdir(absolutePathToOutputDir, { recursive: true });
    return absolutePathToOutputDir;
  }

  private getTestFilePath({
    absolutePathToOutputDir,
    idx,
  }: {
    absolutePathToOutputDir: AbsoluteFilePath;
    idx: number;
  }): AbsoluteFilePath {
    return join(
      absolutePathToOutputDir,
      RelativeFilePath.of(`Example${idx}.swift`),
    );
  }
}
