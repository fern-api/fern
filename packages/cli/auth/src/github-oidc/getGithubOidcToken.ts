import { stripTrailingSlashes } from "@fern-api/core-utils";

import { FernOrganizationToken } from "../FernToken.js";

const REQUEST_URL_ENV_VAR = "ACTIONS_ID_TOKEN_REQUEST_URL";
const REQUEST_TOKEN_ENV_VAR = "ACTIONS_ID_TOKEN_REQUEST_TOKEN";
const DEFAULT_VENUS_ORIGIN = "https://venus.buildwithfern.com";
const TIMEOUT_MS = 30_000;

/** Why a GitHub Actions run without FERN_TOKEN could not get a token. The message is safe to print: no token is in it. */
export class GithubOidcError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GithubOidcError";
    }
}

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

/**
 * Publishing docs from GitHub Actions without a stored FERN_TOKEN: asks GitHub for the run's OIDC ID token and swaps
 * it at Venus (`POST /auth/oidc/github`) for a 1-hour token scoped to `organization`, which is then used exactly like
 * FERN_TOKEN. Venus issues it only if an admin of the organization has trusted the repository.
 *
 * Returns `undefined` outside GitHub Actions. Call it only when there is neither FERN_TOKEN nor a saved login.
 * Throws `GithubOidcError` when the run is in GitHub Actions but cannot get a token.
 */
export async function getGithubOidcToken({
    organization,
    env = process.env,
    venusOrigin = getDefaultVenusOrigin(),
    fetch: fetchImpl = fetch
}: {
    organization: string;
    env?: Env;
    /** The Venus to exchange with. Its URL is also the audience the ID token is requested for. */
    venusOrigin?: string;
    fetch?: Fetch;
}): Promise<FernOrganizationToken | undefined> {
    const requestUrl = nonEmpty(env[REQUEST_URL_ENV_VAR]);
    const requestToken = nonEmpty(env[REQUEST_TOKEN_ENV_VAR]);
    if (requestUrl == null || requestToken == null) {
        if (env.GITHUB_ACTIONS === "true") {
            throw new GithubOidcError(MISSING_PERMISSION_MESSAGE);
        }
        return undefined;
    }

    // The audience is the Venus URL itself: see getGithubOidcAudience.
    const origin = getGithubOidcAudience(venusOrigin);
    const idToken = await requestGithubIdToken({
        requestUrl,
        requestToken,
        audience: origin,
        fetchImpl
    });
    const value = await exchangeWithVenus({ venusOrigin: origin, idToken, organization, fetchImpl });
    return { type: "organization", value };
}

export const MISSING_PERMISSION_MESSAGE =
    "FERN_TOKEN is not set and this GitHub Actions job is not allowed to request an ID token. " +
    "To publish without a stored token, add this to the job in your workflow file:\n\n" +
    "    permissions:\n" +
    "      id-token: write\n" +
    "      contents: read\n\n" +
    "Or set the FERN_TOKEN environment variable.";

/**
 * The audience the GitHub ID token is requested for. Venus accepts only a token issued for its own URL, so a token
 * requested for one Venus is refused by every other.
 */
export function getGithubOidcAudience(venusOrigin: string = getDefaultVenusOrigin()): string {
    return stripTrailingSlashes(venusOrigin);
}

// `process.env.DEFAULT_VENUS_ORIGIN` must stay written out in full: the CLI build replaces that expression with the
// Venus of the build (prod, dev2 or local), the same way createVenusService gets its origin.
function getDefaultVenusOrigin(): string {
    return nonEmpty(process.env.DEFAULT_VENUS_ORIGIN) ?? DEFAULT_VENUS_ORIGIN;
}

async function requestGithubIdToken({
    requestUrl,
    requestToken,
    audience,
    fetchImpl
}: {
    requestUrl: string;
    requestToken: string;
    audience: string;
    fetchImpl: Fetch;
}): Promise<string> {
    let url: URL;
    try {
        url = new URL(requestUrl);
    } catch {
        throw new GithubOidcError("Could not get an ID token from GitHub: ACTIONS_ID_TOKEN_REQUEST_URL is not a URL.");
    }
    url.searchParams.set("audience", audience);

    let response: Response;
    try {
        response = await fetchImpl(url, {
            headers: { Authorization: `Bearer ${requestToken}`, Accept: "application/json" },
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });
    } catch (error) {
        throw new GithubOidcError(`Could not get an ID token from GitHub: ${describeNetworkError(error)}.`);
    }
    if (!response.ok) {
        throw new GithubOidcError(`Could not get an ID token from GitHub (HTTP ${response.status}).`);
    }
    const idToken = readString(await readJson(response), "value");
    if (idToken == null) {
        throw new GithubOidcError("Could not get an ID token from GitHub: the response held no token.");
    }
    return idToken;
}

async function exchangeWithVenus({
    venusOrigin,
    idToken,
    organization,
    fetchImpl
}: {
    venusOrigin: string;
    idToken: string;
    organization: string;
    fetchImpl: Fetch;
}): Promise<string> {
    let response: Response;
    try {
        response = await fetchImpl(`${venusOrigin}/auth/oidc/github`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ token: idToken, organizationId: organization }),
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });
    } catch (error) {
        throw new GithubOidcError(`Could not reach Fern to sign in with GitHub OIDC: ${describeNetworkError(error)}.`);
    }
    const body = await readJson(response);
    if (!response.ok) {
        // Venus's own words: for an untrusted repository they name the repository and the organization.
        const reason = readString(body, "content") ?? `HTTP ${response.status}`;
        throw new GithubOidcError(
            `Fern refused to sign in this GitHub Actions run for organization ${organization}: ${reason}\n` +
                "Or set the FERN_TOKEN environment variable."
        );
    }
    const token = readString(body, "token");
    if (token == null) {
        throw new GithubOidcError("Could not sign in with GitHub OIDC: Fern's response held no token.");
    }
    return token;
}

async function readJson(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        // Not JSON (a proxy's error page): the caller falls back to the status code.
        return undefined;
    }
}

function readString(body: unknown, key: string): string | undefined {
    if (typeof body !== "object" || body == null || !(key in body)) {
        return undefined;
    }
    const value: unknown = Reflect.get(body, key);
    return typeof value === "string" ? nonEmpty(value) : undefined;
}

function describeNetworkError(error: unknown): string {
    if (error instanceof Error && error.name === "TimeoutError") {
        return "the request timed out";
    }
    return "the request failed";
}

function nonEmpty(value: string | undefined): string | undefined {
    return value == null || value.trim().length === 0 ? undefined : value;
}
