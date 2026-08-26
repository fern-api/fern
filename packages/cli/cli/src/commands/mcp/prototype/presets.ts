import { EndpointSummary } from "./openapiSummary.js";
import { computeVerdict, resolveTools, ToolsConfig, Verdict } from "./toolset.js";

export type BuiltinPresetKey = "read-only" | "main-resources" | "everything";

export const BUILTIN_PRESET_KEYS: BuiltinPresetKey[] = ["read-only", "main-resources", "everything"];

export interface PresetResolution {
    key: BuiltinPresetKey;
    label: string;
    config: ToolsConfig;
    verdict: Verdict;
    available: boolean;
    unavailableReason?: string;
    notes: string[];
}

const READ_LIKE_OPERATION_PATTERN = /^(list|search|query|find|lookup|fetch|read|get)[_\-A-Z]?/;
const READ_LIKE_PATH_SEGMENTS = new Set(["search", "query", "list", "lookup"]);
const AMBIGUOUS_READ_PATTERN = /(search|query|list|find|lookup)/i;
const EXCLUDED_TAG_PATTERN = /(admin|internal|webhook|legacy|deprecated|beta|debug|test)/i;

function lastPathSegment(endpointPath: string): string {
    const segments = endpointPath.split("/").filter((segment) => segment.length > 0);
    return segments[segments.length - 1] ?? "";
}

export function isReadLikePost(endpoint: EndpointSummary): boolean {
    if (endpoint.method !== "POST") {
        return false;
    }
    if (endpoint.operationId != null && READ_LIKE_OPERATION_PATTERN.test(endpoint.operationId)) {
        return true;
    }
    if (endpoint.summary != null && READ_LIKE_OPERATION_PATTERN.test(endpoint.summary.toLowerCase())) {
        return true;
    }
    return READ_LIKE_PATH_SEGMENTS.has(lastPathSegment(endpoint.path).toLowerCase());
}

export function isAmbiguousReadPost(endpoint: EndpointSummary): boolean {
    if (endpoint.method !== "POST" || isReadLikePost(endpoint)) {
        return false;
    }
    const haystack = `${endpoint.operationId ?? ""} ${endpoint.summary ?? ""}`;
    return AMBIGUOUS_READ_PATTERN.test(haystack);
}

export function buildReadOnlyPreset(endpoints: EndpointSummary[]): PresetResolution {
    const readLikePosts = endpoints.filter(isReadLikePost);
    const ambiguousPosts = endpoints.filter(isAmbiguousReadPost);
    const config: ToolsConfig = {
        include: [
            { method: "GET" },
            ...readLikePosts.map((endpoint) => ({ endpoint: `${endpoint.method} ${endpoint.path}` }))
        ]
    };
    const notes: string[] = [];
    if (readLikePosts.length > 0) {
        notes.push(`${readLikePosts.length} read-like POST endpoint(s) included (search/query/list behind POST)`);
    }
    if (ambiguousPosts.length > 0) {
        notes.push(
            `${ambiguousPosts.length} ambiguous read-like POST endpoint(s) excluded — review with fern mcp tools`
        );
    }
    return {
        key: "read-only",
        label: "Read-only — lookups and searches, nothing that writes",
        config,
        verdict: computeVerdict(resolveTools(endpoints, config)),
        available: true,
        notes
    };
}

interface TagStats {
    tag: string;
    endpointCount: number;
    methodVariety: number;
}

function rankTags(endpoints: EndpointSummary[]): TagStats[] {
    const byTag = new Map<string, EndpointSummary[]>();
    for (const endpoint of endpoints) {
        for (const tag of endpoint.tags) {
            const existing = byTag.get(tag) ?? [];
            existing.push(endpoint);
            byTag.set(tag, existing);
        }
    }
    return [...byTag.entries()]
        .map(([tag, tagged]) => ({
            tag,
            endpointCount: tagged.length,
            methodVariety: new Set(tagged.map((endpoint) => endpoint.method)).size
        }))
        .sort((a, b) => b.endpointCount + b.methodVariety * 2 - (a.endpointCount + a.methodVariety * 2));
}

export function buildMainResourcesPreset(endpoints: EndpointSummary[]): PresetResolution {
    const ranked = rankTags(endpoints);
    const usable = ranked.filter((stats) => !EXCLUDED_TAG_PATTERN.test(stats.tag));
    const excluded = ranked.filter((stats) => EXCLUDED_TAG_PATTERN.test(stats.tag));
    if (usable.length === 0) {
        return {
            key: "main-resources",
            label: "Main resources — unavailable",
            config: {},
            verdict: computeVerdict([]),
            available: false,
            unavailableReason: "spec lacks tags — use AI-curated or trim by path prefix instead",
            notes: []
        };
    }
    const primary = usable.slice(0, 3);
    const config: ToolsConfig = {
        include: primary.map((stats) => ({ tag: stats.tag })),
        exclude: excluded.length > 0 ? excluded.map((stats) => ({ tag: stats.tag })) : undefined
    };
    const resourceNames = primary.map((stats) => stats.tag).join(", ");
    const notes = excluded.length > 0 ? [`excluded tags: ${excluded.map((stats) => stats.tag).join(", ")}`] : [];
    return {
        key: "main-resources",
        label: `Main resources — ${resourceNames} (detected from your spec)`,
        config,
        verdict: computeVerdict(resolveTools(endpoints, config)),
        available: true,
        notes
    };
}

export function buildEverythingPreset(endpoints: EndpointSummary[]): PresetResolution {
    const config: ToolsConfig = {};
    return {
        key: "everything",
        label: `Everything — all ${endpoints.length} endpoints`,
        config,
        verdict: computeVerdict(resolveTools(endpoints, config)),
        available: true,
        notes: []
    };
}

export function buildBuiltinPresets(endpoints: EndpointSummary[]): Record<BuiltinPresetKey, PresetResolution> {
    return {
        "read-only": buildReadOnlyPreset(endpoints),
        "main-resources": buildMainResourcesPreset(endpoints),
        everything: buildEverythingPreset(endpoints)
    };
}
