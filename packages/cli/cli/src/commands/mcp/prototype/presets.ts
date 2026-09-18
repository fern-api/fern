import { EndpointSummary } from "./openapiSummary.js";
import { computeVerdict, resolveTools, ToolSelector, ToolsConfig, Verdict } from "./toolset.js";

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

const VERSION_PATH_SEGMENT_PATTERN = /^(v\d+|api)$/i;
/** Resources scoring below this fraction of the top score are left out. */
const SCORE_THRESHOLD_RATIO = 0.4;
/** Below this top-score/median ratio the score distribution counts as flat. */
const FLAT_SCORE_SEPARATION_RATIO = 1.5;
const CRUD_SHAPE_WEIGHT = 2;
/** A resource with at least this many CRUD shapes overrides the flat-score gate. */
const STRONG_CRUD_SHAPE_COUNT = 3;
const PATH_PARAMETER_PATTERN = /^\{.*\}$/;

type CrudShape = "list" | "get" | "create" | "update" | "delete";

interface ResourceCandidate {
    canonicalName: string;
    displayName: string;
    tags: Set<string>;
    pathPrefixes: Set<string>;
    schemaNames: Set<string>;
    endpoints: EndpointSummary[];
    signalCount: number;
    crudShapes: Set<CrudShape>;
    schemaCentrality: number;
    score: number;
}

function canonicalResourceName(name: string): string {
    const cleaned = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (cleaned.length > 4 && cleaned.endsWith("ies")) {
        return `${cleaned.slice(0, -3)}y`;
    }
    if (cleaned.length > 3 && cleaned.endsWith("s") && !cleaned.endsWith("ss")) {
        return cleaned.slice(0, -1);
    }
    return cleaned;
}

function pathSegments(endpointPath: string): string[] {
    return endpointPath.split("/").filter((segment) => segment.length > 0);
}

/** First path segment after version prefixes like /v1 or /api. */
function resourcePathSegment(endpointPath: string): string | undefined {
    const segments = pathSegments(endpointPath);
    const meaningful = segments.find(
        (segment) => !VERSION_PATH_SEGMENT_PATTERN.test(segment) && !PATH_PARAMETER_PATTERN.test(segment)
    );
    return meaningful;
}

function resourcePathPrefix(endpointPath: string): string | undefined {
    const segments = pathSegments(endpointPath);
    const prefixSegments: string[] = [];
    for (const segment of segments) {
        prefixSegments.push(segment);
        if (!VERSION_PATH_SEGMENT_PATTERN.test(segment) && !PATH_PARAMETER_PATTERN.test(segment)) {
            return `/${prefixSegments.join("/")}`;
        }
    }
    return undefined;
}

function isItemPath(endpointPath: string): boolean {
    const segments = pathSegments(endpointPath);
    return segments.some((segment) => PATH_PARAMETER_PATTERN.test(segment));
}

function crudShapeForEndpoint(endpoint: EndpointSummary): CrudShape | undefined {
    switch (endpoint.method) {
        case "GET":
            return isItemPath(endpoint.path) ? "get" : "list";
        case "POST":
            return isItemPath(endpoint.path) ? undefined : "create";
        case "PUT":
        case "PATCH":
            return "update";
        case "DELETE":
            return "delete";
        default:
            return undefined;
    }
}

function isExcludableEndpoint(endpoint: EndpointSummary): boolean {
    return endpoint.deprecated || endpoint.internal;
}

function collectResourceCandidates(endpoints: EndpointSummary[]): ResourceCandidate[] {
    const candidates = new Map<string, ResourceCandidate>();
    const getOrCreate = (canonicalName: string, displayName: string): ResourceCandidate => {
        const existing = candidates.get(canonicalName);
        if (existing != null) {
            return existing;
        }
        const created: ResourceCandidate = {
            canonicalName,
            displayName,
            tags: new Set(),
            pathPrefixes: new Set(),
            schemaNames: new Set(),
            endpoints: [],
            signalCount: 0,
            crudShapes: new Set(),
            schemaCentrality: 0,
            score: 0
        };
        candidates.set(canonicalName, created);
        return created;
    };

    for (const endpoint of endpoints) {
        for (const tag of endpoint.tags) {
            const candidate = getOrCreate(canonicalResourceName(tag), tag);
            candidate.tags.add(tag);
        }
        const segment = resourcePathSegment(endpoint.path);
        const prefix = resourcePathPrefix(endpoint.path);
        if (segment != null && prefix != null) {
            const candidate = getOrCreate(canonicalResourceName(segment), segment);
            candidate.pathPrefixes.add(prefix);
        }
        for (const schemaName of endpoint.schemaRefs) {
            const canonical = canonicalResourceName(schemaName);
            const candidate = candidates.get(canonical);
            if (candidate != null) {
                candidate.schemaNames.add(schemaName);
            }
        }
    }

    // Second pass so schemas referenced before their tag/path candidate existed are counted.
    for (const endpoint of endpoints) {
        for (const schemaName of endpoint.schemaRefs) {
            const candidate = candidates.get(canonicalResourceName(schemaName));
            if (candidate != null) {
                candidate.schemaNames.add(schemaName);
            }
        }
    }

    for (const candidate of candidates.values()) {
        const memberEndpoints = endpoints.filter((endpoint) => {
            if (candidate.tags.size > 0 && endpoint.tags.some((tag) => candidate.tags.has(tag))) {
                return true;
            }
            const segment = resourcePathSegment(endpoint.path);
            return segment != null && canonicalResourceName(segment) === candidate.canonicalName;
        });
        candidate.endpoints = memberEndpoints;
        const memberSet = new Set(memberEndpoints);
        candidate.schemaCentrality = endpoints.filter(
            (endpoint) =>
                !memberSet.has(endpoint) &&
                endpoint.schemaRefs.some((schemaName) => candidate.schemaNames.has(schemaName))
        ).length;
        candidate.signalCount =
            (candidate.tags.size > 0 ? 1 : 0) +
            (candidate.pathPrefixes.size > 0 ? 1 : 0) +
            (candidate.schemaNames.size > 0 ? 1 : 0);

        const activeEndpoints = memberEndpoints.filter((endpoint) => !isExcludableEndpoint(endpoint));
        for (const endpoint of activeEndpoints) {
            const shape = crudShapeForEndpoint(endpoint);
            if (shape != null) {
                candidate.crudShapes.add(shape);
            }
        }
        candidate.score =
            candidate.crudShapes.size * CRUD_SHAPE_WEIGHT +
            Math.log2(activeEndpoints.length + 1) +
            Math.log2(candidate.schemaCentrality + 1);
    }

    return [...candidates.values()];
}

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const lower = sorted[middle - 1];
    const upper = sorted[middle];
    if (sorted.length % 2 === 0 && lower != null && upper != null) {
        return (lower + upper) / 2;
    }
    return upper ?? 0;
}

