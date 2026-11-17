import { errorMessageOrString } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
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
    const entries: { zipPath: string; sourcePath: string; configKey: string }[] = [
        ...(generation.hooks != null
            ? [{ zipPath: "mcp/custom-hook.ts", sourcePath: generation.hooks.path, configKey: "hooks" }]
            : []),
        ...Object.entries(generation.customTools ?? {}).map(([name, tool]) => ({
            zipPath: `mcp/${tool.path}`,
            sourcePath: tool.path,
            configKey: `customTools.${name}`
        }))
    ];
    if (entries.length === 0) {
        return undefined;
    }

    const zip = new ZipFile();
    const seenZipPaths = new Set<string>();
    for (const { zipPath, sourcePath, configKey } of entries) {
        // `custom-hook.ts` is reserved for the hook; reject a custom tool whose path collides with it
        // (or any two modules that resolve to the same archive path), since the second would be lost.
        if (seenZipPaths.has(zipPath)) {
            throw new Error(
                `MCP custom code: ${configKey} ("${sourcePath}") maps to the archive path "${zipPath}", which is already used by another module. Custom-tool paths must be distinct and must not be "custom-hook.ts" (reserved for hooks).`
            );
        }
        seenZipPaths.add(zipPath);

        const absolute = join(projectRoot, RelativeFilePath.of(sourcePath));
        let contents: Buffer;
        try {
            contents = await readFile(absolute);
        } catch (error) {
            throw new Error(
                `MCP custom code: cannot read ${configKey} file "${sourcePath}" (resolved to ${absolute}). Make sure the path in your config is correct and the file is committed. (${errorMessageOrString(error)})`
            );
        }
        zip.addBuffer(contents, zipPath);
    }
    zip.end();
    return await collectStream(zip.outputStream);
}

/**
 * Narrows a generator's raw `config` (an MCP generator's `config:` block, typed `unknown`) to the
 * subset that references customer-authored files. Returns an empty config when nothing is declared,
 * so callers can feed the result straight into {@link collectMcpCustomCode} (which no-ops on empty).
 */
export function extractMcpCustomCodeConfig(config: unknown): McpCustomCodeConfig {
    const result: McpCustomCodeConfig = {};
    if (typeof config !== "object" || config == null) {
        return result;
    }
    const record = config as Record<string, unknown>;

    const hooks = record.hooks;
    if (hasStringPath(hooks)) {
        result.hooks = { path: hooks.path };
    }

    const customTools = record.customTools;
    if (typeof customTools === "object" && customTools != null) {
        const tools: Record<string, { path: string }> = {};
        for (const [name, value] of Object.entries(customTools as Record<string, unknown>)) {
            if (hasStringPath(value)) {
                tools[name] = { path: value.path };
            }
        }
        if (Object.keys(tools).length > 0) {
            result.customTools = tools;
        }
    }

    return result;
}

/**
 * Reads the MCP custom-code config from a serialized SDK Config v1 document (the per-target build
 * payload body). This is the uniform source across both build paths — the explicit `sdk-config.yml`
 * flow and the synthesized `generators.yml` (hosted-MCP) flow both serialize a single-target document
 * here, with the custom tools/hooks under the target's (or root) `generation`. Returns an empty
 * config when the body isn't parseable or declares none.
 */
export function extractMcpCustomCodeFromSdkConfigBody(body: Buffer): McpCustomCodeConfig {
    let document: unknown;
    try {
        document = JSON.parse(body.toString("utf8"));
    } catch {
        return {};
    }
    if (typeof document !== "object" || document == null) {
        return {};
    }
    const doc = document as Record<string, unknown>;
    const targets = Array.isArray(doc.targets) ? doc.targets : [];
    const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value != null;
    // Prefer the MCP target explicitly (a multi-target document could order it after another); fall
    // back to the sole target (the per-target payload body is single-target in practice).
    const target =
        targets.find(
            (candidate): candidate is Record<string, unknown> => isObject(candidate) && candidate.language === "mcp"
        ) ?? (isObject(targets[0]) ? targets[0] : undefined);
    const rootGeneration = typeof doc.generation === "object" && doc.generation != null ? doc.generation : {};
    const targetGeneration =
        target != null && typeof target.generation === "object" && target.generation != null ? target.generation : {};
    // Target generation wins over root, matching how the generator merges them.
    return extractMcpCustomCodeConfig({ ...rootGeneration, ...targetGeneration });
}

function hasStringPath(value: unknown): value is { path: string } {
    return typeof value === "object" && value != null && typeof (value as Record<string, unknown>).path === "string";
}

function collectStream(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}
