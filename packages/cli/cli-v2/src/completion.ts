import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { resolve } from "path";

/**
 * Returns true when the CLI is being invoked for shell completion
 * (i.e. the user pressed TAB). This is used to skip heavy
 * initialisation (telemetry, Sentry, network calls) so that
 * completions are fast and side-effect-free.
 */
export function isCompletionMode(argv?: string[]): boolean {
    const args = argv ?? process.argv;
    return args.includes("--get-yargs-completions");
}

/**
 * Lightweight fern.yml reader used exclusively during shell completion.
 *
 * Walks up from `cwd` looking for `fern.yml`, parses it as plain YAML
 * (no Zod validation, no $ref resolution) and extracts the values
 * needed for content-aware flag completion.
 */
export async function getCompletionValues(cwd: string): Promise<CompletionValues> {
    const raw = await readFernYmlRaw(cwd);
    if (raw == null) {
        return { groups: [], apis: [], instances: [] };
    }

    const groups = extractGroups(raw);
    const apis = extractApis(raw);
    const instances = extractInstances(raw);

    return { groups, apis, instances };
}

export interface CompletionValues {
    groups: string[];
    apis: string[];
    instances: string[];
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

interface RawFernYml {
    sdks?: {
        defaultGroup?: string;
        targets?: Record<string, { group?: string[] }>;
    };
    apis?: Record<string, unknown>;
    api?: unknown;
    docs?:
        | {
              instances?: Array<{ url?: string }>;
          }
        | string;
}

function isRawFernYml(value: unknown): value is RawFernYml {
    return value != null && typeof value === "object";
}

/**
 * Walk up from `start` looking for fern.yml and parse it as untyped YAML.
 * Returns undefined if not found or unparseable.
 */
async function readFernYmlRaw(start: string): Promise<RawFernYml | undefined> {
    let dir = start;
    for (let i = 0; i < 50; i++) {
        const candidate = resolve(dir, "fern.yml");
        try {
            const content = await readFile(candidate, "utf-8");
            const parsed = yaml.load(content);
            if (isRawFernYml(parsed)) {
                return parsed;
            }
            // file found but not an object — continue walking up
        } catch {
            // file not found or unreadable — walk up
        }
        const parent = resolve(dir, "..");
        if (parent === dir) {
            break;
        }
        dir = parent;
    }
    return undefined;
}

/**
 * Collect all unique group names from sdks.targets[*].group[].
 */
function extractGroups(raw: RawFernYml): string[] {
    const groups = new Set<string>();
    if (raw.sdks?.targets != null) {
        for (const target of Object.values(raw.sdks.targets)) {
            if (Array.isArray(target?.group)) {
                for (const g of target.group) {
                    if (typeof g === "string") {
                        groups.add(g);
                    }
                }
            }
        }
    }
    return [...groups].sort();
}

/**
 * Collect API names from the `apis` map (keys) or return ["api"] for
 * single-API projects that use the `api` key.
 */
function extractApis(raw: RawFernYml): string[] {
    if (raw.apis != null && typeof raw.apis === "object") {
        return Object.keys(raw.apis).sort();
    }
    if (raw.api != null) {
        return ["api"];
    }
    return [];
}

/**
 * Collect docs instance URLs.
 */
function extractInstances(raw: RawFernYml): string[] {
    if (raw.docs == null || typeof raw.docs === "string") {
        return [];
    }
    if (!Array.isArray(raw.docs.instances)) {
        return [];
    }
    return raw.docs.instances.flatMap((inst) => (typeof inst?.url === "string" ? [inst.url] : []));
}
