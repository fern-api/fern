import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFileSync } from "fs";
import { ZipFile } from "yazl";

/**
 * The subset of an MCP target's generation config that references customer-authored source files.
 * Both paths are relative to the Fern project root and are schema-validated by `@postman/sdk-config`
 * (`relativePathSchema`: no absolute paths, no `..` segments) before they reach here.
 */
export interface McpCustomCodeConfig {
    /** Hand-written tools, keyed by tool name, each a module exporting `definition` + `handler`. */
    customTools?: Record<string, { path: string }>;
    /** A module exporting the request/response hooks (`beforeRequest`/`afterResponse`/`onError`/`transformResult`). */
    hooks?: { path: string };
}

/**
 * Packages an MCP target's custom-tool modules and hook module into a zip whose internal layout is
 * exactly what the generator resolves against its delivered source directory: `mcp/custom-hook.ts`
 * for the hook, and `mcp/<customTools[].path>` for each custom tool. sdk-gen-api uploads this zip to
 * S3 and supplies it as the build's `hooksLocation`; the generator extracts it under
 * `/tmp/resources/hooks/mcp` and emits the files into `src/hooks.ts` and `src/tools/<name>.ts`.
 *
 * Returns `undefined` when the target declares no custom code (nothing to upload).
 */
export async function collectMcpCustomCode(
    generation: McpCustomCodeConfig,
    projectRoot: AbsoluteFilePath
): Promise<Buffer | undefined> {
    const entries: { zipPath: string; sourcePath: string }[] = [
        ...(generation.hooks != null
            ? [{ zipPath: "mcp/custom-hook.ts", sourcePath: generation.hooks.path }]
            : []),
        ...Object.values(generation.customTools ?? {}).map((tool) => ({
            zipPath: `mcp/${tool.path}`,
            sourcePath: tool.path
        }))
    ];
    if (entries.length === 0) {
        return undefined;
    }

    const zip = new ZipFile();
    for (const { zipPath, sourcePath } of entries) {
        const absolute = join(projectRoot, RelativeFilePath.of(sourcePath));
        zip.addBuffer(readFileSync(absolute), zipPath);
    }
    zip.end();
    return await collectStream(zip.outputStream);
}

function collectStream(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}
