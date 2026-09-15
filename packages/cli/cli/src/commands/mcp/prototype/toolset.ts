import { EndpointSummary } from "./openapiSummary.js";

/**
 * A declarative endpoint selector. Fields within one selector are ANDed;
 * selectors across an include/exclude list are ORed.
 */
export interface ToolSelector {
    tag?: string;
    method?: string;
    /** Glob pattern matched against the operationId (e.g. `list_*`). */
    "operation-id"?: string;
    "path-prefix"?: string;
    /** Explicit escape hatch, e.g. `POST /v1/refunds`. */
    endpoint?: string;
}

export interface ToolsConfig {
    intent?: string;
    instructions?: string;
    include?: ToolSelector[];
    exclude?: ToolSelector[];
}

export interface ResolvedTool {
    name: string;
    endpoint: EndpointSummary;
}

export interface ToolBudget {
    maxTools: number;
    maxTokens: number;
}

export const DEFAULT_BUDGET: ToolBudget = { maxTools: 40, maxTokens: 60_000 };

export type VerdictLevel = "green" | "amber" | "red";

export interface Verdict {
    level: VerdictLevel;
    toolCount: number;
    estimatedTokens: number;
    label: string;
}

function globToRegExp(glob: string): RegExp {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
}

function matchesSelector(endpoint: EndpointSummary, selector: ToolSelector): boolean {
    if (selector.tag != null && !endpoint.tags.includes(selector.tag)) {
        return false;
    }
    if (selector.method != null && endpoint.method !== selector.method.toUpperCase()) {
        return false;
    }
    if (selector["operation-id"] != null) {
        if (endpoint.operationId == null || !globToRegExp(selector["operation-id"]).test(endpoint.operationId)) {
            return false;
        }
    }
    if (selector["path-prefix"] != null && !endpoint.path.startsWith(selector["path-prefix"])) {
        return false;
    }
    if (selector.endpoint != null && selector.endpoint !== `${endpoint.method} ${endpoint.path}`) {
        return false;
    }
    return true;
}

function matchesAnySelector(endpoint: EndpointSummary, selectors: ToolSelector[] | undefined): boolean {
    return (selectors ?? []).some((selector) => matchesSelector(endpoint, selector));
}

export function toolNameForEndpoint(endpoint: EndpointSummary): string {
    if (endpoint.operationId != null) {
        return endpoint.operationId
            .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
            .replace(/[^a-zA-Z0-9]+/g, "_")
            .toLowerCase();
    }
    const pathSlug = endpoint.path
        .replace(/[{}]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    return `${endpoint.method.toLowerCase()}_${pathSlug}`;
}

/**
 * Resolves a tools config against the spec's endpoints.
 * Omitted/empty `include` means all endpoints; `exclude` always wins.
 */
export function resolveTools(endpoints: EndpointSummary[], config: ToolsConfig): ResolvedTool[] {
    return endpoints
        .filter((endpoint) => {
            const included =
                config.include == null || config.include.length === 0 || matchesAnySelector(endpoint, config.include);
            return included && !matchesAnySelector(endpoint, config.exclude);
        })
        .map((endpoint) => ({ name: toolNameForEndpoint(endpoint), endpoint }));
}

export function estimateTokens(tools: ResolvedTool[]): number {
    return tools.reduce((total, tool) => total + tool.endpoint.estimatedTokens, 0);
}

export function formatTokens(tokens: number): string {
    return tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : `${tokens}`;
}

/**
 * The two-clause verdict function: tool count and token cost are judged
 * independently and the overall verdict is the worst of the two.
 */
export function computeVerdict(tools: ResolvedTool[], budget: ToolBudget = DEFAULT_BUDGET): Verdict {
    const toolCount = tools.length;
    const estimatedTokens = estimateTokens(tools);

    const countLevel: VerdictLevel =
        toolCount <= budget.maxTools ? "green" : toolCount <= budget.maxTools * 3 ? "amber" : "red";
    const tokenLevel: VerdictLevel =
        estimatedTokens <= budget.maxTokens ? "green" : estimatedTokens <= budget.maxTokens * 3 ? "amber" : "red";
    const level: VerdictLevel =
        countLevel === "red" || tokenLevel === "red"
            ? "red"
            : countLevel === "amber" || tokenLevel === "amber"
              ? "amber"
              : "green";

    let label: string;
    if (level === "green") {
        label = "✓ within budget";
    } else {
        const reasons: string[] = [];
        if (countLevel !== "green") {
            reasons.push(`tool count ~${Math.ceil(toolCount / budget.maxTools)}× over`);
        }
        if (tokenLevel !== "green") {
            reasons.push(`token cost ~${Math.ceil(estimatedTokens / budget.maxTokens)}× over`);
        }
        label = `${level === "red" ? "✗" : "⚠"} ${reasons.join(" · ")} budget`;
    }
    return { level, toolCount, estimatedTokens, label };
}

export function formatVerdictLine(verdict: Verdict): string {
    return `${verdict.toolCount} tools · ${formatTokens(verdict.estimatedTokens)} tokens — ${verdict.label}`;
}
