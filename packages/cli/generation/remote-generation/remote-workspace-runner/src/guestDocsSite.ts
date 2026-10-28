import { FernGuestToken } from "@fern-api/auth";

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
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token.value}` } });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`FDR answered ${response.status} when resolving the guest docs site: ${body}`);
    }
    const json: unknown = await response.json();
    if (!isGuestDocsSite(json)) {
        throw new Error("FDR returned an unexpected guest docs site payload");
    }
    return json;
}

/** docs-ledger `finish` adds the claim link and expiry for a guest site; older FDRs do not. */
export function readGuestPublishOutcome(result: unknown): { claimUrl?: string; expiresAt?: string } {
    if (typeof result !== "object" || result == null) {
        return {};
    }
    const record: Record<string, unknown> = result as Record<string, unknown>;
    return {
        claimUrl: typeof record.claimUrl === "string" ? record.claimUrl : undefined,
        expiresAt: typeof record.expiresAt === "string" ? record.expiresAt : undefined
    };
}
