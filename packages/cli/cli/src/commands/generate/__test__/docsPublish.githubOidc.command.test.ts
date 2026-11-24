import type { FernToken } from "@fern-api/auth";
import { createLogger, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const account = vi.hoisted(() => ({ token: undefined as FernToken | undefined }));
vi.mock("@fern-api/auth", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/auth")>();
    return {
        ...actual,
        // FERN_TOKEN is read for real; the saved login (~/.fern/token) is what the test sets.
        getToken: async () => (await actual.getAccessToken()) ?? account.token,
        isLoggedIn: async () => (await actual.getAccessToken()) != null || account.token != null
    };
});

import { generateDocsWorkspace } from "../generateDocsWorkspace.js";
import {
    createTestCliContext,
    createTestProject,
    FAKE_FDR_ORIGIN,
    FakeFdr,
    type TestProject
} from "./commandHarness.js";

// `fern generate --docs` in GitHub Actions without a stored FERN_TOKEN (FERNDOC-773): the real command, with GitHub's
// ID token endpoint, Venus and FDR behind a stubbed `fetch`.

const GITHUB_URL = "https://pipelines.actions.githubusercontent.test/idtoken?api-version=2.0";
const VENUS_ORIGIN = "https://venus.test";
const ID_TOKEN = "github-id-token-secret";
const REQUEST_TOKEN = "github-request-token-secret";
const OIDC_FERN_TOKEN = "fern-token-from-oidc-secret";
const REFUSAL =
    "The GitHub repository acme/docs is not trusted to publish for the organization acme." +
    " An admin of acme can enable it in the Fern dashboard.";

interface Exchange {
    githubRequests: URL[];
    venusRequests: unknown[];
    /** The Authorization header of every request that went to FDR. */
    fdrAuthorizations: Set<string>;
    venus: () => Response;
}

/** Puts GitHub and Venus in front of the fake FDR's `fetch`. */
function installExchange(): Exchange {
    const fdrFetch = globalThis.fetch;
    const exchange: Exchange = {
        githubRequests: [],
        venusRequests: [],
        fdrAuthorizations: new Set(),
        venus: () => Response.json({ token: OIDC_FERN_TOKEN, expiresAt: "2026-11-24T20:00:00Z" })
    };
    vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
            const url = new URL(input instanceof Request ? input.url : String(input));
            if (url.origin === new URL(GITHUB_URL).origin) {
                exchange.githubRequests.push(url);
                return Response.json({ value: ID_TOKEN });
            }
            if (url.origin === VENUS_ORIGIN) {
                exchange.venusRequests.push(typeof init?.body === "string" ? JSON.parse(init.body) : undefined);
                return exchange.venus();
            }
            const headers = input instanceof Request ? input.headers : new Headers(init?.headers);
            const authorization = headers.get("authorization");
            if (authorization != null) {
                exchange.fdrAuthorizations.add(authorization);
            }
            return fdrFetch(input, init);
        })
    );
    return exchange;
}

