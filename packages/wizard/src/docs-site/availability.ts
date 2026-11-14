// Checks whether a Fern organization name and a docs URL are free to use, the same way the Dashboard
// onboarding does, so the wizard never publishes into a name or domain that belongs to another team.
// A free organization name is created right away, before any setup depends on it.

import { dashboardOrigin, registryOrigin, venusOrigin } from "../fern-urls";

export const DOCS_DOMAIN = "docs.buildwithfern.com";
const MAX_ATTEMPTS = 5;

/**
 * - "mine": the user already belongs to it.
 * - "available": nobody uses it yet.
 * - "taken": it belongs to another team.
 * - "unknown": the check couldn't run; the wizard carries on without blocking.
 */
export type Availability = "mine" | "available" | "taken" | "unknown";

/**
 * - "created": the organization didn't exist, and now it's the user's.
 * - "mine": the user already belongs to it.
 * - "taken": it belongs to another team.
 * - "unknown": it couldn't be created or checked; `fern generate` tries creating it again later.
 */
export type ClaimResult = "created" | "mine" | "taken" | "unknown";

type Fetch = typeof fetch;

export interface AvailabilityChecker {
    organization(name: string): Promise<Availability>;
    docsUrl(subdomain: string): Promise<Availability>;
    /** Creates the organization now, unless the user already belongs to it or another team owns it. */
    claimOrganization(name: string): Promise<ClaimResult>;
}

/** Checks availability with the user's `fern login` token. */
export function createAvailabilityChecker(token: string, fetchImpl: Fetch = fetch): AvailabilityChecker {
    let myOrganizations: Promise<Set<string> | undefined> | undefined;
    const getMyOrganizations = (): Promise<Set<string> | undefined> => {
        myOrganizations ??= loadMyOrganizations(token, fetchImpl);
        return myOrganizations;
    };

    const organization = async (name: string): Promise<Availability> => {
        const mine = await getMyOrganizations();
        if (mine?.has(name) === true) {
            return "mine";
        }
        const availability = await checkOrganizationExists(name, token, fetchImpl);
        // The Dashboard's list of the user's organizations can lag behind one they just created.
        if (availability === "taken" && (await belongsToOrganization(name, token, fetchImpl))) {
            mine?.add(name);
            return "mine";
        }
        return availability;
    };

    return {
        organization,

        async claimOrganization(name) {
            const before = await organization(name);
            if (before === "mine" || before === "taken") {
                return before;
            }
            if (await createOrganization(name, token, fetchImpl)) {
                (await getMyOrganizations())?.add(name);
                return "created";
            }
            // Creating fails when the name is already used, which the first check may have missed.
            if (await belongsToOrganization(name, token, fetchImpl)) {
                (await getMyOrganizations())?.add(name);
                return "mine";
            }
            return (await checkOrganizationExists(name, token, fetchImpl)) === "taken" ? "taken" : "unknown";
        },

        async docsUrl(subdomain) {
            try {
                const response = await fetchImpl(`${registryOrigin()}/v2/registry/docs/metadata-for-url`, {
                    method: "POST",
                    headers: jsonHeaders(token),
                    body: JSON.stringify({ url: `${subdomain}.${DOCS_DOMAIN}` })
                });
                if (response.status === 404) {
                    return "available";
                }
                if (!response.ok) {
                    return "unknown";
                }
                const body: unknown = await response.json();
                const owner = isRecord(body) && typeof body.org === "string" ? body.org : undefined;
                const mine = await getMyOrganizations();
                return owner !== undefined && mine?.has(owner) === true ? "mine" : "taken";
            } catch {
                // Offline or the registry is unreachable; don't block setup on it.
                return "unknown";
            }
        }
    };
}

/**
 * The first usable name among the preferred one, a "-docs" variant, and random suffixes, like the
 * Dashboard does for docs URLs. Returns the preferred name when availability can't be checked.
 */
