import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { blobUploadUrl } from "./commandHarness.js";
import { docsFiles, ledgerRegister, ONE_PAGE, PETS_OPENAPI, useDocsEnvironment } from "./docsGenerateHarness.js";

// `fern generate --docs`: what the user sees when FDR or the network fails, and that nothing is finished afterwards.

const INSTANCE = "instances:\n  - url: acme.docs.buildwithfern.com\n";

describe("fern generate --docs: failures of FDR through the ledger", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const PUBLISH_FAILED = "Failed to publish docs via ledger to acme.docs.buildwithfern.com: ";

    it.each([
        [401, "Unauthorized", "UNAUTHORIZED"],
        [403, "Forbidden", "FORBIDDEN"],
        [404, "Not Found", "NOT_FOUND"],
        [409, "Conflict", "CONFLICT"],
        [500, "Internal Server Error", "INTERNAL_SERVER_ERROR"],
        [503, "Service Unavailable", "SERVICE_UNAVAILABLE"]
    ])("reports a %i on the registration with the status text and FDR's answer, and finishes nothing", async (status, text, code) => {
        env.fdr.reply("POST /docs-ledger/register", { status, body: { detail: "from FDR" } });

        const { error, errors } = await env.attempt(env.project(ONE_PAGE));

        expect(error).toBeDefined();
        expect(errors).toHaveLength(1);
        expect(errors[0]?.startsWith(`${PUBLISH_FAILED}${text} {`)).toBe(true);
        expect(errors[0]).toContain(`"code":"${code}"`);
        expect(errors[0]).toContain(`"status":${status}`);
        expect(errors[0]).toContain('"detail":"from FDR"');
        expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
        expect(env.fdr.requests.some((request) => request.method === "PUT")).toBe(false);
    });

    // NOTE: a 409 means another publish is running, and the legacy path waits and tries again. The ledger path does not.
    it("does not wait and retry when FDR answers 409 to the registration", async () => {
        env.fdr.reply("POST /docs-ledger/register", { status: 409, body: {} });

        await env.attempt(env.project(ONE_PAGE));

        expect(env.fdr.to("POST /docs-ledger/register")).toHaveLength(1);
    });

    it("lists the fields FDR says are wrong, one to a line", async () => {
        env.fdr.reply("POST /docs-ledger/register", {
            status: 400,
            body: {
                defined: false,
                code: "BAD_REQUEST",
                status: 400,
                message: "Input validation failed",
                data: {
                    issues: [
                        { message: "Required", path: ["locales", 0, "config", "title"] },
                        { message: "Invalid input" }
                    ]
                }
            }
        });

        const { errors } = await env.attempt(env.project(ONE_PAGE));

        expect(
            errors[0]?.startsWith(
                `${PUBLISH_FAILED}Input validation failed\n  - locales.0.config.title: Required\n  - Invalid input {`
            )
        ).toBe(true);
    });

    it("reports a request that never reaches FDR", async () => {
        env.fdr.reply("POST /docs-ledger/register", "network-failure");

        const { error, errors } = await env.attempt(env.project(ONE_PAGE));

        expect(error).toBeDefined();
        expect(errors).toEqual([`${PUBLISH_FAILED}fetch failed {}`]);
        expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
    });

    it("reports a failure of the finish, after the blobs went up, and publishes nothing more", async () => {
        env.fdr.reply("POST /docs-ledger/register/finish", { status: 500, body: {} });

        const { error, errors, logs } = await env.attempt(env.project(ONE_PAGE));

        expect(error).toBeDefined();
        expect(errors[0]?.startsWith(`${PUBLISH_FAILED}Internal Server Error {`)).toBe(true);
        expect(env.fdr.requests.some((request) => request.method === "PUT")).toBe(true);
        expect(logs.some((line) => line.startsWith("info: Published docs to"))).toBe(false);
    });

    it("reports a failure of the finish when the request never reaches FDR", async () => {
        env.fdr.reply("POST /docs-ledger/register/finish", "network-failure");

        const { errors } = await env.attempt(env.project(ONE_PAGE));

        expect(errors).toEqual([`${PUBLISH_FAILED}fetch failed {}`]);
    });

    it("sends the same request to the ledger of a preview, and reports its failures the same way", async () => {
        env.fdr.reply("POST /docs-ledger/preview/init", { status: 403, body: {} });

        const { error, errors } = await env.attempt(env.project(ONE_PAGE), { preview: true });

        expect(error).toBeDefined();
        expect(errors[0]?.startsWith(`${PUBLISH_FAILED}Forbidden {`)).toBe(true);
        expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
    });

    it("reports a failure of the finish of a preview", async () => {
        env.fdr.reply("POST /docs-ledger/register/finish", { status: 500, body: {} });

        const { errors } = await env.attempt(env.project(ONE_PAGE), { preview: true });

        expect(errors[0]?.startsWith(`${PUBLISH_FAILED}Internal Server Error {`)).toBe(true);
    });

    it("stops at the first blob FDR rejects, and does not finish", async () => {
        const hash = ledgerRegisterHashOf("# Welcome\n");
        env.fdr.reply(`PUT ${blobUploadUrl(hash)}`, { status: 403, body: "expired" });

        const { errors } = await env.attempt(env.project(ONE_PAGE));

        expect(errors[0]).toContain("Presigned URL rejected");
        expect(env.fdr.to("POST /docs-ledger/register/finish")).toEqual([]);
    });

    it("has told PostHog only that the command ran, when the ledger fails", async () => {
        env.fdr.reply("POST /docs-ledger/register", { status: 500, body: {} });

        const { events } = await env.attempt(env.project(ONE_PAGE));

        expect(events).toEqual([{ orgId: "acme", command: "fern generate --docs" }]);
    });
});

