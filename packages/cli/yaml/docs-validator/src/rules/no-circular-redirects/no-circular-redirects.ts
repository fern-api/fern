import { Rule, RuleViolation } from "../../Rule";

interface RedirectConfig {
    source: string;
    destination: string;
    permanent?: boolean;
}

function normalizeRedirectPath(path: string): string {
    // Remove trailing slash for comparison (except for root "/")
    if (path !== "/" && path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
}

function isStaticRedirect(redirect: RedirectConfig): boolean {
    // Check if the redirect contains dynamic segments (path-to-regexp patterns)
    return !redirect.source.includes(":") && !redirect.destination.includes(":");
}

export function detectCircularRedirects(redirects: RedirectConfig[]): RuleViolation[] {
    const violations: RuleViolation[] = [];

    // Filter to only static redirects for circular detection
    const staticRedirects = redirects.filter(isStaticRedirect);

    // Build a map of source -> destination for static redirects
    const redirectMap = new Map<string, { destination: string; index: number }>();
    for (let i = 0; i < staticRedirects.length; i++) {
        const redirect = staticRedirects[i];
        if (redirect) {
            const normalizedSource = normalizeRedirectPath(redirect.source);
            const normalizedDestination = normalizeRedirectPath(redirect.destination);
            redirectMap.set(normalizedSource, { destination: normalizedDestination, index: i });
        }
    }

    // Check for self-redirects (source === destination)
    for (let i = 0; i < redirects.length; i++) {
        const redirect = redirects[i];
        if (redirect) {
            const normalizedSource = normalizeRedirectPath(redirect.source);
            const normalizedDestination = normalizeRedirectPath(redirect.destination);

            if (normalizedSource === normalizedDestination) {
                violations.push({
                    severity: "error",
                    message: `redirects[${i}]: Redirect from "${redirect.source}" to "${redirect.destination}" creates an infinite loop (source equals destination)`
                });
            }
        }
    }

    // Check for circular chains (A -> B -> A, or A -> B -> C -> A, etc.)
    const visited = new Set<string>();
    const inCurrentPath = new Set<string>();

    function detectCycle(source: string, path: string[]): string[] | null {
        if (inCurrentPath.has(source)) {
            // Found a cycle, return the path from the cycle start
            const cycleStart = path.indexOf(source);
            return path.slice(cycleStart);
        }

        if (visited.has(source)) {
            return null;
        }

        const redirectInfo = redirectMap.get(source);
        if (!redirectInfo) {
            return null;
        }

        visited.add(source);
        inCurrentPath.add(source);
        path.push(source);

        const cycle = detectCycle(redirectInfo.destination, path);

        inCurrentPath.delete(source);
        path.pop();

        return cycle;
    }

    // Check each redirect source for cycles
    const reportedCycles = new Set<string>();
    for (const [source] of redirectMap) {
        visited.clear();
        inCurrentPath.clear();

        const cycle = detectCycle(source, []);
        if (cycle && cycle.length > 1) {
            // Create a canonical representation of the cycle to avoid duplicate reports
            const sortedCycle = [...cycle].sort();
            const cycleKey = sortedCycle.join(" -> ");

            if (!reportedCycles.has(cycleKey)) {
                reportedCycles.add(cycleKey);

                // Build the cycle chain for the error message
                const cycleChain = [...cycle, cycle[0]].join(" -> ");
                violations.push({
                    severity: "error",
                    message: `Circular redirect chain detected: ${cycleChain}`
                });
            }
        }
    }

    return violations;
}

export const NoCircularRedirectsRule: Rule = {
    name: "no-circular-redirects",
    create: () => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];

                if (!config.redirects || config.redirects.length === 0) {
                    return violations;
                }

                const redirectConfigs: RedirectConfig[] = config.redirects.map((r) => ({
                    source: r.source,
                    destination: r.destination,
                    permanent: r.permanent
                }));

                return detectCircularRedirects(redirectConfigs);
            }
        };
    }
};
