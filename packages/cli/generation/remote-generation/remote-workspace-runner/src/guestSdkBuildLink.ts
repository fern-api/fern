/**
 * The dashboard page of one guest SDK build (`/sdk/<buildId>`): download, expiry and Claim, like the
 * site-only claim link of a guest docs publish. Lives on the dashboard that issued the session's
 * claim link, so it follows the same environment (beta or prod) as that link, and carries that
 * link's fragment (the session's claim secret, which never reaches a server) so the page's Claim
 * can open the session claim. `undefined` when the claim link cannot be parsed: the link is
 * informational and must never fail a finished build.
 */
export function getGuestSdkBuildUrl({ claimUrl, buildId }: { claimUrl: string; buildId: string }): string | undefined {
    let parsed: URL;
    try {
        parsed = new URL(claimUrl);
    } catch {
        return undefined;
    }
    return `${parsed.origin}/sdk/${encodeURIComponent(buildId)}${parsed.hash}`;
}
