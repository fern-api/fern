import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GithubOidcError, getGithubOidcAudience, getGithubOidcToken } from "../getGithubOidcToken.js";

const GITHUB_URL = "https://pipelines.actions.githubusercontent.com/abc/idtoken?api-version=2.0";
const ID_TOKEN = "github-id-token-secret";
const REQUEST_TOKEN = "github-request-token-secret";
const FERN_JWT = "fern-org-jwt-secret";
const REFUSAL =
    "The GitHub repository acme/docs is not trusted to publish for the organization acme." +
    " An admin of acme can enable it in the Fern dashboard.";

const ACTIONS_ENV = {
    GITHUB_ACTIONS: "true",
    ACTIONS_ID_TOKEN_REQUEST_URL: GITHUB_URL,
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: REQUEST_TOKEN
};

interface Call {
    url: URL;
    method: string;
    headers: Record<string, string>;
    body: unknown;
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** GitHub's ID token endpoint and Venus behind one `fetch`; records what each was sent. */
function fakeNetwork({
    github = () => json({ value: ID_TOKEN }),
    venus = () => json({ token: FERN_JWT, expiresAt: "2026-11-24T20:00:00Z" })
}: {
    github?: () => Response | Promise<Response>;
    venus?: () => Response | Promise<Response>;
} = {}) {
    const calls: Call[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = new URL(String(input));
        calls.push({
            url,
            method: init?.method ?? "GET",
            headers: Object.fromEntries(new Headers(init?.headers).entries()),
            body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined
        });
        return url.pathname === "/auth/oidc/github" ? venus() : github();
    });
    return { calls, fetch: fetchImpl };
}

async function failure(run: Promise<unknown>): Promise<GithubOidcError> {
    const error = await run.then(
        () => undefined,
        (thrown: unknown) => thrown
    );
    if (!(error instanceof GithubOidcError)) {
        throw new Error(`expected a GithubOidcError, got ${String(error)}`);
    }
    return error;
}

