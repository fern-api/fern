import { describe, expect, it } from "vitest";

import {
    docsFiles,
    ledgerApis,
    ledgerPages,
    ledgerPreviewRegister,
    ledgerRegister,
    legacyFinish,
    navigationNodes,
    uploadedBlobs,
    useDocsEnvironment
} from "./docsGenerateHarness.js";

// `fern generate --docs`: what is sent for a docs.yml with `translations:`, in the ledger (one request with every locale)
// and in the legacy registration (one extra request for each locale after the site is finished).

const INSTANCE = "instances:\n  - url: acme.docs.buildwithfern.com\n";
const TRANSLATIONS = "translations:\n  - lang: en\n    default: true\n  - lang: fr\n";
const NAVIGATION = "navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - page: Other\n    path: other.mdx\n";

const FRENCH_WELCOME = "---\nsidebar-title: Bienvenue\n---\n# Bienvenue\n";

const PROJECT = docsFiles(`${INSTANCE}${TRANSLATIONS}${NAVIGATION}`, {
    "welcome.mdx": "# Welcome\n",
    "other.mdx": "# Other\n",
    "translations/fr/welcome.mdx": FRENCH_WELCOME
});

describe("fern generate --docs: translations through the ledger", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    it("registers one locale entry for each language, the default first", async () => {
        await env.run(env.project(PROJECT));

        const body = ledgerRegister(env.fdr);
        expect(body.defaultLocale).toBe("en");
        expect(body.locales.map((locale) => locale.locale)).toEqual(["en", "fr"]);
    });

    it("tells FDR the languages the site has in the config of each locale", async () => {
        await env.run(env.project(PROJECT));

        for (const locale of ledgerRegister(env.fdr).locales) {
            expect(locale.config.translations).toEqual({ defaultLocale: "en", translations: ["en", "fr"] });
        }
    });

    it("sends the translated text of a page in its locale and the original text in the default", async () => {
        await env.run(env.project(PROJECT));

        const [english, french] = ledgerRegister(env.fdr).locales;
        expect(ledgerPages(env.fdr, english as never)["welcome.mdx"]).toBe("# Welcome\n");
        expect(ledgerPages(env.fdr, french as never)["welcome.mdx"]).toBe(FRENCH_WELCOME);
    });

    it("falls back to the original text for a page without a translation, and warns, naming the file", async () => {
        const { logs } = await env.run(env.project(PROJECT));

        const [english, french] = ledgerRegister(env.fdr).locales;
        expect(french?.pages["other.mdx"]).toEqual(english?.pages["other.mdx"]);
        expect(logs).toContain(
            'warn: Translation for locale "fr" is missing 1 page(s):\n  - translations/fr/other.mdx\nThese pages will fall back to the default language content.'
        );
    });

    it("takes the sidebar title of a locale from the front matter of its translated page", async () => {
        await env.run(env.project(PROJECT));

        const [english, french] = ledgerRegister(env.fdr).locales;
        const titles = (locale: typeof english): Array<string | undefined> =>
            navigationNodes(locale?.root)
                .filter((node) => node.type === "page")
                .map((node) => node.title);
        expect(titles(english)).toEqual(["Welcome", "Other"]);
        expect(titles(french)).toEqual(["Bienvenue", "Other"]);
    });

    it("keeps the URLs of a locale the same as the default's", async () => {
        await env.run(env.project(PROJECT));

        const [english, french] = ledgerRegister(env.fdr).locales;
        const slugs = (locale: typeof english): Array<string | undefined> =>
            navigationNodes(locale?.root)
                .filter((node) => node.type === "page")
                .map((node) => node.slug);
        expect(slugs(french)).toEqual(slugs(english));
    });

    it("uploads the blobs of every locale", async () => {
        await env.run(env.project(PROJECT));

        const hashes = ledgerRegister(env.fdr).locales.flatMap((locale) =>
            Object.values(locale.pages).map((page) => page.hash)
        );
        expect(new Set(uploadedBlobs(env.fdr).keys())).toEqual(new Set(hashes));
    });

    it("finishes with every locale it registered", async () => {
        await env.run(env.project(PROJECT));

        expect(env.fdr.to("POST /docs-ledger/register/finish")[0]?.body).toEqual(ledgerRegister(env.fdr));
    });

    it("never calls the legacy translation endpoint", async () => {
        await env.run(env.project(PROJECT));

        expect(env.fdr.to("POST /v2/registry/docs/translations/register")).toEqual([]);
    });

    it("makes the locale marked default the base of the site", async () => {
        const project = docsFiles(
            `${INSTANCE}translations:\n  - lang: en\n  - lang: fr\n    default: true\n${NAVIGATION}`,
            { "welcome.mdx": "# Welcome\n", "other.mdx": "# Other\n", "translations/en/welcome.mdx": "# W\n" }
        );

        await env.run(env.project(project));

        const body = ledgerRegister(env.fdr);
        expect(body.defaultLocale).toBe("fr");
        expect(body.locales.map((locale) => locale.locale)).toEqual(["fr", "en"]);
    });

    it("sends every locale in a preview, with the first at the top for older servers", async () => {
        await env.run(env.project(PROJECT), { preview: true });

        const body = ledgerPreviewRegister(env.fdr);
        expect(body.locales.map((locale) => locale.locale)).toEqual(["en", "fr"]);
        expect(body).toMatchObject({ defaultLocale: "en", locale: "en" });
        expect(env.fdr.to("POST /docs-ledger/register/finish")[0]?.body).toMatchObject({
            locales: body.locales
        });
    });

    it("stops before it sends anything when the directory of a language is missing", async () => {
        const project = docsFiles(`${INSTANCE}${TRANSLATIONS}navigation:\n  - page: Welcome\n    path: welcome.mdx\n`, {
            "welcome.mdx": "# Welcome\n"
        });

        const { error, errors } = await env.attempt(env.project(project));

        expect(error).toBeDefined();
        expect(errors.some((line) => line.includes("Missing translation directory for locale: fr"))).toBe(true);
        expect(errors.some((line) => line.startsWith('Translation directory for locale "fr" not found.'))).toBe(true);
        expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
    });
});

