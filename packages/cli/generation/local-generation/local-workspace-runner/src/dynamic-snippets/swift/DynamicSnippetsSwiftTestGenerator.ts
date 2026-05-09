import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Style } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { DynamicSnippetsGenerator } from "@fern-api/swift-dynamic-snippets";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { DynamicSnippetsTestRequest } from "../DynamicSnippetsTestSuite.js";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest.js";
import { convertIr } from "../utils/convertIr.js";

export class DynamicSnippetsSwiftTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    public constructor(
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
        requests: DynamicSnippetsTestRequest[];
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...");
        const absolutePathToOutputDir = await this.initializeProject(outputDir);
        for (const [idx, { endpointId, request }] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest, {
                    config: {},
                    style: Style.Full,
                    endpointId
                });
                const dynamicSnippetFilePath = this.getTestFilePath({
                    absolutePathToOutputDir,
                    idx
                });
                await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true });
                await writeFile(dynamicSnippetFilePath, this.wrapSnippetAsLibrary(response.snippet, `Example${idx}`));
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                );
            }
        }
        this.context.logger.debug("Done generating dynamic snippet tests");
    }

    private async initializeProject(outputDir: AbsoluteFilePath): Promise<AbsoluteFilePath> {
        const absolutePathToOutputDir = join(outputDir, RelativeFilePath.of("Tests/Snippets"));
        await mkdir(absolutePathToOutputDir, { recursive: true });
        return absolutePathToOutputDir;
    }

    private getTestFilePath({
        absolutePathToOutputDir,
        idx
    }: {
        absolutePathToOutputDir: AbsoluteFilePath;
        idx: number;
    }): AbsoluteFilePath {
        return join(absolutePathToOutputDir, RelativeFilePath.of(`Example${idx}.swift`));
    }

    private wrapSnippetAsLibrary(snippet: string, enumName: string): string {
        return wrapSnippetAsLibrary({
            snippet,
            enumName,
            warn: (message) => this.context.logger.warn(message)
        });
    }
}

/**
 * Wraps a runnable snippet in an enum so it compiles as library code (part of the
 * test target) rather than a standalone executable. This prevents SPM from treating
 * each snippet file as a separate executable target while still validating that
 * every generated snippet compiles against the SDK.
 *
 * Assumes the snippet generator produces exactly:
 *   import ...
 *   private func main() async throws { <body> }
 *   try await main()
 * with nothing after the invocation. If the format changes, the guards below
 * will warn and fall back to writing the raw snippet.
 */
export function wrapSnippetAsLibrary({
    snippet,
    enumName,
    warn
}: {
    snippet: string;
    enumName: string;
    warn: (message: string) => void;
}): string {
    const FUNC_DECL = "private func main() async throws {";
    const FUNC_INVOCATION = "try await main()";

    if (!snippet.includes(FUNC_DECL)) {
        warn(`Snippet ${enumName} does not match expected format (missing '${FUNC_DECL}'). Writing raw snippet.`);
        return snippet;
    }

    const lines = snippet.trimEnd().split("\n");
    const result: string[] = [];
    let insideFunc = false;
    let foundInvocation = false;

    for (const line of lines) {
        if (line.trimEnd() === FUNC_DECL) {
            result.push(`enum ${enumName} {`);
            result.push("    static func snippet() async throws {");
            insideFunc = true;
        } else if (line.trimEnd() === FUNC_INVOCATION) {
            foundInvocation = true;
        } else if (insideFunc) {
            result.push(line === "" ? "" : `    ${line}`);
        } else {
            result.push(line);
        }
    }

    if (!foundInvocation) {
        warn(`Snippet ${enumName} missing expected '${FUNC_INVOCATION}'. Writing raw snippet.`);
        return snippet;
    }

    // Remove trailing empty lines before closing enum brace
    while (result.length > 0 && result[result.length - 1] === "") {
        result.pop();
    }
    result.push("}");
    result.push("");

    return result.join("\n");
}