function selectorsForCandidate(candidate: ResourceCandidate): ToolSelector[] {
    if (candidate.tags.size > 0) {
        return [...candidate.tags].map((tag) => ({ tag }));
    }
    return [...candidate.pathPrefixes].map((prefix) => ({ "path-prefix": prefix }));
}

function unavailableMainResources(unavailableReason: string): PresetResolution {
    return {
        key: "main-resources",
        label: "Main resources — unavailable",
        config: {},
        verdict: computeVerdict([]),
        available: false,
        unavailableReason,
        notes: []
    };
}

export function buildMainResourcesPreset(endpoints: EndpointSummary[]): PresetResolution {
    const candidates = collectResourceCandidates(endpoints);
    const credible = candidates.filter((candidate) => candidate.signalCount >= 2);
    if (credible.length === 0) {
        return unavailableMainResources(
            "no credible resources detected (tags, paths, and schemas don't line up) — use AI-curated or trim by path prefix instead"
        );
    }

    const excludedByName = credible.filter((candidate) => EXCLUDED_TAG_PATTERN.test(candidate.displayName));
    const scoreable = credible.filter((candidate) => !EXCLUDED_TAG_PATTERN.test(candidate.displayName));
    if (scoreable.length === 0) {
        return unavailableMainResources(
            "every detected resource looks internal/admin-like — use AI-curated or trim by path prefix instead"
        );
    }

    const rankedByScore = [...scoreable].sort((a, b) => b.score - a.score);
    const topCandidate = rankedByScore[0];
    if (topCandidate == null) {
        return unavailableMainResources("no scoreable resources detected — use AI-curated instead");
    }
    const topScore = topCandidate.score;
    const medianScore = median(rankedByScore.map((candidate) => candidate.score));
    const hasStrongCrudResource = rankedByScore.some(
        (candidate) => candidate.crudShapes.size >= STRONG_CRUD_SHAPE_COUNT
    );
    if (topScore < FLAT_SCORE_SEPARATION_RATIO * medianScore && !hasStrongCrudResource) {
        return unavailableMainResources(
            "resource scores are too flat to pick main resources confidently — use AI-curated instead"
        );
    }

    let selected = rankedByScore.filter((candidate) => candidate.score >= SCORE_THRESHOLD_RATIO * topScore);

    const buildConfig = (resources: ResourceCandidate[]): ToolsConfig => {
        const include = resources.flatMap(selectorsForCandidate);
        const excludeSelectors: ToolSelector[] = excludedByName.flatMap(selectorsForCandidate);
        const includedEndpoints = resolveTools(endpoints, { include });
        for (const tool of includedEndpoints) {
            if (isExcludableEndpoint(tool.endpoint)) {
                excludeSelectors.push({ endpoint: `${tool.endpoint.method} ${tool.endpoint.path}` });
            }
        }
        return {
            include,
            exclude: excludeSelectors.length > 0 ? excludeSelectors : undefined
        };
    };

    let config = buildConfig(selected);
    let verdict = computeVerdict(resolveTools(endpoints, config));
    let trimmedCount = 0;
    while (verdict.level !== "green" && selected.length > 1) {
        selected = selected.slice(0, -1);
        trimmedCount += 1;
        config = buildConfig(selected);
        verdict = computeVerdict(resolveTools(endpoints, config));
    }

    const notes: string[] = [];
    if (excludedByName.length > 0) {
        notes.push(`excluded resources: ${excludedByName.map((candidate) => candidate.displayName).join(", ")}`);
    }
    const flaggedCount = (config.exclude ?? []).filter((selector) => selector.endpoint != null).length;
    if (flaggedCount > 0) {
        notes.push(`${flaggedCount} deprecated/internal endpoint(s) excluded`);
    }
    if (trimmedCount > 0) {
        notes.push(`${trimmedCount} lower-scoring resource(s) trimmed to fit budget`);
    }

    const resourceNames = selected.map((candidate) => candidate.displayName).join(", ");
    return {
        key: "main-resources",
        label: `Main resources — ${resourceNames} (detected from your spec)`,
        config,
        verdict,
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