export async function findUsableName(
    preferred: string,
    check: (name: string) => Promise<Availability>,
    randomSuffix: () => string = defaultRandomSuffix
): Promise<{ name: string; changed: boolean }> {
    const candidates = [preferred, `${preferred}-docs`];
    while (candidates.length < MAX_ATTEMPTS) {
        candidates.push(`${preferred}-${randomSuffix()}`);
    }
    for (const candidate of candidates) {
        const availability = await check(candidate);
        if (availability !== "taken") {
            return { name: candidate, changed: candidate !== preferred };
        }
    }
    return { name: candidates[candidates.length - 1] ?? preferred, changed: true };
}

const SUGGESTION_SUFFIXES = ["docs", "dev", "api", "developers", "hq"];

/**
 * Up to `count` free alternatives to a taken name, checked in parallel. Names listed in `preferred`
 * (for example the organization the user just picked) come first when they are free.
 */
export async function suggestNames({
    base,
    check,
    count = 3,
    preferred = [],
    randomSuffix = defaultRandomSuffix
}: {
    base: string;
    check: (name: string) => Promise<Availability>;
    count?: number;
    preferred?: string[];
    randomSuffix?: () => string;
}): Promise<string[]> {
    const candidates = [
        ...new Set([
            ...preferred,
            ...SUGGESTION_SUFFIXES.map((suffix) => `${base}-${suffix}`),
            `${base}-${randomSuffix()}`,
            `${base}-${randomSuffix()}`
        ])
    ].filter((name) => name !== base && isValidName(name));
    const results = await Promise.all(
        candidates.map(async (name) => ({ name, free: (await check(name)) !== "taken" }))
    );
    return results
        .filter((result) => result.free)
        .slice(0, count)
        .map((result) => result.name);
}

/** Lowercase letters, numbers, and inner hyphens: valid for both organization names and docs URLs. */
export function isValidName(name: string): boolean {
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name);
}

function defaultRandomSuffix(): string {
    return Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, "0");
}

async function loadMyOrganizations(token: string, fetchImpl: Fetch): Promise<Set<string> | undefined> {
    try {
        const response = await fetchImpl(`${dashboardOrigin()}/api/get-my-organizations`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
        if (!response.ok) {
            return undefined;
        }
        const body: unknown = await response.json();
        if (!Array.isArray(body)) {
            return undefined;
        }
        return new Set(
            body.flatMap((organization) =>
                isRecord(organization) && typeof organization.name === "string" ? [organization.name] : []
            )
        );
    } catch {
        // Treat as unknown membership.
        return undefined;
    }
}

async function checkOrganizationExists(name: string, token: string, fetchImpl: Fetch): Promise<Availability> {
    try {
        const response = await fetchImpl(`${dashboardOrigin()}/api/organization/check-availability`, {
            method: "POST",
            headers: jsonHeaders(token),
            body: JSON.stringify({ organizationId: name })
        });
        if (!response.ok) {
            return "unknown";
        }
        const body: unknown = await response.json();
        if (!isRecord(body) || typeof body.exists !== "boolean") {
            return "unknown";
        }
        return body.exists ? "taken" : "available";
    } catch {
        // Offline or the dashboard is unreachable; don't block setup on it.
        return "unknown";
    }
}

/** Creates the organization the way `fern generate` does, with the user as its first member. */
async function createOrganization(name: string, token: string, fetchImpl: Fetch): Promise<boolean> {
    try {
        const response = await fetchImpl(`${venusOrigin()}/organizations/create`, {
            method: "POST",
            headers: jsonHeaders(token),
            body: JSON.stringify({ organizationId: name })
        });
        return response.ok;
    } catch {
        // Offline or Fern is unreachable; the caller works out why.
        return false;
    }
}

/** Whether Fern lists the organization among the ones the user belongs to. */
async function belongsToOrganization(name: string, token: string, fetchImpl: Fetch): Promise<boolean> {
    try {
        const response = await fetchImpl(`${venusOrigin()}/organizations`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
        if (!response.ok) {
            return false;
        }
        const body: unknown = await response.json();
        return Array.isArray(body) && body.includes(name);
    } catch {
        // Treat as not a member.
        return false;
    }
}

function jsonHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
