import { FernGuestToken } from "@fern-api/auth";

const GUEST_SITE_TIMEOUT_MS = 15_000;

/** The one FDR origin every docs publish call in this package uses, so the guest-site lookup and the ledger publish can never disagree. */
export function getFdrOrigin(): string {
    return (
        process.env["FERN_FDR_ORIGIN"] ??
        process.env["OVERRIDE_FDR_ORIGIN"] ??
        process.env["DEFAULT_FDR_ORIGIN"] ??
        "https://registry.buildwithfern.com"
    );
}

/** The Fern Drop site FDR gives a Venus guest session (one per session, created on first use). */
export interface GuestDocsSite {
    siteId: string;
    orgId: string;
    domain: string;
    url: string;
    status: string;
    expiresAt: string;
}

function isGuestDocsSite(value: unknown): value is GuestDocsSite {
    if (typeof value !== "object" || value == null) {
        return false;
    }
    const record: Record<string, unknown> = value as Record<string, unknown>;
    return (
        typeof record.siteId === "string" &&
        typeof record.orgId === "string" &&
        typeof record.domain === "string" &&
        typeof record.url === "string" &&
        typeof record.status === "string" &&
        typeof record.expiresAt === "string"
    );
}

/**
 * A guest publishes to its own drop host, never to the URL in docs.yml: FDR refuses any other target.
 * `GET /v2/registry/docs/anonymous/guest-site` resolves (and on first use creates) that site.
 */
export async function fetchGuestDocsSite({
    fdrOrigin,
    token
}: {
    fdrOrigin: string;
    token: FernGuestToken;
}): Promise<GuestDocsSite> {
    const url = new URL("/v2/registry/docs/anonymous/guest-site", fdrOrigin);
    url.searchParams.set("orgId", token.organizationId);
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token.value}` },
        signal: AbortSignal.timeout(GUEST_SITE_TIMEOUT_MS)
    });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`FDR answered ${response.status} when resolving the guest docs site: ${body}`);
    }
    const json: unknown = await response.json().catch(() => undefined);
    if (!isGuestDocsSite(json)) {
        throw new Error("FDR returned an unexpected guest docs site payload");
    }
    return json;
}

/** docs-ledger `finish` adds the claim link and expiry for a guest site; older FDRs do not. */
export function readGuestPublishOutcome(result: unknown): { claimUrl?: string; expiresAt?: Date } {
    if (typeof result !== "object" || result == null) {
        return {};
    }
    const record: Record<string, unknown> = result as Record<string, unknown>;
    const expiresAt = typeof record.expiresAt === "string" ? new Date(record.expiresAt) : undefined;
    return {
        claimUrl: typeof record.claimUrl === "string" ? record.claimUrl : undefined,
        expiresAt: expiresAt != null && !Number.isNaN(expiresAt.getTime()) ? expiresAt : undefined
    };
}