function ledgerRegisterHashOf(text: string): string {
    return createHash("sha256").update(text).digest("hex");
}

describe("fern generate --docs: failures of FDR through the legacy registration", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const INIT = "POST /v2/registry/docs/v2/init";
    const FINISH = "POST /v2/registry/docs/register/registration-1";

    // NOTE: the messages for 401, 403 and 409 that publishDocs has for this call read an error shape the FDR client no
    // longer produces, so every failure of the registration reads the same. docsGenerate.legacyErrors.command.test.ts
    // covers those messages with errors in the older shape.
    it.each([
        401, 403, 409, 500
    ])("reports a %i on the registration as a plain failure with FDR's answer", async (status) => {
        env.setDeployMode("legacy");
        env.fdr.reply(INIT, {
            status,
            body: { code: "FORBIDDEN", message: "User does not belong to organization acme" }
        });

        const { error, errors } = await env.attempt(env.project(ONE_PAGE));

        expect(error).toBeDefined();
        expect(errors).toHaveLength(1);
        expect(errors[0]?.startsWith("Failed to publish docs. {")).toBe(true);
        expect(errors[0]).toContain(`"status":${status}`);
        expect(errors[0]).toContain("User does not belong to organization acme");
    });

    it("does not recognise an error named InvalidCustomDomainError in FDR's answer", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply(INIT, { status: 400, body: { error: "InvalidCustomDomainError" } });

        const { errors } = await env.attempt(env.project(ONE_PAGE));

        expect(errors[0]?.startsWith("Failed to publish docs. {")).toBe(true);
        expect(errors.join("\n")).not.toContain("Your docs domain should end with");
    });

    it("reports a request that never reaches FDR", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply(INIT, "network-failure");

        const { error, errors } = await env.attempt(env.project(ONE_PAGE));

        expect(error).toBeDefined();
        expect(errors).toEqual(["Failed to publish docs. {}"]);
    });

    it("reports the failure to PostHog with the error, and sends nothing more to FDR", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply(INIT, { status: 500, body: {} });

        const { events } = await env.attempt(env.project(ONE_PAGE));

        expect(events).toHaveLength(2);
        expect(events[1]).toMatchObject({
            command: "docs-generation",
            properties: { error: expect.stringContaining('"status":500') }
        });
        expect(env.fdr.requests.map((request) => request.path).filter((path) => path !== "/health")).toEqual([
            "/v2/registry/docs/v2/init"
        ]);
    });

    it("reports the failure of a preview registration the same way", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply("POST /v2/registry/docs/preview/init", { status: 401, body: {} });

        const { errors } = await env.attempt(env.project(ONE_PAGE), { preview: true });

        expect(errors[0]?.startsWith("Failed to publish docs. {")).toBe(true);
        expect(env.fdr.to(FINISH)).toEqual([]);
    });

    it.each([401, 403, 500])("names the domain when the finish answers %i, and releases the lock", async (status) => {
        env.setDeployMode("legacy");
        env.stubAxios("post", () => ({}));
        env.fdr.reply(FINISH, { status, body: {} });

        const { error, errors } = await env.attempt(env.project(ONE_PAGE));

        expect(error).toBeDefined();
        expect(errors[0]?.startsWith("Failed to publish docs to acme.docs.buildwithfern.com {")).toBe(true);
        expect(env.axiosCalls.map((call) => call.url)).toEqual(["http://fdr.test/docs-deployment/unlock"]);
    });

    it("reports a finish that never reaches FDR", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply(FINISH, "network-failure");

        const { errors } = await env.attempt(env.project(ONE_PAGE));

        expect(errors).toEqual(["Failed to publish docs to acme.docs.buildwithfern.com {}"]);
    });

    it("reports a failed finish of a preview and does not claim the docs were published", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply(FINISH, { status: 500, body: {} });

        const { errors, logs } = await env.attempt(env.project(ONE_PAGE), { preview: true });

        expect(errors[0]?.startsWith("Failed to publish docs to acme.docs.buildwithfern.com {")).toBe(true);
        expect(logs.some((line) => line.startsWith("info: Published docs to"))).toBe(false);
    });
});