describe("fern generate --docs: translated API specs", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const spec = (description: string): string => `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /pet:
    get:
      operationId: getPet
      description: ${description}
      responses:
        "200": { description: ok }
`;

    const PROJECT_WITH_API = docsFiles(
        `${INSTANCE}${TRANSLATIONS}navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - api: Pets\n    api-name: pets\n`,
        {
            "welcome.mdx": "# Welcome\n",
            "translations/fr/welcome.mdx": "# Bienvenue\n",
            "apis/pets/generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n",
            "apis/pets/openapi/openapi.yml": spec("Hello"),
            "translations/fr/apis/pets/openapi/openapi.yml": spec("Bonjour")
        }
    );

    it("gives a locale its own manifest of APIs when it has a translated spec, under the same API id", async () => {
        await env.run(env.project(PROJECT_WITH_API));

        const [english, french] = ledgerRegister(env.fdr).locales;
        expect(english?.apiManifest?.hash).not.toBe(french?.apiManifest?.hash);
        expect(Object.keys(ledgerApis(env.fdr, english as never))).toEqual(
            Object.keys(ledgerApis(env.fdr, french as never))
        );
        expect(JSON.stringify(ledgerApis(env.fdr, english as never))).toContain("Hello");
        expect(JSON.stringify(ledgerApis(env.fdr, english as never))).not.toContain("Bonjour");
        expect(JSON.stringify(ledgerApis(env.fdr, french as never))).toContain("Bonjour");
    });

    it("registers the original spec and then the translated spec with FDR, also through the ledger", async () => {
        await env.run(env.project(PROJECT_WITH_API));

        const registered = env.fdr.to("POST /registry/api/register").map(({ body }) => JSON.stringify(body));
        expect(registered).toHaveLength(2);
        expect(registered[0]).toContain("Hello");
        expect(registered[1]).toContain("Bonjour");
    });

    it("shares the manifest of the default locale with a locale that has no translated spec", async () => {
        const project = docsFiles(
            `${INSTANCE}${TRANSLATIONS}navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - api: Pets\n    api-name: pets\n`,
            {
                "welcome.mdx": "# Welcome\n",
                "translations/fr/welcome.mdx": "# Bienvenue\n",
                "apis/pets/generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n",
                "apis/pets/openapi/openapi.yml": spec("Hello")
            }
        );

        await env.run(env.project(project));

        const [english, french] = ledgerRegister(env.fdr).locales;
        expect(french?.apiManifest?.hash).toBe(english?.apiManifest?.hash);
    });

    it("registers the translated spec with FDR in the legacy registration and points the locale's navigation at it", async () => {
        env.setDeployMode("legacy");
        env.fdr.respond("POST /registry/api/register", ({ body }) => ({
            apiDefinitionId: JSON.stringify(body).includes("Bonjour") ? "definition-fr" : "definition-en"
        }));

        const { logs } = await env.run(env.project(PROJECT_WITH_API));

        expect(env.fdr.to("POST /registry/api/register")).toHaveLength(2);
        expect(logs).toContain("info: Registering translated API definitions for 1 locale(s)...");
        const [translation] = env.fdr.to("POST /v2/registry/docs/translations/register");
        expect(JSON.stringify(translation?.body)).toContain('"apiDefinitionId":"definition-fr"');
        expect(JSON.stringify(legacyFinish(env.fdr).docsDefinition.config.root)).toContain(
            '"apiDefinitionId":"definition-en"'
        );
    });

    it("warns, and serves the original API in that locale, when the translated spec cannot be read", async () => {
        const project = docsFiles(
            `${INSTANCE}${TRANSLATIONS}navigation:\n  - page: Welcome\n    path: welcome.mdx\n  - api: Pets\n    api-name: pets\n`,
            {
                "welcome.mdx": "# Welcome\n",
                "translations/fr/welcome.mdx": "# Bienvenue\n",
                "apis/pets/generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n",
                "apis/pets/openapi/openapi.yml": spec("Hello"),
                "translations/fr/apis/pets/openapi/openapi.yml": "openapi: 3.0.0\ninfo: [unclosed\n"
            }
        );

        const { logs, error } = await env.attempt(env.project(project));

        expect(error).toBeUndefined();
        expect(
            logs.some(
                (line) =>
                    line.startsWith("warn: Translated API definition(s)") &&
                    line.includes('for locale "fr" diverge from the default-locale spec')
            )
        ).toBe(true);
        const [english, french] = ledgerRegister(env.fdr).locales;
        expect(french?.apiManifest?.hash).toBe(english?.apiManifest?.hash);
    });
});