describe("fern generate --docs with GitHub OIDC", () => {
    let testProject: TestProject | undefined;
    let fdr: FakeFdr;
    let exchange: Exchange;
    let isTTY: PropertyDescriptor | undefined;

    beforeEach(() => {
        account.token = undefined;
        vi.stubEnv("FERN_FDR_ORIGIN", FAKE_FDR_ORIGIN);
        vi.stubEnv("DEFAULT_VENUS_ORIGIN", VENUS_ORIGIN);
        vi.stubEnv("FERN_TOKEN", "");
        vi.stubEnv("GITHUB_ACTIONS", "true");
        vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_URL", GITHUB_URL);
        vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN", REQUEST_TOKEN);
        isTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
        Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
        fdr = new FakeFdr();
        fdr.install();
        exchange = installExchange();
    });

    afterEach(async () => {
        if (isTTY != null) {
            Object.defineProperty(process.stdout, "isTTY", isTTY);
        } else {
            Reflect.deleteProperty(process.stdout, "isTTY");
        }
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        await testProject?.cleanup();
        testProject = undefined;
    });

    async function publish({ preview = false }: { preview?: boolean } = {}) {
        testProject = await createTestProject({
            "fern.config.json": '{"organization":"acme","version":"*"}',
            "docs.yml":
                "instances:\n  - url: acme.docs.buildwithfern.com\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\n",
            "welcome.mdx": "# Welcome\n"
        });
        const { cliContext, logs, logged } = createTestCliContext();
        const result = await generateDocsWorkspace({
            project: testProject.project,
            cliContext,
            instance: undefined,
            preview,
            previewId: undefined,
            force: true,
            brokenLinks: false,
            strictBrokenLinks: false,
            disableTemplates: undefined,
            noPrompt: true,
            skipUpload: false
        }).then(
            () => "published" as const,
            () => "failed" as const
        );
        return { result, logs, logged };
    }

    function secretsLogged(logs: string[]): string[] {
        return [ID_TOKEN, REQUEST_TOKEN, OIDC_FERN_TOKEN].filter((secret) => logs.join("\n").includes(secret));
    }

    it.each([
        ["a publish", false],
        ["a preview", true]
    ])("without FERN_TOKEN or a saved login, %s uses the token Venus gives for the run's ID token", async (_, preview) => {
        const { result, logs } = await publish({ preview });

        expect(result).toBe("published");
        expect(exchange.githubRequests.map((url) => url.searchParams.get("audience"))).toEqual([VENUS_ORIGIN]);
        expect(exchange.venusRequests).toEqual([{ token: ID_TOKEN, organizationId: "acme" }]);
        expect([...exchange.fdrAuthorizations]).toEqual([`Bearer ${OIDC_FERN_TOKEN}`]);
        expect(secretsLogged(logs)).toEqual([]);
    });

    it("FERN_TOKEN wins: no exchange", async () => {
        vi.stubEnv("FERN_TOKEN", "stored-fern-token");

        const { result } = await publish();

        expect(result).toBe("published");
        expect(exchange.githubRequests).toHaveLength(0);
        expect(exchange.venusRequests).toHaveLength(0);
        expect([...exchange.fdrAuthorizations]).toEqual(["Bearer stored-fern-token"]);
    });

    it("a saved login wins: no exchange", async () => {
        account.token = { type: "user", value: "saved-login-token" };

        const { result } = await publish();

        expect(result).toBe("published");
        expect(exchange.githubRequests).toHaveLength(0);
        expect(exchange.venusRequests).toHaveLength(0);
        expect([...exchange.fdrAuthorizations]).toEqual(["Bearer saved-login-token"]);
    });

    it("without the id-token permission, prints the permission to add and publishes nothing", async () => {
        vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_URL", "");
        vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "");

        const { result, logs } = await publish();

        expect(result).toBe("failed");
        expect(logs.join("\n")).toMatch(/permissions:\n\s+id-token: write/);
        expect(exchange.venusRequests).toHaveLength(0);
        expect(fdr.requests).toHaveLength(0);
    });

    it("shows Venus's message when Venus refuses, and publishes nothing", async () => {
        exchange.venus = () => Response.json({ error: "GithubRepoNotTrustedError", content: REFUSAL }, { status: 403 });

        const { result, logs, logged } = await publish();

        expect(result).toBe("failed");
        expect(logged(REFUSAL)).toBe(true);
        expect(fdr.requests).toHaveLength(0);
        expect(secretsLogged(logs)).toEqual([]);
    });

    it("outside GitHub Actions nothing changes: the missing-account error, and no exchange", async () => {
        vi.stubEnv("GITHUB_ACTIONS", "");
        vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_URL", "");
        vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "");

        const { result, logged } = await publish();

        expect(result).toBe("failed");
        expect(logged("No Fern account found")).toBe(true);
        expect(logged("rerun with --guest")).toBe(true);
        expect(exchange.githubRequests).toHaveLength(0);
        expect(exchange.venusRequests).toHaveLength(0);
    });

    it("other commands do not exchange: the shared login check still asks for FERN_TOKEN", async () => {
        const logs: string[] = [];
        const logger = createLogger((_level: LogLevel, ...args: string[]) => logs.push(args.join(" ")));

        await expect(askToLogin(createMockTaskContext({ logger }))).rejects.toThrow();

        expect(logs.join("\n")).toContain("Please run 'fern login' or set the FERN_TOKEN");
        expect(exchange.githubRequests).toHaveLength(0);
        expect(exchange.venusRequests).toHaveLength(0);
    });
});
