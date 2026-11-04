import { readFile } from "node:fs/promises";
import { isRelativeServerUrl } from "@fern-api/lazy-fern-workspace";
import { CliError, TaskContext } from "@fern-api/task-context";
import type { SdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

/**
 * An MCP server calls the API at `servers[0].url`, so a relative address cannot work. A spec loaded from
 * a URL has it resolved against that URL; a local file has nothing to resolve against, so say what to
 * change here instead of failing later in the generator with `[metadata.baseUrl] Invalid url`.
 *
 * Skipped when `api.baseUrl` is set, or when overrides or overlays may change `servers`.
 */
export async function failOnRelativeMcpServerUrl({
    source,
    absoluteFilepath,
    sdkConfig,
    context
}: {
    source: { id: string; type: string; overrides?: string[]; overlays?: string[] } & (
        | { path: string }
        | { url: string }
    );
    absoluteFilepath: string;
    sdkConfig: SdkConfigV1;
    context: TaskContext;
}): Promise<void> {
    if (!sdkConfig.targets.some((target) => target.language === "mcp") || sdkConfig.api.baseUrl !== "") {
        return;
    }
    if (!("path" in source) || source.type !== "openapi") {
        return;
    }
    if ((source.overrides?.length ?? 0) > 0 || (source.overlays?.length ?? 0) > 0) {
        return;
    }
    const serverUrl = await readFirstServerUrl(absoluteFilepath);
    if (serverUrl == null || !isRelativeServerUrl(serverUrl)) {
        return;
    }
    return context.failAndThrow(
        `SDK Config source '${source.id}' has a relative servers URL ('${serverUrl}'), and an MCP server needs the full address of your API. Use the full address in servers, or set api.baseUrl in sdk-config.yml.`,
        undefined,
        { code: CliError.Code.ConfigError }
    );
}

async function readFirstServerUrl(absoluteFilepath: string): Promise<string | undefined> {
    let document: unknown;
    try {
        document = YAML.parse(await readFile(absoluteFilepath, "utf8"));
    } catch {
        // An unreadable or invalid spec is reported by the loader with a better message.
        return undefined;
    }
    if (typeof document !== "object" || document == null || !("servers" in document)) {
        return undefined;
    }
    const [first] = Array.isArray(document.servers) ? document.servers : [];
    return typeof first === "object" && first != null && "url" in first && typeof first.url === "string"
        ? first.url
        : undefined;
}
