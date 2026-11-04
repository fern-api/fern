/**
 * The dashboard page of one guest SDK build (`/sdk/<buildId>`): download, expiry and Claim, like the
 * site-only claim link of a guest docs publish. Lives on the dashboard that issued the session's
 * claim link, so it follows the same environment (beta or prod) as that link. `undefined` when the
 * claim link cannot be parsed: the link is informational and must never fail a finished build.
 */
export function getGuestSdkBuildUrl({ claimUrl, buildId }: { claimUrl: string; buildId: string }): string | undefined {
    let origin: string;
    try {
        origin = new URL(claimUrl).origin;
    } catch {
        return undefined;
    }
    return `${origin}/sdk/${encodeURIComponent(buildId)}`;
}
