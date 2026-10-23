import { describe, expect, it, vi } from "vitest";

import {
    docsFiles,
    FAKE_TIMEOUTS,
    ledgerApis,
    ledgerRegister,
    legacyFinish,
    navigationNodes,
    OPENAPI_DOCS,
    PETS_OPENAPI,
    settleWithFakeTimers,
    useDocsEnvironment
} from "./docsGenerateHarness.js";

// `fern generate --docs`: how the APIs a docs.yml shows are loaded, validated, registered with FDR and put in the navigation.

const INSTANCE = "instances:\n  - url: acme.docs.buildwithfern.com\n";

/** A one-operation OpenAPI spec; `extra` goes into the operation. */
function spec({ path = "/pet/{petId}", operationId = "getPet", extra = "", title = "Pets" } = {}): string {
    return `openapi: 3.0.0
info: { title: ${title}, version: 1.0.0 }
paths:
  ${path}:
    get:
      operationId: ${operationId}
${extra}      responses:
        "200": { description: ok }
`;
}

/** A docs project with one API per entry of `apis` (folder `apis/<name>`) and a navigation entry for each. */
function apisProject(apis: Record<string, string>, navigation?: string): Record<string, string> {
    const files: Record<string, string> = {};
    for (const [name, openapi] of Object.entries(apis)) {
        files[`apis/${name}/generators.yml`] = "api:\n  specs:\n    - openapi: openapi/openapi.yml\n";
        files[`apis/${name}/openapi/openapi.yml`] = openapi;
    }
    const entries =
        navigation ??
        Object.keys(apis)
            .map((name) => `  - api: ${name}\n    api-name: ${name}\n`)
            .join("");
    return docsFiles(`${INSTANCE}navigation:\n${entries}`, files);
}

