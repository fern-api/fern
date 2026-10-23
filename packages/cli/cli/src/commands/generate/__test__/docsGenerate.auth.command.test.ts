import { getToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDocsCliContext, docsFiles, docsYml, ONE_PAGE, useDocsEnvironment } from "./docsGenerateHarness.js";

// `fern generate --docs`: who the command publishes as and what it asks before it does. Only `askToLogin` (the
// browser login) and `getToken` (so a token file on the machine running the tests cannot leak in) are replaced.

vi.mock("@fern-api/login", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    askToLogin: vi.fn()
}));
vi.mock("@fern-api/auth", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown> & { getToken: () => Promise<unknown> }>();
    return { ...original, getToken: vi.fn(original.getToken) };
});

beforeEach(() => {
    vi.mocked(askToLogin).mockReset();
    vi.mocked(getToken).mockClear();
});

const VENUS = "http://venus.test";
const DOCS_TIMEOUT = 60_000;

describe("fern generate --docs: login and token", { timeout: DOCS_TIMEOUT }, () => {
    const env = useDocsEnvironment();

    /** The Authorization header of every request the command sent to the ledger. */
    const registerAuthorization = (): string[] =>
        env.fdr.headersTo("POST /docs-ledger/register").map((headers) => headers.authorization ?? "");

    describe("with FDR's origin overridden (FERN_FDR_ORIGIN or OVERRIDE_FDR_ORIGIN)", () => {
        it("publishes with FERN_TOKEN and never asks to log in", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(askToLogin).not.toHaveBeenCalled();
            expect(registerAuthorization()).toEqual(["Bearer token"]);
        });

        // The health check that comes first is cached for the whole process, so only the first publish of a run makes it;
        // docsGenerate.airgap.command.test.ts covers it.
        it("sends the requests to the origin it was given", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(
                env.fdr.requests.map((request) => request.url).filter((url) => !url.startsWith("https://s3"))
            ).toEqual([
                "http://fdr.test/slugs/markdowns",
                "http://fdr.test/docs-ledger/register",
                "http://fdr.test/docs-ledger/register/finish"
            ]);
        });

        it("treats OVERRIDE_FDR_ORIGIN the same way", async () => {
            vi.stubEnv("FERN_FDR_ORIGIN", undefined as never);
            vi.stubEnv("OVERRIDE_FDR_ORIGIN", "http://override.test");

            await env.run(env.project(ONE_PAGE));

            expect(askToLogin).not.toHaveBeenCalled();
            expect(env.fdr.to("POST /docs-ledger/register").map((request) => request.url)).toEqual([
                "http://override.test/docs-ledger/register"
            ]);
        });

        it("stops before it sends anything when there is no token, and says how to get one", async () => {
            vi.mocked(getToken).mockResolvedValueOnce(undefined);

            const { error, errors } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toBeDefined();
            expect(errors).toEqual([
                "No token found. Please set the FERN_TOKEN environment variable or run `fern login`."
            ]);
            expect(env.fdr.requests).toEqual([]);
            expect(askToLogin).not.toHaveBeenCalled();
        });

        it("does not tell PostHog about a run that stopped for a missing token", async () => {
            vi.mocked(getToken).mockResolvedValueOnce(undefined);

            const { events } = await env.attempt(env.project(ONE_PAGE));

            expect(events).toEqual([]);
        });
    });

    describe("without an origin override", () => {
        function withoutOverride(): void {
            vi.stubEnv("FERN_FDR_ORIGIN", undefined as never);
            vi.stubEnv("OVERRIDE_FDR_ORIGIN", undefined as never);
            vi.stubEnv("DEFAULT_FDR_ORIGIN", undefined as never);
            vi.stubEnv("DEFAULT_VENUS_ORIGIN", VENUS);
        }

        it("asks to log in, and publishes to Fern's registry with the organization token it gets", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockResolvedValue({ type: "organization", value: "org-token" });

            await env.run(env.project(ONE_PAGE));

            expect(askToLogin).toHaveBeenCalledTimes(1);
            expect(env.fdr.to("POST /docs-ledger/register").map((request) => request.url)).toEqual([
                "https://registry.buildwithfern.com/docs-ledger/register"
            ]);
            expect(registerAuthorization()).toEqual(["Bearer org-token"]);
        });

        it("does not look up the organization for an organization token", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockResolvedValue({ type: "organization", value: "org-token" });

            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.requests.filter((request) => request.url.startsWith(VENUS))).toEqual([]);
        });

        it("ignores FERN_TOKEN: what askToLogin returns is what publishes", async () => {
            withoutOverride();
            vi.stubEnv("FERN_TOKEN", "env-token");
            vi.mocked(askToLogin).mockResolvedValue({ type: "organization", value: "login-token" });

            await env.run(env.project(ONE_PAGE));

            expect(registerAuthorization()).toEqual(["Bearer login-token"]);
        });

        it("publishes with a user token once it has found the organization", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockResolvedValue({ type: "user", value: "user-token" });

            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to(`GET ${VENUS}/organizations/acme`)).toHaveLength(1);
            expect(env.fdr.to(`POST ${VENUS}/organizations/create`)).toEqual([]);
            expect(registerAuthorization()).toEqual(["Bearer user-token"]);
        });

        it("creates the organization for a user token when Venus does not know it", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockResolvedValue({ type: "user", value: "user-token" });
            env.fdr.reply(`GET ${VENUS}/organizations/acme`, { status: 404, body: {} });

            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to(`POST ${VENUS}/organizations/create`).map((request) => request.body)).toEqual([
                { organizationId: "acme" }
            ]);
            expect(env.fdr.to("POST /docs-ledger/register")).toHaveLength(1);
        });

        it("publishes nothing when the organization cannot be created", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockResolvedValue({ type: "user", value: "user-token" });
            env.fdr.reply(`GET ${VENUS}/organizations/acme`, { status: 404, body: {} });
            env.fdr.reply(`POST ${VENUS}/organizations/create`, { status: 500, body: {} });

            const { error, errors, events } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toBeDefined();
            expect(errors[0]).toContain("Failed to create organization: acme");
            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
            expect(events).toEqual([]);
        });

        it("refuses to create an organization whose name Fern does not allow", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockResolvedValue({ type: "user", value: "user-token" });
            env.fdr.reply(`GET ${VENUS}/organizations/Acme_Corp`, { status: 404, body: {} });
            const project = env.project({
                ...ONE_PAGE,
                "fern.config.json": '{"organization":"Acme_Corp","version":"*"}'
            });

            const { error, errors } = await env.attempt(project);

            expect(error).toBeDefined();
            expect(errors).toEqual([
                "Organization name must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"
            ]);
            expect(env.fdr.to(`POST ${VENUS}/organizations/create`)).toEqual([]);
            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
        });

        it("stops when the login fails, before it sends anything to FDR", async () => {
            withoutOverride();
            vi.mocked(askToLogin).mockRejectedValue(new Error("Authentication required."));

            const { error } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toEqual(new Error("Authentication required."));
            expect(env.fdr.requests).toEqual([]);
        });
    });

    describe("what the command reports to PostHog", () => {
        it("sends one event with the organization once it has a token", async () => {
            const { events } = await env.run(env.project(ONE_PAGE));

            expect(events).toEqual([{ orgId: "acme", command: "fern generate --docs" }]);
        });
    });
});

