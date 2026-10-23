import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { blobUploadUrl } from "./commandHarness.js";
import {
    FAKE_TIMEOUTS,
    ledgerPreviewRegister,
    ledgerRegister,
    legacyFinish,
    ONE_PAGE,
    settleWithFakeTimers,
    uploadedBlobs,
    useDocsEnvironment
} from "./docsGenerateHarness.js";

// `fern generate --docs`: what is sent to FDR, in which order, for a production publish and for a preview, in the
// ledger mode (the default) and in the legacy mode (FERN_DOCS_DEPLOY_MODE=legacy).

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const WELCOME_HASH = sha256("# Welcome\n");

describe("fern generate --docs: production and preview", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    /** `METHOD /path` of every request except the health check (its answer is cached for the whole process). */
    const sequence = (): string[] =>
        env.fdr.requests
            .filter((request) => request.path !== "/health")
            .map((request) => `${request.method} ${request.path}`);

    describe("which deploy mode runs", () => {
        it("uses the ledger when FERN_DOCS_DEPLOY_MODE is not set", async () => {
            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain("debug: Docs deploy mode: ledger");
            expect(env.fdr.to("POST /v2/registry/docs/v2/init")).toEqual([]);
        });

        it("uses the legacy registration with FERN_DOCS_DEPLOY_MODE=legacy, and does not mention a mode", async () => {
            env.setDeployMode("legacy");

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs.some((line) => line.includes("Docs deploy mode"))).toBe(false);
            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
            expect(env.fdr.to("POST /v2/registry/docs/v2/init")).toHaveLength(1);
        });

        it("accepts the mode in any case and with spaces", async () => {
            vi.stubEnv("FERN_DOCS_DEPLOY_MODE", " Legacy ");

            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to("POST /v2/registry/docs/v2/init")).toHaveLength(1);
        });

        it("falls back to the ledger, with a console warning, for a mode it does not know", async () => {
            const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
            vi.stubEnv("FERN_DOCS_DEPLOY_MODE", "turbo");

            await env.run(env.project(ONE_PAGE));

            expect(warn).toHaveBeenCalledWith(
                '[fern] Unrecognized FERN_DOCS_DEPLOY_MODE="turbo" — falling back to "ledger". Valid values: ledger, legacy.'
            );
            expect(env.fdr.to("POST /docs-ledger/register")).toHaveLength(1);
        });

        it("always uses the legacy registration on a self-hosted FDR, whatever the mode says", async () => {
            vi.stubEnv("FERN_SELF_HOSTED", "true");
            vi.stubEnv("FERN_DOCS_DEPLOY_MODE", "ledger");

            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
            expect(env.fdr.to("POST /v2/registry/docs/v2/init")).toHaveLength(1);
        });
    });

    describe("a production publish through the ledger", () => {
        it("checks the redirects, registers, uploads what FDR is missing and finishes, in that order", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(sequence()).toEqual([
                "POST /slugs/markdowns",
                "POST /docs-ledger/register",
                `PUT /blob/${WELCOME_HASH}`,
                "POST /docs-ledger/register/finish"
            ]);
        });

        it("registers the site with its organization, domain and one locale", async () => {
            await env.run(env.project(ONE_PAGE));

            const body = ledgerRegister(env.fdr);
            expect(body).toMatchObject({
                orgId: "acme",
                domain: "acme.docs.buildwithfern.com",
                basepath: "/",
                customDomains: [],
                previewId: null,
                defaultLocale: "en"
            });
            expect(body.locales.map((locale) => locale.locale)).toEqual(["en"]);
        });

        it("describes each page by the hash, type and length of its markdown", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(ledgerRegister(env.fdr).locales[0]?.pages).toEqual({
                "welcome.mdx": { hash: WELCOME_HASH, contentType: "text/markdown", contentLength: 10 }
            });
        });

        it("uploads the markdown to the URL FDR gave for its hash", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`).map((request) => request.body)).toEqual([
                "# Welcome\n"
            ]);
        });

        it("finishes with exactly what it registered", async () => {
            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to("POST /docs-ledger/register/finish")[0]?.body).toEqual(ledgerRegister(env.fdr));
        });

        it("uploads nothing when FDR already has all of it", async () => {
            env.fdr.respond("POST /docs-ledger/register", { deploymentHash: "hash-1", missingContent: [] });

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(sequence()).toEqual([
                "POST /slugs/markdowns",
                "POST /docs-ledger/register",
                "POST /docs-ledger/register/finish"
            ]);
            expect(logs).toContain("debug: [ledger] All content already in CAS — no uploads needed");
        });

        it("uploads only the blobs FDR asks for", async () => {
            env.fdr.respond("POST /docs-ledger/register", {
                deploymentHash: "hash-1",
                missingContent: [{ hash: WELCOME_HASH, uploadUrl: blobUploadUrl(WELCOME_HASH) }]
            });
            const project = env.project({
                ...ONE_PAGE,
                "docs.yml": `${ONE_PAGE["docs.yml"]}  - page: Second\n    path: second.mdx\n`,
                "second.mdx": "# Second\n"
            });

            await env.run(project);

            expect([...uploadedBlobs(env.fdr).keys()]).toEqual([WELCOME_HASH]);
        });

        it("warns about, and skips, a blob FDR asks for that it never had", async () => {
            env.fdr.respond("POST /docs-ledger/register", {
                deploymentHash: "hash-1",
                missingContent: [{ hash: "f".repeat(64), uploadUrl: blobUploadUrl("f".repeat(64)) }]
            });

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain(
                `warn: [ledger] Server requested blob ${"f".repeat(64)} but we don't have it — skipping`
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("treats an upload FDR answers with 412 as already stored", async () => {
            env.fdr.reply(`PUT ${blobUploadUrl(WELCOME_HASH)}`, { status: 412 });

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain(`debug: [ledger] Blob ${WELCOME_HASH} already exists in store — skipping`);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("retries an upload that fails with 500 and finishes once it works", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.replyTimes(`PUT ${blobUploadUrl(WELCOME_HASH)}`, 2, { status: 500, body: {} });

            const { logs } = await settleWithFakeTimers(env.run(env.project(ONE_PAGE)));

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`)).toHaveLength(3);
            expect(logs).toContain(`debug: [ledger] Upload ${WELCOME_HASH} got 500, retrying in 1000ms (attempt 1/3)`);
            expect(logs).toContain(`debug: [ledger] Upload ${WELCOME_HASH} got 500, retrying in 2000ms (attempt 2/3)`);
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("retries an upload that fails with 429", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.replyTimes(`PUT ${blobUploadUrl(WELCOME_HASH)}`, 1, { status: 429, body: {} });

            await settleWithFakeTimers(env.run(env.project(ONE_PAGE)));

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`)).toHaveLength(2);
        });

        it("gives up after four failed uploads and does not finish", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.reply(`PUT ${blobUploadUrl(WELCOME_HASH)}`, { status: 503, body: "busy" });

            const { error, errors } = await settleWithFakeTimers(env.attempt(env.project(ONE_PAGE)));

            expect(error).toBeDefined();
            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`)).toHaveLength(4);
            expect(errors[0]).toContain(
                `Failed to publish docs via ledger to acme.docs.buildwithfern.com: [ledger] S3 upload failed for ${WELCOME_HASH}: 503`
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
        });

        it("does not retry a rejected upload URL (403) and does not finish", async () => {
            env.fdr.reply(`PUT ${blobUploadUrl(WELCOME_HASH)}`, { status: 403, body: "expired" });

            const { errors } = await env.attempt(env.project(ONE_PAGE));

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`)).toHaveLength(1);
            expect(errors[0]).toContain(
                `[ledger] Presigned URL rejected for ${WELCOME_HASH} (expired or signature mismatch)`
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
        });

        it("does not retry an upload whose content FDR refuses (400)", async () => {
            env.fdr.reply(`PUT ${blobUploadUrl(WELCOME_HASH)}`, { status: 400, body: "checksum" });

            const { errors } = await env.attempt(env.project(ONE_PAGE));

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`)).toHaveLength(1);
            expect(errors[0]).toContain(`[ledger] Content integrity check failed for ${WELCOME_HASH}`);
        });

        it("says whether FDR reused an earlier deployment", async () => {
            env.fdr.respond("POST /docs-ledger/register/finish", {
                deploymentId: "deployment-9",
                reusedDeployment: true
            });

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain("debug: [ledger] Deployment reused: deployment-9");
        });

        it("says when it created a deployment", async () => {
            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain("debug: [ledger] Deployment created: deployment-1");
        });

        it("reports the address of the site and ends the run", async () => {
            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs.filter((line) => line.startsWith("info: Published docs to "))).toHaveLength(1);
            expect(logs.find((line) => line.startsWith("info: Published docs to "))).toContain(
                "https://acme.docs.buildwithfern.com"
            );
        });

        // NOTE: the production register sends --id as it was typed, while the preview sends it sanitised.
        it("sends an id given with a production publish unsanitised", async () => {
            await env.run(env.project(ONE_PAGE), { previewId: "My Feature!" });

            expect(ledgerRegister(env.fdr).previewId).toBe("My Feature!");
        });

        // NOTE: skipUpload is only read by the legacy registration; the ledger still uploads every blob FDR asks for.
        it("still uploads its blobs with skipUpload", async () => {
            await env.run(env.project(ONE_PAGE), { skipUpload: true });

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`)).toHaveLength(1);
        });

        it("never takes a deploy lock, so there is nothing to unlock when it fails", async () => {
            env.fdr.reply("POST /docs-ledger/register/finish", { status: 500, body: {} });

            const { error } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toBeDefined();
            expect(env.axiosCalls).toEqual([]);
        });
    });

    describe("a preview through the ledger", () => {
        const PREVIEW = { preview: true };

        it("checks the redirects, asks to preview, uploads and finishes, in that order", async () => {
            await env.run(env.project(ONE_PAGE), PREVIEW);

            const [first, ...rest] = sequence();
            expect(first).toBe("POST /slugs/markdowns");
            expect(rest[0]).toBe("POST /docs-ledger/preview/init");
            expect(rest.at(-1)).toBe("POST /docs-ledger/register/finish");
            expect(rest.some((entry) => entry === "POST /docs-ledger/register")).toBe(false);
        });

        it("asks with the organization, base path and locales, and no domain", async () => {
            await env.run(env.project(ONE_PAGE), PREVIEW);

            const body = ledgerPreviewRegister(env.fdr);
            expect(body).toMatchObject({ orgId: "acme", previewId: null, basePath: "/", defaultLocale: "en" });
            expect(body).not.toHaveProperty("domain");
            expect(body).not.toHaveProperty("customDomains");
            expect(body.locales.map((locale) => locale.locale)).toEqual(["en"]);
        });

        it("repeats the first locale at the top of the request for servers that read one locale", async () => {
            await env.run(env.project(ONE_PAGE), PREVIEW);

            const body = ledgerPreviewRegister(env.fdr);
            const [first] = body.locales;
            expect(body).toMatchObject({ root: first?.root, pages: first?.pages, locale: "en" });
        });

        it("finishes on the domain, base path and id FDR chose for the preview, with no custom domains", async () => {
            env.fdr.respond("POST /docs-ledger/preview/init", {
                deploymentHash: "hash-1",
                missingContent: [],
                domain: "acme-preview-xyz.docs.buildwithfern.com",
                basepath: "/p",
                previewId: "xyz",
                previewUrl: "https://acme-preview-xyz.docs.buildwithfern.com/p"
            });

            await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(env.fdr.to("POST /docs-ledger/register/finish")[0]?.body).toMatchObject({
                orgId: "acme",
                domain: "acme-preview-xyz.docs.buildwithfern.com",
                basepath: "/p",
                customDomains: [],
                previewId: "xyz",
                defaultLocale: "en"
            });
        });

        it("reports the preview URL FDR gave as the address of the docs", async () => {
            env.fdr.respond("POST /docs-ledger/preview/init", {
                deploymentHash: "hash-1",
                missingContent: [],
                domain: "d",
                basepath: "",
                previewId: "p",
                previewUrl: "https://acme-preview-xyz.docs.buildwithfern.com"
            });

            const { logs } = await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(logs.find((line) => line.startsWith("info: Published docs to "))).toContain(
                "https://acme-preview-xyz.docs.buildwithfern.com"
            );
            expect(logs).toContain("debug: [ledger] Preview deployment created: deployment-1");
        });

        it.each([
            ["My Feature!", "my-feature"],
            ["Release/2.0_RC", "release-2-0-rc"],
            ["---", "default"],
            ["pr-123", "pr-123"]
        ])("sends the id %j as %j", async (previewId, sent) => {
            await env.run(env.project(ONE_PAGE), { ...PREVIEW, previewId });

            expect(ledgerPreviewRegister(env.fdr).previewId).toBe(sent);
        });

        it("uploads the page the way a production publish does", async () => {
            await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`).length).toBeGreaterThan(0);
            expect([...uploadedBlobs(env.fdr).keys()]).toEqual([WELCOME_HASH]);
        });

        // NOTE: skipUpload does not stop a ledger preview from uploading.
        it("still uploads with skipUpload", async () => {
            await env.run(env.project(ONE_PAGE), { ...PREVIEW, skipUpload: true });

            expect(env.fdr.to(`PUT ${blobUploadUrl(WELCOME_HASH)}`).length).toBeGreaterThan(0);
        });

        it("fails, and does not finish, when FDR refuses the preview", async () => {
            env.fdr.reply("POST /docs-ledger/preview/init", { status: 500, body: {} });

            const { error, errors } = await env.attempt(env.project(ONE_PAGE), PREVIEW);

            expect(error).toBeDefined();
            expect(errors[0]).toContain(
                "Failed to publish docs via ledger to acme.docs.buildwithfern.com: Internal Server Error"
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
        });

        it("unlocks nothing after a failed legacy preview, which takes no lock", async () => {
            env.setDeployMode("legacy");
            env.fdr.reply("POST /v2/registry/docs/register/registration-1", { status: 500, body: {} });

            await env.attempt(env.project(ONE_PAGE), PREVIEW);

            expect(env.axiosCalls).toEqual([]);
        });
    });

    describe("a production publish through the legacy registration", () => {
        function legacy(): void {
            env.setDeployMode("legacy");
        }

        it("registers, checks the redirects and finishes, in that order, without a ledger call", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE));

            expect(sequence()).toEqual([
                "POST /v2/registry/docs/v2/init",
                "POST /slugs/markdowns",
                "POST /v2/registry/docs/register/registration-1"
            ]);
        });

        it("registers the domain, custom domains and organization, with public access", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE));

            expect(env.fdr.to("POST /v2/registry/docs/v2/init")[0]?.body).toEqual({
                domain: "acme.docs.buildwithfern.com",
                customDomains: [],
                authConfig: { type: "public" },
                orgId: "acme",
                filepaths: [],
                images: []
            });
        });

        it("finishes with the pages and navigation, and does not exclude the APIs", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE));

            const finish = legacyFinish(env.fdr);
            expect(finish.excludeApis).toBe(false);
            expect(finish.docsDefinition.pages).toEqual({
                "welcome.mdx": { markdown: "# Welcome\n", rawMarkdown: "# Welcome\n" }
            });
            expect(finish.docsDefinition.config.root).toMatchObject({ type: "root", title: "Documentation" });
        });

        it("reports the registration id and the address of the docs", async () => {
            legacy();
            env.fdr.respond("POST /v2/registry/docs/v2/init", {
                docsRegistrationId: "registration-7",
                uploadUrls: {},
                skippedFiles: []
            });

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain("debug: Received production registration ID: registration-7");
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-7")).toHaveLength(1);
            expect(logs.find((line) => line.startsWith("info: Published docs to "))).toContain(
                "https://acme.docs.buildwithfern.com"
            );
        });

        it("says when there are no files to upload", async () => {
            legacy();

            const { logs } = await env.run(env.project(ONE_PAGE));

            expect(logs).toContain("info: No files to upload (all up to date)");
        });

        it("takes no lock itself and leaves no unlock behind when it succeeds", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE));

            expect(env.axiosCalls).toEqual([]);
        });
    });

    describe("a preview through the legacy registration", () => {
        const PREVIEW = { preview: true };

        function legacy(): void {
            env.setDeployMode("legacy");
        }

        it("registers the preview, checks the redirects and finishes", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(sequence()).toEqual([
                "POST /v2/registry/docs/preview/init",
                "POST /slugs/markdowns",
                "POST /v2/registry/docs/register/registration-1"
            ]);
        });

        it("registers with the organization, base path and no domain", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(env.fdr.to("POST /v2/registry/docs/preview/init")[0]?.body).toEqual({
                orgId: "acme",
                authConfig: { type: "public" },
                filepaths: [],
                images: [],
                basePath: "/"
            });
        });

        it("sends the sanitised id", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE), { ...PREVIEW, previewId: "My Feature!" });

            expect(env.fdr.to("POST /v2/registry/docs/preview/init")[0]?.body).toMatchObject({
                previewId: "my-feature"
            });
        });

        it("reports the preview URL the registration returned", async () => {
            legacy();
            env.fdr.respond("POST /v2/registry/docs/preview/init", {
                docsRegistrationId: "registration-1",
                uploadUrls: {},
                skippedFiles: [],
                previewUrl: "https://acme-preview-abc.docs.buildwithfern.com"
            });

            const { logs } = await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(logs).toContain("debug: Received preview registration ID: registration-1");
            expect(logs.find((line) => line.startsWith("info: Published docs to "))).toContain(
                "https://acme-preview-abc.docs.buildwithfern.com"
            );
        });

        it("finishes without a base path flag or a production lock", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE), PREVIEW);

            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")[0]?.body).toEqual({
                docsDefinition: expect.any(Object),
                excludeApis: false
            });
        });
    });

    describe("what the requests say about who sends them", () => {
        it("sends the CLI version with every ledger request", async () => {
            await env.run(env.project(ONE_PAGE));

            for (const route of ["POST /docs-ledger/register", "POST /docs-ledger/register/finish"]) {
                expect(env.fdr.headersTo(route)[0]?.["x-cli-version"]).toBe("0.0.0");
            }
        });

        it("sends the CLI version with the legacy registration and its finish", async () => {
            env.setDeployMode("legacy");

            await env.run(env.project(ONE_PAGE));

            for (const route of ["POST /v2/registry/docs/v2/init", "POST /v2/registry/docs/register/registration-1"]) {
                expect(env.fdr.headersTo(route)[0]?.["x-cli-version"]).toBe("0.0.0");
            }
        });

        it("sends no CI headers from a laptop, and no git provenance", async () => {
            await env.run(env.project(ONE_PAGE));

            const headers = env.fdr.headersTo("POST /docs-ledger/register")[0] ?? {};
            expect(headers).not.toHaveProperty("x-ci-source");
            expect(headers).not.toHaveProperty("x-deployer-author");
            expect(ledgerRegister(env.fdr).locales[0]?.git).toBeUndefined();
        });

        function inGithubActions(): void {
            vi.stubEnv("GITHUB_ACTIONS", "true");
            vi.stubEnv("GITHUB_REPOSITORY", "acme/docs");
            vi.stubEnv("GITHUB_RUN_ID", "42");
            vi.stubEnv("GITHUB_SHA", "abc123");
            vi.stubEnv("GITHUB_REF_NAME", "main");
            vi.stubEnv("GITHUB_ACTOR", "octocat");
        }

        it("describes a GitHub Actions run in X-CI-Source and names the deployer", async () => {
            inGithubActions();

            await env.run(env.project(ONE_PAGE));

            const headers = env.fdr.headersTo("POST /docs-ledger/register")[0] ?? {};
            expect(JSON.parse(headers["x-ci-source"] ?? "null")).toEqual({
                type: "github",
                repo: "acme/docs",
                runId: "42",
                runUrl: "https://github.com/acme/docs/actions/runs/42",
                commitSha: "abc123",
                branch: "main",
                actor: "octocat"
            });
            expect(headers["x-deployer-author"]).toBe("octocat");
        });

        it("sends the repository, branch and commit of a CI run with the ledger locale", async () => {
            inGithubActions();

            await env.run(env.project(ONE_PAGE));

            expect(ledgerRegister(env.fdr).locales[0]?.git).toEqual({
                repoUrl: "https://github.com/acme/docs",
                branch: "main",
                commitSha: "abc123"
            });
        });

        it("sends the same provenance with a ledger preview", async () => {
            inGithubActions();

            await env.run(env.project(ONE_PAGE), { preview: true });

            expect(ledgerPreviewRegister(env.fdr).locales[0]?.git).toEqual({
                repoUrl: "https://github.com/acme/docs",
                branch: "main",
                commitSha: "abc123"
            });
        });

        it("sends the CI headers with the legacy registration", async () => {
            env.setDeployMode("legacy");
            inGithubActions();

            await env.run(env.project(ONE_PAGE));

            const headers = env.fdr.headersTo("POST /v2/registry/docs/v2/init")[0] ?? {};
            expect(JSON.parse(headers["x-ci-source"] ?? "null")).toMatchObject({ type: "github", repo: "acme/docs" });
            expect(headers["x-deployer-author"]).toBe("octocat");
        });

        it("describes a GitLab run, with the deployer's email, and points git at gitlab.com", async () => {
            vi.stubEnv("GITLAB_CI", "true");
            vi.stubEnv("CI_PROJECT_PATH", "acme/docs");
            vi.stubEnv("CI_PIPELINE_ID", "7");
            vi.stubEnv("CI_COMMIT_REF_NAME", "release");
            vi.stubEnv("CI_COMMIT_SHA", "def456");
            vi.stubEnv("GITLAB_USER_LOGIN", "tanuki");
            vi.stubEnv("GITLAB_USER_EMAIL", "tanuki@example.com");

            await env.run(env.project(ONE_PAGE));

            const headers = env.fdr.headersTo("POST /docs-ledger/register")[0] ?? {};
            expect(JSON.parse(headers["x-ci-source"] ?? "null")).toMatchObject({
                type: "gitlab",
                repo: "acme/docs",
                runId: "7"
            });
            expect(headers["x-deployer-author"]).toBe("tanuki");
            expect(headers["x-deployer-author-email"]).toBe("tanuki@example.com");
            expect(ledgerRegister(env.fdr).locales[0]?.git).toEqual({
                repoUrl: "https://gitlab.com/acme/docs",
                branch: "release",
                commitSha: "def456"
            });
        });

        it("describes a Bitbucket run and points git at bitbucket.org", async () => {
            vi.stubEnv("BITBUCKET_BUILD_NUMBER", "9");
            vi.stubEnv("BITBUCKET_WORKSPACE", "acme");
            vi.stubEnv("BITBUCKET_REPO_SLUG", "docs");
            vi.stubEnv("BITBUCKET_BRANCH", "main");
            vi.stubEnv("BITBUCKET_COMMIT", "0a1b2c");

            await env.run(env.project(ONE_PAGE));

            const headers = env.fdr.headersTo("POST /docs-ledger/register")[0] ?? {};
            expect(JSON.parse(headers["x-ci-source"] ?? "null")).toMatchObject({
                type: "bitbucket",
                repo: "acme/docs",
                runId: "9",
                runUrl: "https://bitbucket.org/acme/docs/pipelines/results/9"
            });
            expect(ledgerRegister(env.fdr).locales[0]?.git?.repoUrl).toBe("https://bitbucket.org/acme/docs");
        });

        it("sends no git provenance from a CI run that has no branch", async () => {
            vi.stubEnv("GITHUB_ACTIONS", "true");
            vi.stubEnv("GITHUB_REPOSITORY", "acme/docs");

            await env.run(env.project(ONE_PAGE));

            expect(ledgerRegister(env.fdr).locales[0]?.git).toBeUndefined();
        });

        it("names the deployer from CIRCLE_USERNAME on other systems", async () => {
            vi.stubEnv("CIRCLECI", "true");
            vi.stubEnv("CIRCLE_USERNAME", "circleci-user");

            await env.run(env.project(ONE_PAGE));

            const headers = env.fdr.headersTo("POST /docs-ledger/register")[0] ?? {};
            expect(headers["x-deployer-author"]).toBe("circleci-user");
            expect(headers).not.toHaveProperty("x-ci-source");
        });
    });

    describe("the deploy lock of a legacy production publish", () => {
        const UNLOCK = "http://fdr.test/docs-deployment/unlock";

        function legacy(): void {
            env.setDeployMode("legacy");
            env.stubAxios("post", () => ({}));
        }

        it("is released when finishing the registration fails", async () => {
            legacy();
            env.fdr.reply("POST /v2/registry/docs/register/registration-1", { status: 500, body: {} });

            const { error, logs } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toBeDefined();
            expect(env.axiosCalls).toEqual([
                {
                    method: "post",
                    url: UNLOCK,
                    data: { domain: "acme.docs.buildwithfern.com", basepath: "/" },
                    headers: { Authorization: "Bearer token" }
                }
            ]);
            expect(logs).toContain("debug: Unlocking docs deploy due to early exit...");
        });

        it("is released with the base path of the instance", async () => {
            legacy();
            env.fdr.reply("POST /v2/registry/docs/register/registration-1", { status: 500, body: {} });
            const files = {
                ...ONE_PAGE,
                "docs.yml":
                    ONE_PAGE["docs.yml"]?.replace("acme.docs.buildwithfern.com", "acme.docs.buildwithfern.com/docs") ??
                    ""
            };

            await env.attempt(env.project(files));

            expect(env.axiosCalls[0]?.data).toEqual({ domain: "acme.docs.buildwithfern.com/docs", basepath: "/docs" });
        });

        it("is not taken, so nothing is released, when the registration itself fails", async () => {
            legacy();
            env.fdr.reply("POST /v2/registry/docs/v2/init", { status: 500, body: {} });

            const { error } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toBeDefined();
            expect(env.axiosCalls).toEqual([]);
        });

        it("is released when registering an API fails after the lock was taken", async () => {
            legacy();
            env.fdr.reply("POST /registry/api/register", { status: 400, body: {} });
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });

            const { error } = await settleWithFakeTimers(
                env.attempt(
                    env.project({
                        "fern.config.json": ONE_PAGE["fern.config.json"] ?? "",
                        "docs.yml":
                            "instances:\n  - url: acme.docs.buildwithfern.com\nnavigation:\n  - api: API\n    specs:\n      - type: openapi\n        path: openapi.yml\n",
                        "openapi.yml":
                            "openapi: 3.0.0\ninfo: { title: Pets, version: 1.0.0 }\npaths:\n  /pets:\n    get:\n      operationId: listPets\n      responses:\n        '200': { description: ok }\n"
                    })
                )
            );

            expect(error).toBeDefined();
            expect(env.axiosCalls.map((call) => call.url)).toEqual([UNLOCK]);
        });

        it("is released when the redirects check fails the publish", async () => {
            legacy();
            env.fdr.respond("POST /slugs/markdowns", {
                entries: [{ pageId: "gone.mdx", slug: "gone", domain: "acme.docs.buildwithfern.com" }]
            });
            const files = {
                ...ONE_PAGE,
                "docs.yml": `${ONE_PAGE["docs.yml"]}check:\n  rules:\n    missing-redirects: error\n`
            };

            const { error, errors } = await env.attempt(env.project(files));

            expect(error).toBeDefined();
            expect(errors).toContain('Failed to publish docs. "Some removed pages have no redirect."');
            expect(env.axiosCalls.map((call) => call.url)).toEqual([UNLOCK]);
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")).toEqual([]);
        });

        it("does not hide the original failure when the unlock itself fails", async () => {
            env.setDeployMode("legacy");
            env.fdr.reply("POST /v2/registry/docs/register/registration-1", { status: 500, body: {} });

            const { errors } = await env.attempt(env.project(ONE_PAGE));

            expect(env.axiosCalls.map((call) => call.url)).toEqual([UNLOCK]);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("Failed to publish docs to acme.docs.buildwithfern.com");
        });

        it("is not released after a successful publish", async () => {
            legacy();

            await env.run(env.project(ONE_PAGE));

            expect(env.axiosCalls).toEqual([]);
        });

        it("is never taken for a preview", async () => {
            legacy();
            env.fdr.reply("POST /v2/registry/docs/register/registration-1", { status: 500, body: {} });

            await env.attempt(env.project(ONE_PAGE), { preview: true });

            expect(env.axiosCalls).toEqual([]);
        });
    });

    describe("the signal handlers the command installs", () => {
        it("are removed again after a successful publish", async () => {
            const before = [process.listenerCount("SIGINT"), process.listenerCount("SIGTERM")];

            await env.run(env.project(ONE_PAGE));

            expect([process.listenerCount("SIGINT"), process.listenerCount("SIGTERM")]).toEqual(before);
        });

        it("are removed again after a failed publish", async () => {
            const before = [process.listenerCount("SIGINT"), process.listenerCount("SIGTERM")];
            env.fdr.reply("POST /docs-ledger/register", { status: 500, body: {} });

            await env.attempt(env.project(ONE_PAGE));

            expect([process.listenerCount("SIGINT"), process.listenerCount("SIGTERM")]).toEqual(before);
        });
    });
});
