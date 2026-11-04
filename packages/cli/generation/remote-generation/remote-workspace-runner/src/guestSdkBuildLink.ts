/**
 * The dashboard page of one guest SDK build (`/sdk/<buildId>`): download, expiry and Claim, like the
 * site-only claim link of a guest docs publish. Lives on the dashboard that issued the session's
 * claim link, so it follows the same environment (beta or prod) as that link.
 */
export function getGuestSdkBuildUrl({ claimUrl, buildId }: { claimUrl: string; buildId: string }): string {
    return `${new URL(claimUrl).origin}/sdk/${encodeURIComponent(buildId)}`;
}