describe("fern generate --docs: APIs", { timeout: 60_000 }, () => {
    const env = useDocsEnvironment();

    const registrations = (): Array<{ orgId: string; apiId: string; definition: Record<string, unknown> }> =>
        env.fdr.to("POST /registry/api/register").map((request) => request.body as never);

    const endpointsOf = (definition: Record<string, unknown>): string[] => {
        const root = definition.rootPackage as { endpoints: Array<{ originalEndpointId?: string; name?: string }> };
        return root.endpoints.map((endpoint) => endpoint.name ?? "");
    };

    const locale = () => {
        const [first] = ledgerRegister(env.fdr).locales;
        if (first == null) {
            throw new Error("no locale");
        }
        return first;
    };

    describe("an OpenAPI spec written in docs.yml", () => {
        it("registers one API definition with FDR, for the organization and under the spec's title", async () => {
            await env.run(env.project(OPENAPI_DOCS));

            expect(registrations()).toHaveLength(1);
            expect(registrations()[0]).toMatchObject({ orgId: "acme", apiId: "Pets" });
            expect(endpointsOf(registrations()[0]?.definition ?? {})).toEqual(["Get Pet"]);
        });

        it("registers the API before it finishes the site, and sends the token", async () => {
            await env.run(env.project(OPENAPI_DOCS));

            const paths = env.fdr.requests.map((request) => request.path);
            expect(paths.indexOf("/registry/api/register")).toBeLessThan(paths.indexOf("/docs-ledger/register"));
            expect(env.fdr.headersTo("POST /registry/api/register")[0]?.authorization).toBe("Bearer token");
        });

        it("puts the API in the navigation under the id FDR gave the definition", async () => {
            env.fdr.respond("POST /registry/api/register", { apiDefinitionId: "definition-42" });

            await env.run(env.project(OPENAPI_DOCS));

            const reference = navigationNodes(locale().root).find((node) => node.type === "apiReference");
            expect(reference).toMatchObject({ title: "API Reference", slug: "api-reference" });
            expect(JSON.stringify(locale().root)).toContain('"apiDefinitionId":"definition-42"');
            expect(JSON.stringify(locale().root)).not.toContain("definition-1");
        });

        it("lists each endpoint under the API, slugged by its name", async () => {
            await env.run(env.project(OPENAPI_DOCS));

            expect(navigationNodes(locale().root).filter((node) => node.type === "endpoint")).toEqual([
                { type: "endpoint", title: "Get Pet", slug: "api-reference/get-pet" }
            ]);
        });

        it("sends the definition itself to the ledger, in the manifest of APIs, under the id FDR gave it", async () => {
            env.fdr.respond("POST /registry/api/register", { apiDefinitionId: "definition-42" });

            await env.run(env.project(OPENAPI_DOCS));

            const apis = ledgerApis(env.fdr, locale());
            expect(Object.keys(apis)).toEqual(["definition-42"]);
            expect(apis["definition-42"]).toEqual(registrations()[0]?.definition);
        });

        it("sends no manifest of APIs when the docs have none", async () => {
            await env.run(
                env.project(
                    docsFiles(`${INSTANCE}navigation:\n  - page: Welcome\n    path: welcome.mdx\n`, {
                        "welcome.mdx": "# Welcome\n"
                    })
                )
            );

            expect(locale().apiManifest).toBeNull();
            expect(registrations()).toEqual([]);
        });

        it("registers the same definition in the legacy registration, and sends the navigation that points at it", async () => {
            env.setDeployMode("legacy");
            env.fdr.respond("POST /registry/api/register", { apiDefinitionId: "definition-42" });

            await env.run(env.project(OPENAPI_DOCS));

            expect(registrations()).toHaveLength(1);
            expect(JSON.stringify(legacyFinish(env.fdr).docsDefinition.config.root)).toContain(
                '"apiDefinitionId":"definition-42"'
            );
        });

        it("registers the API of a preview too", async () => {
            await env.run(env.project(OPENAPI_DOCS), { preview: true });

            expect(registrations()).toHaveLength(1);
            expect(env.fdr.to("POST /docs-ledger/preview/init")).toHaveLength(1);
        });

        it("sends nothing about SDK snippets when docs.yml has none", async () => {
            await env.run(env.project(OPENAPI_DOCS));

            expect(env.fdr.requests.filter((request) => request.path.includes("dynamic-ir"))).toEqual([]);
            expect(Object.keys(env.fdr.to("POST /registry/api/register")[0]?.body as object)).toEqual([
                "orgId",
                "apiId",
                "definition"
            ]);
        });
    });

    describe("APIs from API folders", () => {
        it("registers each API under its api-name and shows them in the order docs.yml lists them", async () => {
            const project = apisProject({
                pets: spec(),
                store: spec({ path: "/order/{orderId}", operationId: "getOrder" })
            });

            env.fdr.respond("POST /registry/api/register", ({ body }) => ({
                apiDefinitionId: `definition-${(body as { apiId: string }).apiId}`
            }));

            await env.run(env.project(project));

            expect(
                registrations()
                    .map((registration) => registration.apiId)
                    .sort()
            ).toEqual(["pets", "store"]);
            expect(
                navigationNodes(locale().root)
                    .filter((node) => node.type === "apiReference")
                    .map((node) => node.slug)
            ).toEqual(["pets", "store"]);
            expect(Object.keys(ledgerApis(env.fdr, locale())).sort()).toEqual(["definition-pets", "definition-store"]);
        });

        it("keeps each API's endpoints under that API", async () => {
            const project = apisProject({
                pets: spec(),
                store: spec({ path: "/order/{orderId}", operationId: "getOrder" })
            });

            await env.run(env.project(project));

            expect(
                navigationNodes(locale().root)
                    .filter((node) => node.type === "endpoint")
                    .map((node) => node.slug)
            ).toEqual(["pets/get-pet", "store/get-order"]);
        });

        it("reads an API from a generators.yml next to docs.yml", async () => {
            const project = docsFiles(`${INSTANCE}navigation:\n  - api: API Reference\n`, {
                "generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n",
                "openapi/openapi.yml": PETS_OPENAPI
            });

            await env.run(env.project(project));

            expect(registrations()).toHaveLength(1);
            expect(navigationNodes(locale().root).filter((node) => node.type === "endpoint")).toHaveLength(1);
        });

        it("reads an API written as a Fern definition, falling back to the older parser, which it says", async () => {
            const project = docsFiles(`${INSTANCE}navigation:\n  - api: Pets API\n`, {
                "generators.yml": "{}\n",
                "definition/api.yml": "name: pets\n",
                "definition/pets.yml":
                    "service:\n  auth: false\n  base-path: /pets\n  endpoints:\n    list:\n      method: GET\n      path: ''\n      response: list<string>\n"
            });

            const { logs } = await env.run(env.project(project));

            expect(registrations().map((registration) => registration.apiId)).toEqual(["pets"]);
            expect(logs.some((line) => line.startsWith("warn: v3 parser failed for API definition:"))).toBe(true);
            expect(logs.some((line) => line.endsWith("Falling back to the v2 parser."))).toBe(true);
        });

        it("registers an API used by several versions once, and points each version at it", async () => {
            const project = docsFiles(
                `${INSTANCE}versions:\n  - display-name: v2\n    path: versions/v2.yml\n    slug: v2\n  - display-name: v1\n    path: versions/v1.yml\n    slug: v1\n`,
                {
                    "versions/v2.yml": "navigation:\n  - api: Pets\n    api-name: pets\n",
                    "versions/v1.yml": "navigation:\n  - api: Pets\n    api-name: pets\n",
                    "apis/pets/generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n",
                    "apis/pets/openapi/openapi.yml": spec()
                }
            );

            await env.run(env.project(project));

            expect(registrations()).toHaveLength(1);
            const ids = JSON.stringify(locale().root).match(/"apiDefinitionId":"[^"]+"/g) ?? [];
            expect(new Set(ids).size).toBe(1);
            expect(ids.length).toBeGreaterThan(1);
        });

        it("sends only the endpoints of the audiences the API section names", async () => {
            const openapi = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /public:
    get:
      operationId: getPublic
      x-fern-audiences: [external]
      responses:
        "200": { description: ok }
  /internal:
    get:
      operationId: getInternal
      x-fern-audiences: [internal]
      responses:
        "200": { description: ok }
`;
            const project = docsFiles(
                `${INSTANCE}navigation:\n  - api: Pets\n    api-name: pets\n    audiences:\n      - external\n`,
                {
                    "apis/pets/generators.yml": "api:\n  specs:\n    - openapi: openapi/openapi.yml\n",
                    "apis/pets/openapi/openapi.yml": openapi
                }
            );

            await env.run(env.project(project));

            expect(endpointsOf(registrations()[0]?.definition ?? {})).toEqual(["Get Public"]);
        });

        it("sends every endpoint when the API section names no audience", async () => {
            const openapi = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /public:
    get:
      operationId: getPublic
      x-fern-audiences: [external]
      responses:
        "200": { description: ok }
  /internal:
    get:
      operationId: getInternal
      x-fern-audiences: [internal]
      responses:
        "200": { description: ok }
`;

            await env.run(env.project(apisProject({ pets: openapi })));

            expect(endpointsOf(registrations()[0]?.definition ?? {}).sort()).toEqual(["Get Internal", "Get Public"]);
        });
    });

    describe("what docs.yml hides or shows", () => {
        const TWILIO = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /public:
    get:
      operationId: getPublic
      x-twilio: { docsVisibility: public }
      responses:
        "200": { description: ok }
  /private:
    get:
      operationId: getPrivate
      x-twilio: { docsVisibility: private }
      responses:
        "200": { description: ok }
  /hidden:
    get:
      operationId: getHidden
      x-twilio: { docsVisibility: hidden }
      responses:
        "200": { description: ok }
`;

        it("leaves out the endpoints marked private or hidden by default", async () => {
            await env.run(env.project(apisProject({ pets: TWILIO })));

            expect(endpointsOf(registrations()[0]?.definition ?? {})).toEqual(["Get Public"]);
        });

        it("includes the private endpoints with includePrivate, and still not the hidden ones", async () => {
            await env.run(env.project(apisProject({ pets: TWILIO })), { includePrivate: true });

            expect(endpointsOf(registrations()[0]?.definition ?? {}).sort()).toEqual(["Get Private", "Get Public"]);
        });

        it("includes the private endpoints in the preview too", async () => {
            await env.run(env.project(apisProject({ pets: TWILIO })), { includePrivate: true, preview: true });

            expect(endpointsOf(registrations()[0]?.definition ?? {}).sort()).toEqual(["Get Private", "Get Public"]);
        });

        // NOTE: disableTemplates is accepted by the command but nothing reads it, so it changes nothing that is sent.
        it("sends the same thing with disableTemplates", async () => {
            await env.run(env.project(OPENAPI_DOCS));
            const withDefault = {
                registered: registrations()[0],
                root: locale().root,
                pages: locale().pages,
                apiManifest: locale().apiManifest
            };
            const secondFdr = env.fdr.requests.length;

            await env.run(env.project(OPENAPI_DOCS), { disableTemplates: true });

            const second = env.fdr.requests.slice(secondFdr);
            const registeredAgain = second.find((request) => request.path === "/registry/api/register")?.body;
            const [, again] = env.fdr.to("POST /docs-ledger/register");
            expect(registeredAgain).toEqual(withDefault.registered);
            expect(JSON.stringify((again?.body as { locales: Array<{ root: unknown }> }).locales[0]?.root)).toBe(
                JSON.stringify(withDefault.root)
            );
            expect((again?.body as { locales: Array<{ pages: unknown }> }).locales[0]?.pages).toEqual(
                withDefault.pages
            );
        });
    });

    // NOTE: an API the command reports as skipped is not left out. The docs resolver does not find it among the checked
    // workspaces, says "v3 parser failed", falls back to the v2 parser and registers the API anyway, content the check
    // objected to included.
    describe("an API that does not pass validation", () => {
        const WITH_FRONTMATTER = spec({ extra: "      description: |\n        First\n        ---\n        Second\n" });
        const WITH_EMOJI_TAG = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
tags:
  - name: "Café"
paths:
  /pet:
    get:
      operationId: getPet
      tags: ["Café"]
      responses:
        "200": { description: ok }
`;
        const GOOD = spec({ path: "/ok", operationId: "ok" });

        it("is reported as skipped, with the number of problems and the reason, and the publish goes on", async () => {
            const { logs, error } = await env.attempt(env.project(apisProject({ bad: WITH_FRONTMATTER, good: GOOD })));

            expect(error).toBeUndefined();
            expect(logs).toContain(
                'error: Skipping API bad due to 1 validation error:\n  - 1 endpoint contain "---" frontmatter delimiters that will cause 500 errors on the docs site'
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("is still registered, through the older parser, which it says", async () => {
            const { logs } = await env.run(env.project(apisProject({ bad: WITH_FRONTMATTER, good: GOOD })));

            expect(
                registrations()
                    .map((registration) => registration.apiId)
                    .sort()
            ).toEqual(["bad", "good"]);
            const warning = logs.find((line) => line.startsWith('warn: v3 parser failed for API definition "bad"'));
            expect(warning).toContain("A valid API configuration was not found at the path:");
            expect(warning).toContain("Falling back to the v2 parser.");
            expect(logs.some((line) => line.startsWith('warn: v3 parser failed for API definition "good"'))).toBe(
                false
            );
        });

        it("is registered with the text the check objected to", async () => {
            await env.run(env.project(apisProject({ bad: WITH_FRONTMATTER })));

            const root = registrations()[0]?.definition.rootPackage as { endpoints: Array<{ description?: string }> };
            expect(root.endpoints[0]?.description).toBe("First\n---\nSecond");
        });

        it("names the tags whose names have characters a URL cannot carry, and registers the API anyway", async () => {
            const { logs } = await env.run(env.project(apisProject({ cafe: WITH_EMOJI_TAG })));

            expect(
                logs.some(
                    (line) =>
                        line.startsWith("error: Skipping API cafe due to 1 validation error:") &&
                        line.includes("1 tag contain non-ASCII characters: Café")
                )
            ).toBe(true);
            expect(registrations().map((registration) => registration.apiId)).toEqual(["cafe"]);
        });

        it("is reported with the reason when its spec cannot be read at all", async () => {
            const project = apisProject({ broken: "openapi: 3.0.0\ninfo: [unclosed\n", good: GOOD });

            const { logs } = await env.run(env.project(project));

            expect(logs.some((line) => line.startsWith("error: Skipping API broken: "))).toBe(true);
            expect(logs.some((line) => line.startsWith("error: Skipping API good"))).toBe(false);
        });

        it("counts several problems in the message", async () => {
            const twoOperations = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /a:
    get:
      operationId: a
      description: |
        x
        ---
        y
      responses:
        "200": { description: ok }
  /b:
    get:
      operationId: b
      description: |
        x
        ---
        y
      responses:
        "200": { description: ok }
`;

            const { logs } = await env.run(env.project(apisProject({ bad: twoOperations })));

            expect(logs).toContain(
                'error: Skipping API bad due to 2 validation errors:\n  - 2 endpoints contain "---" frontmatter delimiters that will cause 500 errors on the docs site'
            );
        });

        it("says nothing about an API that passes", async () => {
            const { logs } = await env.run(env.project(apisProject({ good: GOOD })));

            expect(logs.some((line) => line.includes("Skipping API"))).toBe(false);
        });
    });

    describe("when FDR refuses an API", () => {
        it("tries four times with growing waits, then gives up, naming the API, and publishes nothing", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.reply("POST /registry/api/register", { status: 500, body: { message: "down" } });

            const { error, errors, logs } = await settleWithFakeTimers(
                env.attempt(env.project(apisProject({ pets: spec() })))
            );

            expect(error).toBeDefined();
            expect(registrations()).toHaveLength(4);
            const retries = logs.filter((line) => line.startsWith("warn: registerApiDefinition failed for pets"));
            expect(retries).toHaveLength(3);
            expect(retries[0]).toMatch(/\(attempt 1\/4\), retrying in \d+ms\.\.\.$/);
            expect(errors[0]).toContain("FDR registerApiDefinition failed. Error details:");
            expect(
                errors.some((line) =>
                    line.startsWith(
                        "Failed to publish docs because API definition (pets) could not be uploaded. Please contact support@buildwithfern.com"
                    )
                )
            ).toBe(true);
            expect(env.fdr.to("POST /docs-ledger/register")).toEqual([]);
        });

        // NOTE: the check for "transient" errors reads a status code the FDR client does not put on its errors, so a 400
        // or 401 is retried like a 500.
        it("retries a refusal that is not transient (400) as well", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.reply("POST /registry/api/register", { status: 400, body: { message: "bad" } });

            await settleWithFakeTimers(env.attempt(env.project(apisProject({ pets: spec() }))));

            expect(registrations()).toHaveLength(4);
        });

        it("goes on when a retry works", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.replyTimes("POST /registry/api/register", 2, { status: 503, body: {} });

            const { logs } = await settleWithFakeTimers(env.run(env.project(apisProject({ pets: spec() }))));

            expect(registrations()).toHaveLength(3);
            expect(logs.filter((line) => line.startsWith("warn: registerApiDefinition failed for pets"))).toHaveLength(
                2
            );
            expect(env.fdr.to("POST /docs-ledger/register/finish")).toHaveLength(1);
        });

        it("names no API when the spec was written in docs.yml", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.reply("POST /registry/api/register", { status: 500, body: {} });

            const { errors } = await settleWithFakeTimers(env.attempt(env.project(OPENAPI_DOCS)));

            expect(errors.some((line) => line.startsWith("Failed to publish docs because API definition"))).toBe(true);
        });

        it("releases the deploy lock of a legacy production publish", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.setDeployMode("legacy");
            env.stubAxios("post", () => ({}));
            env.fdr.reply("POST /registry/api/register", { status: 500, body: {} });

            await settleWithFakeTimers(env.attempt(env.project(apisProject({ pets: spec() }))));

            expect(env.axiosCalls.map((call) => call.url)).toEqual(["http://fdr.test/docs-deployment/unlock"]);
        });
    });
});