describe("fern generate --docs: the questions it asks", { timeout: DOCS_TIMEOUT }, () => {
    const env = useDocsEnvironment();

    const PRODUCTION_PROMPT =
        "This will affect a production site (https://acme.docs.buildwithfern.com). Run with --preview to generate docs for a preview instance.";

    describe("before it publishes to production", () => {
        it("asks, naming the site, and does not assume yes", async () => {
            const cli = createDocsCliContext();

            await env.run(env.project(ONE_PAGE), { noPrompt: false, cli });

            expect(cli.prompts).toHaveLength(1);
            const [prompt] = cli.prompts;
            expect(prompt?.message).toContain(PRODUCTION_PROMPT);
            expect(prompt?.message).toContain("Are you sure you want to continue?");
            expect(prompt?.defaultValue).toBe(false);
        });

        it("publishes when the answer is yes", async () => {
            const cli = createDocsCliContext(() => true);

            await env.run(env.project(ONE_PAGE), { noPrompt: false, cli });

            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("stops, says so and contacts nobody when the answer is no", async () => {
            const cli = createDocsCliContext(() => false);

            const result = await env.run(env.project(ONE_PAGE), { noPrompt: false, cli });

            expect(result.logs).toContain("info: Docs generation cancelled.");
            expect(env.fdr.requests).toEqual([]);
            expect(result.events).toEqual([]);
            expect(getToken).not.toHaveBeenCalled();
        });

        it("names the instance that was asked for, even when docs.yml lists several", async () => {
            const cli = createDocsCliContext();
            const project = env.project(
                docsFiles(
                    "instances:\n  - url: first.docs.buildwithfern.com\n  - url: second.docs.buildwithfern.com\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\n",
                    { "welcome.mdx": "# Welcome\n" }
                )
            );

            await env.run(project, { noPrompt: false, cli, instance: "second.docs.buildwithfern.com" });

            expect(cli.prompts[0]?.message).toContain("(https://second.docs.buildwithfern.com)");
        });

        it("names the first instance when none was asked for", async () => {
            const cli = createDocsCliContext();
            const project = env.project(
                docsFiles(
                    "instances:\n  - url: first.docs.buildwithfern.com\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\n",
                    { "welcome.mdx": "# Welcome\n" }
                )
            );

            await env.run(project, { noPrompt: false, cli });

            expect(cli.prompts[0]?.message).toContain("(https://first.docs.buildwithfern.com)");
        });

        // NOTE: the prompt writes `https://` in front of the instance as typed, so `--instance https://x` shows
        // `https://https://x`. The instance is also compared as a string with docs.yml, so that instance is unknown.
        it("shows a doubled scheme when the instance was typed with one", async () => {
            const cli = createDocsCliContext();

            await env.attempt(env.project(ONE_PAGE), {
                noPrompt: false,
                cli,
                instance: "https://acme.docs.buildwithfern.com"
            });

            expect(cli.prompts[0]?.message).toContain("(https://https://acme.docs.buildwithfern.com)");
        });

        it("does not ask with noPrompt", async () => {
            const cli = createDocsCliContext();

            await env.run(env.project(ONE_PAGE), { noPrompt: true, cli });

            expect(cli.prompts).toEqual([]);
        });

        it.each([
            "CI",
            "GITHUB_ACTIONS",
            "GITLAB_CI",
            "BUILDKITE",
            "JENKINS_URL",
            "TF_BUILD"
        ])("does not ask in a CI environment (%s is set)", async (variable) => {
            vi.stubEnv(variable, "true");
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { noPrompt: false, cli });

            expect(cli.prompts).toEqual([]);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("asks for a preview only about the preview id, never about production", async () => {
            const cli = createDocsCliContext();

            await env.run(env.project(ONE_PAGE), { noPrompt: false, preview: true, cli });

            expect(cli.prompts).toEqual([]);
        });

        // NOTE: a docs.yml with no instances fails later, but the question comes first and names no site.
        it("asks without naming a site when docs.yml has no instances", async () => {
            const cli = createDocsCliContext();
            const project = env.project(
                docsFiles("instances: []\nnavigation:\n  - page: Welcome\n    path: welcome.mdx\n", {})
            );

            await env.attempt(project, { noPrompt: false, cli });

            expect(cli.prompts[0]?.message.startsWith("This will affect a production site. Run with --preview")).toBe(
                true
            );
        });
    });

    describe("before it overwrites a preview that has an id (--id)", () => {
        const PREVIEW_URL = "https://acme-preview-my-feature.docs.buildwithfern.com";
        const previewOptions = { preview: true, previewId: "my-feature", force: false, noPrompt: false };

        it("asks FDR whether a preview exists at the address the id gives", async () => {
            const cli = createDocsCliContext();

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url").map((request) => request.body)).toEqual([
                { url: "acme-preview-my-feature.docs.buildwithfern.com" }
            ]);
        });

        it("asks before overwriting, naming the preview, when it exists", async () => {
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(cli.prompts).toEqual([
                {
                    message: `This preview ID already exists for ${"acme"} (${PREVIEW_URL}). Are you sure you want to overwrite this?`,
                    defaultValue: false
                }
            ]);
        });

        it("stops and publishes nothing when the answer is no", async () => {
            const cli = createDocsCliContext(() => false);

            const result = await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(result.logs).toContain("info: Docs generation cancelled.");
            expect(env.fdr.to("POST /docs-ledger/preview/init")).toEqual([]);
            expect(result.events).toEqual([]);
        });

        it("publishes the preview when the answer is yes", async () => {
            const cli = createDocsCliContext(() => true);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(env.fdr.to("POST /docs-ledger/preview/init")).toHaveLength(1);
        });

        it("does not ask when no preview exists at that address", async () => {
            env.fdr.reply("POST /v2/registry/docs/metadata-for-url", { status: 404, body: {} });
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(cli.prompts).toEqual([]);
            expect(env.fdr.to("POST /docs-ledger/preview/init")).toHaveLength(1);
        });

        it("treats any failure of the lookup as 'no such preview'", async () => {
            env.fdr.reply("POST /v2/registry/docs/metadata-for-url", "network-failure");
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(cli.prompts).toEqual([]);
            expect(env.fdr.to("POST /docs-ledger/preview/init")).toHaveLength(1);
        });

        it("does not look the preview up with --force", async () => {
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, force: true, cli });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url")).toEqual([]);
            expect(cli.prompts).toEqual([]);
        });

        it("does not look the preview up with noPrompt", async () => {
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, noPrompt: true, cli });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url")).toEqual([]);
        });

        it("does not look the preview up in a CI environment", async () => {
            vi.stubEnv("CI", "true");
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url")).toEqual([]);
        });

        it("does not look anything up when there is no id", async () => {
            const cli = createDocsCliContext(() => false);

            await env.run(env.project(ONE_PAGE), { ...previewOptions, previewId: undefined, cli });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url")).toEqual([]);
        });

        it("looks the preview up with the token that publishes", async () => {
            const cli = createDocsCliContext();

            await env.run(env.project(ONE_PAGE), { ...previewOptions, cli });

            expect(env.fdr.headersTo("POST /v2/registry/docs/metadata-for-url")[0]?.authorization).toBe("Bearer token");
        });

        it.each([
            ["My Feature/Branch!", "acme-preview-my-feature-branch.docs.buildwithfern.com"],
            ["feat__login--page", "acme-preview-feat-login-page.docs.buildwithfern.com"],
            ["--edge--", "acme-preview-edge.docs.buildwithfern.com"],
            ["!!!", "acme-preview-default.docs.buildwithfern.com"],
            ["UPPER", "acme-preview-upper.docs.buildwithfern.com"]
        ])("looks for the address of the id %j: %s", async (previewId, domain) => {
            await env.run(env.project(ONE_PAGE), { ...previewOptions, previewId, cli: createDocsCliContext() });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url").map((request) => request.body)).toEqual([
                { url: domain }
            ]);
        });

        it("shortens an id that would make the address longer than 62 characters, without a trailing hyphen", async () => {
            // acme-preview- is 13 characters, so 49 are left for the id; the 49th is a hyphen and goes.
            const previewId = `${"a".repeat(48)}-tail`;

            await env.run(env.project(ONE_PAGE), { ...previewOptions, previewId, cli: createDocsCliContext() });

            const [lookup] = env.fdr.to("POST /v2/registry/docs/metadata-for-url");
            expect(lookup?.body).toEqual({ url: `acme-preview-${"a".repeat(48)}.docs.buildwithfern.com` });
        });

        it("fails, in words, when the organization is too long to leave room for an id", async () => {
            const organization = "o".repeat(50);
            const project = env.project({
                ...ONE_PAGE,
                "fern.config.json": `{"organization":"${organization}","version":"*"}`
            });

            const { error } = await env.attempt(project, { ...previewOptions, cli: createDocsCliContext() });

            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe(
                `Organization name "${organization}" is too long to generate a valid preview URL`
            );
            expect(env.fdr.requests).toEqual([]);
        });

        // NOTE: the check runs for a production publish too, when an id is given: a production run with --id asks about
        // the production site first and then about the preview address, which the run never publishes to.
        it("also asks when the id comes with a production publish", async () => {
            const cli = createDocsCliContext(() => true);

            await env.run(env.project(ONE_PAGE), {
                preview: false,
                previewId: "my-feature",
                force: false,
                noPrompt: false,
                cli
            });

            expect(cli.prompts.map((prompt) => prompt.message.slice(0, 29))).toEqual([
                "This will affect a production",
                "This preview ID already exist"
            ]);
        });

        it("keeps docs.yml's other instances out of it: the preview address does not use the instance", async () => {
            const project = env.project(
                docsFiles(
                    docsYml("  - page: Welcome\n    path: welcome.mdx\n", { url: "other.docs.buildwithfern.com" }),
                    {
                        "welcome.mdx": "# Welcome\n"
                    }
                )
            );

            await env.run(project, { ...previewOptions, cli: createDocsCliContext() });

            expect(env.fdr.to("POST /v2/registry/docs/metadata-for-url")[0]?.body).toEqual({
                url: "acme-preview-my-feature.docs.buildwithfern.com"
            });
        });
    });
});