describe("fern generate --docs: translations through the legacy registration", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const translationRequests = (): Array<{
        domain: string;
        customDomains: string[];
        orgId: string;
        locale: string;
        docsDefinition: ReturnType<typeof legacyFinish>["docsDefinition"];
    }> => env.fdr.to("POST /v2/registry/docs/translations/register").map((request) => request.body as never);

    it("finishes the site first, then registers each locale", async () => {
        env.setDeployMode("legacy");

        const { logs } = await env.run(env.project(PROJECT));

        const paths = env.fdr.requests.filter((request) => request.path !== "/health").map((request) => request.path);
        expect(paths).toEqual([
            "/v2/registry/docs/v2/init",
            "/slugs/markdowns",
            "/v2/registry/docs/register/registration-1",
            "/v2/registry/docs/translations/register"
        ]);
        expect(logs).toContain("info: Registering translations for 1 locale(s)...");
    });

    it("sends the domain, custom domains, organization and language with the translated definition", async () => {
        env.setDeployMode("legacy");
        const project = docsFiles(
            `instances:\n  - url: acme.docs.buildwithfern.com\n    custom-domain: docs.example.com\n${TRANSLATIONS}${NAVIGATION}`,
            { "welcome.mdx": "# Welcome\n", "other.mdx": "# Other\n", "translations/fr/welcome.mdx": FRENCH_WELCOME }
        );

        await env.run(env.project(project));

        const [request] = translationRequests();
        expect(request).toMatchObject({
            domain: "acme.docs.buildwithfern.com",
            customDomains: ["docs.example.com"],
            orgId: "acme",
            locale: "fr"
        });
    });

    it("sends the translated pages, with the original text for a page that has no translation", async () => {
        env.setDeployMode("legacy");

        await env.run(env.project(PROJECT));

        const [request] = translationRequests();
        expect(request?.docsDefinition.pages["welcome.mdx"]?.markdown).toBe(FRENCH_WELCOME);
        expect(request?.docsDefinition.pages["other.mdx"]?.markdown).toBe("# Other\n");
    });

    it("sends the translated sidebar titles", async () => {
        env.setDeployMode("legacy");

        await env.run(env.project(PROJECT));

        const [request] = translationRequests();
        expect(
            navigationNodes(request?.docsDefinition.config.root)
                .filter((node) => node.type === "page")
                .map((node) => node.title)
        ).toEqual(["Bienvenue", "Other"]);
    });

    it("sends the CLI version and the token with the request", async () => {
        env.setDeployMode("legacy");

        await env.run(env.project(PROJECT));

        const [headers] = env.fdr.headersTo("POST /v2/registry/docs/translations/register");
        expect(headers).toMatchObject({ authorization: "Bearer token", "x-cli-version": "0.0.0" });
    });

    it("registers a preview's locale against the preview address and with no custom domains", async () => {
        env.setDeployMode("legacy");
        env.fdr.respond("POST /v2/registry/docs/preview/init", {
            docsRegistrationId: "registration-1",
            uploadUrls: {},
            skippedFiles: [],
            previewUrl: "acme-preview-1.docs.buildwithfern.com"
        });

        await env.run(env.project(PROJECT), { preview: true });

        const [request] = translationRequests();
        expect(request).toMatchObject({
            domain: "acme-preview-1.docs.buildwithfern.com",
            customDomains: [],
            locale: "fr"
        });
    });

    // NOTE: the domain of a preview's translation is the preview URL exactly as FDR returned it, so a URL with a scheme
    // goes where the production publish sends a bare domain.
    it("sends the preview URL as it came, scheme included, as the domain of a translation", async () => {
        env.setDeployMode("legacy");

        await env.run(env.project(PROJECT), { preview: true });

        expect(translationRequests()[0]?.domain).toBe("https://acme-preview-1.docs.buildwithfern.com");
    });

    it("sends one request for each language besides the default", async () => {
        env.setDeployMode("legacy");
        const project = docsFiles(
            `${INSTANCE}translations:\n  - lang: en\n    default: true\n  - lang: fr\n  - lang: de\n${NAVIGATION}`,
            {
                "welcome.mdx": "# Welcome\n",
                "other.mdx": "# Other\n",
                "translations/fr/welcome.mdx": FRENCH_WELCOME,
                "translations/de/welcome.mdx": "# Willkommen\n"
            }
        );

        const { logs } = await env.run(env.project(project));

        expect(
            translationRequests()
                .map((request) => request.locale)
                .sort()
        ).toEqual(["de", "fr"]);
        expect(logs).toContain("info: Registering translations for 2 locale(s)...");
    });

    it("warns, and still publishes, when FDR refuses a locale", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply("POST /v2/registry/docs/translations/register", { status: 500, body: "boom" });

        const { logs, error } = await env.attempt(env.project(PROJECT));

        expect(error).toBeUndefined();
        const warning = logs.find((line) => line.startsWith('warn: Failed to register translations for locale "fr"'));
        expect(warning).toContain("HTTP 500");
        expect(logs.some((line) => line.startsWith("info: Published docs to "))).toBe(true);
    });

    it("warns, and still publishes, when the request for a locale fails outright", async () => {
        env.setDeployMode("legacy");
        env.fdr.reply("POST /v2/registry/docs/translations/register", "network-failure");

        const { logs, error } = await env.attempt(env.project(PROJECT));

        expect(error).toBeUndefined();
        expect(logs.find((line) => line.startsWith('warn: Failed to register translations for locale "fr"'))).toContain(
            "fetch failed"
        );
    });

    it("sends nothing about translations for a site without any", async () => {
        env.setDeployMode("legacy");
        const project = docsFiles(`${INSTANCE}${NAVIGATION}`, {
            "welcome.mdx": "# Welcome\n",
            "other.mdx": "# Other\n"
        });

        await env.run(env.project(project));

        expect(translationRequests()).toEqual([]);
    });
});
