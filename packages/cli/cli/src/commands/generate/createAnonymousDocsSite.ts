export interface AnonymousDocsSite {
    orgId: string;
    domain: string;
    token: string;
    claimCode: string;
    expiresAt: string;
}

export function getFdrOrigin(): string {
    return (
        process.env.FERN_FDR_ORIGIN ??
        process.env.OVERRIDE_FDR_ORIGIN ??
        process.env.DEFAULT_FDR_ORIGIN ??
        "https://registry.buildwithfern.com"
    );
}

/**
 * Mints a temporary docs site (org, domain, publish token and claim code) without any auth.
 * The site can be claimed into a real org within one hour via the dashboard.
 */
export async function createAnonymousDocsSite(): Promise<AnonymousDocsSite> {
    const response = await fetch(`${getFdrOrigin().replace(/\/$/, "")}/v2/registry/docs/anonymous/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}"
    });
    if (!response.ok) {
        throw new Error(`Failed to create anonymous docs site (${response.status}): ${await response.text()}`);
    }
    const body: unknown = await response.json();
    if (!isAnonymousDocsSite(body)) {
        throw new Error("Unexpected response when creating anonymous docs site");
    }
    return body;
}

function isAnonymousDocsSite(value: unknown): value is AnonymousDocsSite {
    if (typeof value !== "object" || value == null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return ["orgId", "domain", "token", "claimCode", "expiresAt"].every((key) => typeof record[key] === "string");
}
