/**
 * Builds the URL for the dashboard's `/cli-login` page.
 *
 * The CLI opens this URL instead of going to Auth0 directly so the user
 * can pick from the same set of auth methods the dashboard's `/login`
 * page offers (email-based SSO + GitHub / Google / Postman). The dashboard
 * then redirects the browser to Auth0 with the appropriate `connection`
 * and the CLI's localhost `redirect_uri`, so Auth0 still terminates back
 * at the local server with a code — same as today.
 */
export function constructDashboardLoginUrl({
    dashboardBaseUrl,
    auth0ClientId,
    redirectUri,
    audience,
    state,
    prompt
}: {
    dashboardBaseUrl: string;
    auth0ClientId: string;
    redirectUri: string;
    audience: string;
    state?: string;
    prompt?: string;
}): string {
    const queryParams = new URLSearchParams({
        client_id: auth0ClientId,
        redirect_uri: redirectUri,
        audience
    });
    if (state != null && state.length > 0) {
        queryParams.set("state", state);
    }
    if (prompt != null && prompt.length > 0) {
        queryParams.set("prompt", prompt);
    }
    return `${dashboardBaseUrl.replace(/\/$/, "")}/cli-login?${queryParams.toString()}`;
}