describe("fern generate --docs: things that fail without stopping the publish", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    describe("a dynamic IR that cannot be uploaded", () => {
        const PROJECT = docsFiles(
            `${INSTANCE}navigation:\n  - api: API Reference\n    snippets:\n      typescript:\n        package: "@acme/sdk"\n        version: 1.0.0\n`,
            {
                "openapi/openapi.yml": PETS_OPENAPI,
                "generators.yml": `api:
  specs:
    - openapi: openapi/openapi.yml
groups:
  sdks:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 3.0.0
        output:
          location: npm
          package-name: "@acme/sdk"
`
            }
        );
        const UPLOAD = "https://s3.test/typescript";

        function withUploadUrl(): void {
            env.fdr.respond("POST /registry/api/register", {
                apiDefinitionId: "definition-1",
                dynamicIRs: { typescript: { uploadUrl: UPLOAD } }
            });
        }

        it("only warns, naming the API and the language, when FDR refuses the upload", async () => {
            withUploadUrl();
            env.fdr.reply(`PUT ${UPLOAD}`, { status: 500, body: {} });

            const { error, logs } = await env.attempt(env.project(PROJECT));

            expect(error).toBeUndefined();
            expect(logs).toContain("warn: Failed to upload dynamic IR for definition-1:typescript");
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("only warns when the upload never reaches the server", async () => {
            withUploadUrl();
            env.fdr.reply(`PUT ${UPLOAD}`, "network-failure");

            const { error, logs } = await env.attempt(env.project(PROJECT));

            expect(error).toBeUndefined();
            expect(
                logs.some((line) =>
                    line.startsWith("warn: Network error uploading dynamic IR for definition-1:typescript:")
                )
            ).toBe(true);
        });

        it("does not upload with skipUpload, and says so", async () => {
            withUploadUrl();

            const { logs } = await env.run(env.project(PROJECT), { skipUpload: true });

            expect(env.fdr.to(`PUT ${UPLOAD}`)).toEqual([]);
            expect(logs).toContain("debug: Skip-upload mode: skipping dynamic IR uploads");
        });

        it("uploads the dynamic IR as JSON", async () => {
            withUploadUrl();

            await env.run(env.project(PROJECT));

            const [upload] = env.fdr.to(`PUT ${UPLOAD}`);
            expect(typeof upload?.body).toBe("object");
            expect(env.fdr.headersTo(`PUT ${UPLOAD}`)[0]?.["content-type"]).toBe("application/octet-stream");
        });
    });

    describe("the check for missing redirects", () => {
        it("does not hold up the publish when FDR times out", async () => {
            env.fdr.reply("POST /slugs/markdowns", "network-failure");

            const { error } = await env.attempt(env.project(ONE_PAGE));

            expect(error).toBeUndefined();
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });
    });
});

describe("fern generate --docs: the global theme", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const THEME_URL = "http://fdr.test/v2/registry/themes/acme/brand";
    const WITH_THEME = (extra = ""): Record<string, string> => ({
        ...ONE_PAGE,
        "docs.yml": `${ONE_PAGE["docs.yml"]}global-theme: brand\n${extra}`
    });

    const configSent = (): Record<string, unknown> => ledgerRegister(env.fdr).locales[0]?.config ?? {};

    it("is fetched from FDR with the token, for the organization, before the docs are resolved", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: {} });

        const { logs } = await env.run(env.project(WITH_THEME()));

        expect(env.fdr.to(`GET ${THEME_URL}`)).toHaveLength(1);
        expect(env.fdr.headersTo(`GET ${THEME_URL}`)[0]).toMatchObject({
            authorization: "Bearer token",
            "accept-encoding": "identity"
        });
        expect(logs).toContain('info: Fetching global theme "brand" for org "acme"...');
        expect(logs.some((line) => line.startsWith('info: Applied global theme "brand"'))).toBe(true);
    });

    it("is not fetched when docs.yml names none", async () => {
        await env.run(env.project(ONE_PAGE));

        expect(env.fdr.requests.some((request) => request.path.startsWith("/v2/registry/themes"))).toBe(false);
    });

    it("sets the branding the docs do not set themselves", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", {
            config: {
                colors: { "accent-primary": "#112233" },
                "navbar-links": [{ type: "secondary", text: "Help", href: "https://acme.com/help" }],
                announcement: { message: "Hello from the theme" }
            }
        });

        await env.run(env.project(WITH_THEME()));

        expect(configSent()).toMatchObject({
            colorsV3: { accentPrimary: { r: 17, g: 34, b: 51 } },
            navbarLinks: [{ type: "secondary", text: "Help", url: "https://acme.com/help" }],
            announcement: { text: "Hello from the theme" }
        });
    });

    it("wins over what docs.yml sets for the same branding", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: { colors: { "accent-primary": "#112233" } } });

        await env.run(env.project(WITH_THEME('colors:\n  accent-primary: "#ff0000"\n')));

        expect(configSent()).toMatchObject({ colorsV3: { accentPrimary: { r: 17, g: 34, b: 51 } } });
    });

    it("keeps the parts of an object the theme does not set", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: { colors: { "accent-primary": "#112233" } } });

        await env.run(env.project(WITH_THEME('colors:\n  background:\n    dark: "#000000"\n    light: "#ffffff"\n')));

        expect(configSent()).toMatchObject({
            colorsV3: {
                dark: { accentPrimary: { r: 17, g: 34, b: 51 }, background: { r: 0, g: 0, b: 0 } },
                light: { accentPrimary: { r: 17, g: 34, b: 51 }, background: { r: 255, g: 255, b: 255 } }
            }
        });
    });

    it("leaves the title to docs.yml", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: { title: "From the theme" } });

        await env.run(env.project(WITH_THEME("title: From docs.yml\n")));

        expect(configSent().title).toBe("From docs.yml");
    });

    it("is fetched for the legacy registration too", async () => {
        env.setDeployMode("legacy");
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: {} });

        await env.run(env.project(WITH_THEME()));

        expect(env.fdr.to(`GET ${THEME_URL}`)).toHaveLength(1);
    });

    it("stops, saying how to upload it, when FDR has no theme of that name (404)", async () => {
        env.fdr.reply(`GET ${THEME_URL}`, { status: 404, body: {} });

        const { error, errors } = await env.attempt(env.project(WITH_THEME()));

        expect(error).toBeDefined();
        expect(errors).toEqual([
            'Global theme "brand" not found for org "acme". Upload it first with: fern beta docs theme upload --name brand'
        ]);
        expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
    });

    it("stops the same way when FDR answers 200 with a NOT_FOUND error in the body", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { error: { code: "NOT_FOUND", message: "no" } });

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors[0]).toContain('Global theme "brand" not found for org "acme".');
    });

    it("stops with FDR's message when the body carries another error", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { error: { code: "FORBIDDEN", message: "not yours" } });

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors).toEqual(['Failed to fetch global theme "brand": not yours']);
    });

    it("stops with the status when FDR answers with a failure", async () => {
        env.fdr.reply(`GET ${THEME_URL}`, { status: 500, body: {} });

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors).toEqual(['Failed to fetch global theme "brand": HTTP 500']);
    });

    it("stops when the body is not JSON, quoting the start of it", async () => {
        env.fdr.reply(`GET ${THEME_URL}`, { status: 200, raw: "<html>gateway</html>" });

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors).toEqual([
            'Failed to fetch global theme "brand": unexpected response from server — <html>gateway</html>'
        ]);
    });

    it("stops when the answer has no config", async () => {
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { something: "else" });

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors).toEqual(['Failed to fetch global theme "brand": response missing "config" field']);
    });

    it("stops, naming the origin, when FDR cannot be reached", async () => {
        env.fdr.reply(`GET ${THEME_URL}`, "network-failure");

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors[0]?.startsWith('Could not reach FDR at http://fdr.test to fetch global theme "brand"')).toBe(
            true
        );
        expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
    });

    it("stops when a file of the theme cannot be downloaded", async () => {
        const download =
            "https://assets.test/logo.svg?X-Amz-Signature=abc&response-content-disposition=attachment%3B%20filename%3D%22logo.svg%22";
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: { favicon: download } });
        env.fdr.reply(`GET https://assets.test/logo.svg`, { status: 403, body: {} });

        const { errors } = await env.attempt(env.project(WITH_THEME()));

        expect(errors[0]).toContain(
            'Failed to download assets for global theme "brand": Failed to download theme asset: 403'
        );
    });

    it("downloads a file of the theme and publishes it as the favicon", async () => {
        const download =
            "https://assets.test/logo.svg?X-Amz-Signature=abc&response-content-disposition=attachment%3B%20filename%3D%22themefav.svg%22";
        env.fdr.respond("GET /v2/registry/themes/acme/brand", { config: { favicon: download } });
        env.fdr.reply("GET https://assets.test/logo.svg", () => ({ status: 200, body: {} }));

        const { error } = await env.attempt(env.project(WITH_THEME()));

        // The theme's files go to a folder in the system's temporary directory that later runs reuse, so a name taken by an
        // earlier run gets a number (themefav-1.svg).
        expect(error).toBeUndefined();
        expect(env.fdr.to("GET https://assets.test/logo.svg")).toHaveLength(1);
        expect(
            Object.keys(ledgerRegister(env.fdr).locales[0]?.fileManifest ?? {}).some((path) =>
                /themefav(-\d+)?\.svg$/.test(path)
            )
        ).toBe(true);
    });
});