describe("getGithubOidcToken", () => {
    beforeEach(() => {
        vi.stubEnv("DEFAULT_VENUS_ORIGIN", "");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("asks GitHub for an ID token for the Venus audience and exchanges it for an organization token", async () => {
        const network = fakeNetwork();

        const token = await getGithubOidcToken({ organization: "acme", env: ACTIONS_ENV, fetch: network.fetch });

        expect(token).toEqual({ type: "organization", value: FERN_JWT });
        const [github, venus] = network.calls;
        expect(github?.url.origin).toBe("https://pipelines.actions.githubusercontent.com");
        expect(github?.url.pathname).toBe("/abc/idtoken");
        expect(github?.url.searchParams.get("api-version")).toBe("2.0");
        expect(github?.url.searchParams.get("audience")).toBe("https://venus.buildwithfern.com");
        expect(github?.headers.authorization).toBe(`Bearer ${REQUEST_TOKEN}`);
        expect(venus?.method).toBe("POST");
        expect(venus?.url.toString()).toBe("https://venus.buildwithfern.com/auth/oidc/github");
        expect(venus?.body).toEqual({ token: ID_TOKEN, organizationId: "acme" });
        expect(venus?.headers.authorization).toBeUndefined();
    });

    it.each([
        ["the dev build", "https://venus-dev2.buildwithfern.com", "https://venus-dev2.buildwithfern.com"],
        ["the local build", "http://localhost:8089/", "http://localhost:8089"],
        ["the prod build", "https://venus.buildwithfern.com", "https://venus.buildwithfern.com"],
        ["a build without a Venus origin", "", "https://venus.buildwithfern.com"]
    ])("requests the audience of the Venus it talks to: %s", async (_, buildOrigin, expected) => {
        vi.stubEnv("DEFAULT_VENUS_ORIGIN", buildOrigin);
        const network = fakeNetwork();

        await getGithubOidcToken({ organization: "acme", env: ACTIONS_ENV, fetch: network.fetch });

        expect(network.calls[0]?.url.searchParams.get("audience")).toBe(expected);
        expect(network.calls[1]?.url.toString()).toBe(`${expected}/auth/oidc/github`);
        expect(getGithubOidcAudience()).toBe(expected);
    });

    it("does nothing outside GitHub Actions", async () => {
        const network = fakeNetwork();

        expect(await getGithubOidcToken({ organization: "acme", env: {}, fetch: network.fetch })).toBeUndefined();
        expect(
            await getGithubOidcToken({
                organization: "acme",
                env: { GITLAB_CI: "true", CI: "true" },
                fetch: network.fetch
            })
        ).toBeUndefined();
        expect(network.fetch).not.toHaveBeenCalled();
    });

    it.each([
        ["both variables", {}],
        ["the request token", { ACTIONS_ID_TOKEN_REQUEST_URL: GITHUB_URL }],
        ["the request URL", { ACTIONS_ID_TOKEN_REQUEST_TOKEN: REQUEST_TOKEN }],
        ["a non-empty value", { ACTIONS_ID_TOKEN_REQUEST_URL: "", ACTIONS_ID_TOKEN_REQUEST_TOKEN: " " }]
    ])("in GitHub Actions without %s, prints the permission to add", async (_name, variables) => {
        const network = fakeNetwork();

        const error = await failure(
            getGithubOidcToken({
                organization: "acme",
                env: { GITHUB_ACTIONS: "true", ...variables },
                fetch: network.fetch
            })
        );

        expect(error.message).toMatch(/permissions:\n\s+id-token: write/);
        expect(error.message).toContain("FERN_TOKEN");
        expect(network.fetch).not.toHaveBeenCalled();
    });

    it("shows Venus's message when Venus refuses the exchange", async () => {
        const network = fakeNetwork({
            venus: () => json({ error: "GithubRepoNotTrustedError", errorInstanceId: "id", content: REFUSAL }, 403)
        });

        const error = await failure(
            getGithubOidcToken({ organization: "acme", env: ACTIONS_ENV, fetch: network.fetch })
        );

        expect(error.message).toContain(REFUSAL);
    });

    it.each([
        [
            "Venus answers without a message",
            () => new Response("<html>bad gateway</html>", { status: 502 }),
            "HTTP 502"
        ],
        ["Venus answers 200 without a token", () => json({}), "held no token"],
        [
            "Venus cannot be reached",
            () => Promise.reject(new Error(`connect failed for ${ID_TOKEN}`)),
            "the request failed"
        ]
    ])("fails when %s", async (_name, venus, expected) => {
        const network = fakeNetwork({ venus });

        const error = await failure(
            getGithubOidcToken({ organization: "acme", env: ACTIONS_ENV, fetch: network.fetch })
        );

        expect(error.message).toContain(expected);
        expect(error.message).not.toContain(ID_TOKEN);
    });

    it.each([
        ["GitHub refuses", () => json({ message: `denied ${REQUEST_TOKEN}` }, 401), "HTTP 401"],
        ["GitHub answers without a token", () => json({}), "held no token"],
        ["GitHub cannot be reached", () => Promise.reject(new Error(REQUEST_TOKEN)), "the request failed"]
    ])("fails without calling Venus when %s", async (_name, github, expected) => {
        const network = fakeNetwork({ github });

        const error = await failure(
            getGithubOidcToken({ organization: "acme", env: ACTIONS_ENV, fetch: network.fetch })
        );

        expect(error.message).toContain(expected);
        expect(error.message).not.toContain(REQUEST_TOKEN);
        expect(network.calls).toHaveLength(1);
    });

    it("never puts either token in an error message", async () => {
        const network = fakeNetwork({ venus: () => json({ content: REFUSAL }, 403) });

        const error = await failure(
            getGithubOidcToken({ organization: "acme", env: ACTIONS_ENV, fetch: network.fetch })
        );

        for (const secret of [ID_TOKEN, REQUEST_TOKEN, FERN_JWT]) {
            expect(error.message).not.toContain(secret);
        }
    });
});
