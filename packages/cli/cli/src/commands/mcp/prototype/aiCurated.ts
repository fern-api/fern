import { EndpointSummary } from "./openapiSummary.js";
import { ToolSelector, ToolsConfig } from "./toolset.js";

/**
 * Stubbed "Fern Agent" ruleset proposal: pattern-matches the user's intent
 * against the spec's tags and methods to produce a plausible declarative
 * ruleset. The real implementation is server-side (FAI); this exists so the
 * wizard's AI-curated path can be demoed end-to-end.
 */

export interface AiProposal {
    config: ToolsConfig;
    /** Human-readable reasons, keyed by the emitted selector, exclusions first. */
    excludeReasons: string[];
    includeReasons: string[];
}

const NEGATION_PATTERN = /(never|no|not|don'?t|avoid|exclude)\s+(?:touch\s+|use\s+|call\s+)?([a-z][a-z0-9_-]*)/gi;
const READ_ONLY_HINT_PATTERN = /(read[\s-]?only|look\s?ups?|search|browse|nothing that writes|view)/i;
const DELETE_HINT_PATTERN = /(never|no|not|don'?t)\s+(?:\w+\s+){0,2}delete/i;

function uniqueTags(endpoints: EndpointSummary[]): string[] {
    return [...new Set(endpoints.flatMap((endpoint) => endpoint.tags))];
}

function mentionsTag(intent: string, tag: string): boolean {
    const lowered = intent.toLowerCase();
    const loweredTag = tag.toLowerCase();
    const singular = loweredTag.endsWith("s") ? loweredTag.slice(0, -1) : loweredTag;
    return lowered.includes(loweredTag) || lowered.includes(singular);
}

function findNegatedTerms(intent: string): string[] {
    const terms: string[] = [];
    for (const match of intent.matchAll(NEGATION_PATTERN)) {
        const term = match[2];
        if (term != null) {
            terms.push(term.toLowerCase());
        }
    }
    return terms;
}

export function proposeAiRuleset(intent: string, endpoints: EndpointSummary[]): AiProposal {
    const tags = uniqueTags(endpoints);
    const negatedTerms = findNegatedTerms(intent);
    const exclude: ToolSelector[] = [];
    const excludeReasons: string[] = [];
    const include: ToolSelector[] = [];
    const includeReasons: string[] = [];

    for (const tag of tags) {
        const negated = negatedTerms.some((term) => tag.toLowerCase().includes(term));
        if (negated) {
            exclude.push({ tag });
            excludeReasons.push(`{ tag: ${tag} } — you said not to touch "${tag}"`);
        }
    }
    if (DELETE_HINT_PATTERN.test(intent)) {
        exclude.push({ method: "DELETE" });
        excludeReasons.push('{ method: DELETE } — "never delete anything"');
    }

    const readOnly = READ_ONLY_HINT_PATTERN.test(intent);
    const mentionedTags = tags.filter(
        (tag) => mentionsTag(intent, tag) && !exclude.some((selector) => selector.tag === tag)
    );
    for (const tag of mentionedTags) {
        const selector: ToolSelector = readOnly ? { tag, method: "GET" } : { tag };
        include.push(selector);
        includeReasons.push(
            readOnly
                ? `{ tag: ${tag}, method: GET } — read-only ${tag}`
                : `{ tag: ${tag} } — mentioned in your description`
        );
    }
    if (include.length === 0) {
        include.push({ method: "GET" });
        includeReasons.push("{ method: GET } — defaulting to read-only lookups from your description");
    }

    return {
        config: {
            intent,
            include,
            exclude: exclude.length > 0 ? exclude : undefined
        },
        excludeReasons,
        includeReasons
    };
}
