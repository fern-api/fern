import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { CliCatalog, CliCatalogCommand, CliCatalogInput, CliCatalogInputLocation } from "./types.js";

const VALID_LOCATIONS: ReadonlySet<string> = new Set<CliCatalogInputLocation>(["path", "query", "header", "body"]);

/**
 * Validate and narrow a parsed JSON value into a {@link CliCatalog}. The catalog is a committed
 * artifact, so a malformed file is a hard error (not a silent skip) — the whole point of the
 * version/source stamp is that staleness is diagnosable.
 */
export function parseCliCatalog(raw: unknown): CliCatalog {
    if (typeof raw !== "object" || raw == null) {
        throw new Error("CLI catalog must be a JSON object.");
    }
    const obj = raw as Record<string, unknown>;
    if (obj.version !== 1) {
        throw new Error(`Unsupported CLI catalog version: ${String(obj.version)} (expected 1).`);
    }
    if (!Array.isArray(obj.commands)) {
        throw new Error("CLI catalog is missing a `commands` array.");
    }
    const commands = obj.commands.map((command, index) => parseCommand(command, index));
    return {
        version: 1,
        source: obj.source as CliCatalog["source"],
        commands
    };
}

function parseCommand(raw: unknown, index: number): CliCatalogCommand {
    if (typeof raw !== "object" || raw == null) {
        throw new Error(`CLI catalog command #${index} is not an object.`);
    }
    const obj = raw as Record<string, unknown>;
    if (!Array.isArray(obj.command) || obj.command.some((token) => typeof token !== "string")) {
        throw new Error(`CLI catalog command #${index} has an invalid \`command\` token array.`);
    }
    if (typeof obj.httpMethod !== "string" || obj.httpMethod.length === 0) {
        throw new Error(`CLI catalog command #${index} is missing \`httpMethod\`.`);
    }
    if (typeof obj.path !== "string" || obj.path.length === 0) {
        throw new Error(`CLI catalog command #${index} is missing \`path\`.`);
    }
    if (!Array.isArray(obj.inputs)) {
        throw new Error(`CLI catalog command #${index} is missing an \`inputs\` array.`);
    }
    return {
        command: obj.command as string[],
        operation: typeof obj.operation === "string" ? obj.operation : undefined,
        namespace: typeof obj.namespace === "string" ? obj.namespace : undefined,
        httpMethod: obj.httpMethod,
        path: obj.path,
        inputs: obj.inputs.map((input, inputIndex) => parseInput(input, index, inputIndex))
    };
}

function parseInput(raw: unknown, commandIndex: number, inputIndex: number): CliCatalogInput {
    if (typeof raw !== "object" || raw == null) {
        throw new Error(`CLI catalog command #${commandIndex} input #${inputIndex} is not an object.`);
    }
    const obj = raw as Record<string, unknown>;
    if (typeof obj.wireName !== "string" || obj.wireName.length === 0) {
        throw new Error(`CLI catalog command #${commandIndex} input #${inputIndex} is missing \`wireName\`.`);
    }
    if (typeof obj.location !== "string" || !VALID_LOCATIONS.has(obj.location)) {
        throw new Error(
            `CLI catalog command #${commandIndex} input #${inputIndex} has an invalid \`location\`: ${String(obj.location)}.`
        );
    }
    // `flag` is optional: absent means the runtime exposes this input only via `--params`.
    if (obj.flag != null && (typeof obj.flag !== "string" || obj.flag.length === 0)) {
        throw new Error(`CLI catalog command #${commandIndex} input #${inputIndex} has an invalid \`flag\`.`);
    }
    return {
        wireName: obj.wireName,
        location: obj.location as CliCatalogInputLocation,
        flag: typeof obj.flag === "string" ? obj.flag : undefined,
        path:
            Array.isArray(obj.path) && obj.path.every((segment) => typeof segment === "string")
                ? (obj.path as string[])
                : undefined,
        required: typeof obj.required === "boolean" ? obj.required : undefined,
        repeated: typeof obj.repeated === "boolean" ? obj.repeated : undefined
    };
}

/** Read and validate a catalog from disk. */
export async function loadCliCatalog(absolutePath: AbsoluteFilePath): Promise<CliCatalog> {
    const contents = await readFile(absolutePath, "utf-8");
    let parsed: unknown;
    try {
        parsed = JSON.parse(contents);
    } catch (error) {
        throw new Error(`CLI catalog at ${absolutePath} is not valid JSON: ${(error as Error).message}`);
    }
    return parseCliCatalog(parsed);
}

/** Case-insensitive `METHOD path` join key. */
function indexKey(method: string, path: string): string {
    return `${method.toUpperCase()} ${path}`;
}

export interface CliCatalogIndex {
    /**
     * Resolve the single command for an endpoint. When method+path map to more than one command,
     * `mappedNamespace` disambiguates; if it still resolves to zero or multiple, returns undefined
     * (the ambiguity was logged once at build time).
     */
    lookup(method: string, path: string, mappedNamespace?: string): CliCatalogCommand | undefined;
    /** Total number of commands in the catalog (coverage denominator help). */
    size: number;
}

/**
 * Build a lookup index keyed by method+path. The catalog is list-valued per key because a method+path
 * can collide across namespaces (e.g. Twilio's non-Core `iam POST /v1/token`). Ambiguous keys that no
 * namespace map can resolve are logged once and left unresolvable, so a silent mis-join can't happen.
 */
export function buildCatalogIndex(catalog: CliCatalog, context?: TaskContext): CliCatalogIndex {
    const byKey = new Map<string, CliCatalogCommand[]>();
    for (const command of catalog.commands) {
        const key = indexKey(command.httpMethod, command.path);
        const existing = byKey.get(key);
        if (existing != null) {
            existing.push(command);
        } else {
            byKey.set(key, [command]);
        }
    }

    for (const [key, commands] of byKey) {
        if (commands.length > 1) {
            const namespaces = commands.map((c) => c.namespace ?? "<none>");
            const distinct = new Set(namespaces);
            if (distinct.size < commands.length) {
                // Two commands share the same (namespace, method, path) — genuinely unresolvable.
                context?.logger.warn(
                    `CLI catalog has ambiguous command for ${key} ` +
                        `(namespaces: ${namespaces.join(", ")}); skipping CLI snippet for it.`
                );
            }
        }
    }

    const warnedKeys = new Set<string>();
    return {
        size: catalog.commands.length,
        lookup(method, path, mappedNamespace) {
            const key = indexKey(method, path);
            const candidates = byKey.get(key);
            if (candidates == null || candidates.length === 0) {
                return undefined;
            }
            if (candidates.length === 1) {
                return candidates[0];
            }
            if (mappedNamespace != null) {
                const scoped = candidates.filter((c) => c.namespace === mappedNamespace);
                if (scoped.length === 1) {
                    return scoped[0];
                }
            }
            // Multiple commands share this method+path and no namespace resolved to exactly one.
            // Refuse to guess, and log once so the skipped join is diagnosable rather than silent.
            if (!warnedKeys.has(key)) {
                warnedKeys.add(key);
                const namespaces = candidates.map((c) => c.namespace ?? "<none>").join(", ");
                context?.logger.warn(
                    `CLI catalog has ${candidates.length} commands for ${key} (namespaces: ${namespaces}); ` +
                        `${mappedNamespace != null ? `none matched namespace "${mappedNamespace}"` : "no namespace was provided"}. ` +
                        `Skipping CLI snippet for it.`
                );
            }
            return undefined;
        }
    };
}
