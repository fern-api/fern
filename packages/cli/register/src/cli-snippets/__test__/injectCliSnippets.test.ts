import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";
import {
    CLI_SNIPPET_LANGUAGE,
    injectCliSnippetsIntoApiDefinition,
    reconstructOpenApiPath
} from "../injectCliSnippets.js";
import { CliCatalog } from "../types.js";

type ApiDefinition = FdrCjsSdk.api.v1.register.ApiDefinition;
type EndpointDefinition = FdrCjsSdk.api.v1.register.EndpointDefinition;
type ExampleEndpointCall = FdrCjsSdk.api.v1.register.ExampleEndpointCall;
type EndpointPathPart = FdrCjsSdk.api.v1.register.EndpointPathPart;

function part(value: string, type: "literal" | "pathParameter"): EndpointPathPart {
    return { type, value } as EndpointPathPart;
}

function makeExample(partial: Partial<ExampleEndpointCall> = {}): ExampleEndpointCall {
    return {
        path: "",
        pathParameters: {},
        queryParameters: {},
        headers: {},
        responseStatusCode: 200,
        ...partial
    } as ExampleEndpointCall;
}

function makeEndpoint(opts: {
    method: string;
    parts: EndpointPathPart[];
    examples: ExampleEndpointCall[];
}): EndpointDefinition {
    return {
        method: opts.method,
        path: { pathParameters: [], parts: opts.parts },
        examples: opts.examples
    } as unknown as EndpointDefinition;
}

function makeApiDefinition(opts: {
    rootEndpoints?: EndpointDefinition[];
    subpackages?: Record<string, { name: string; endpoints: EndpointDefinition[] }>;
}): ApiDefinition {
    return {
        rootPackage: { endpoints: opts.rootEndpoints ?? [], webhooks: [], websockets: [], types: [], subpackages: [] },
        subpackages: opts.subpackages ?? {}
    } as unknown as ApiDefinition;
}

const MESSAGES_CATALOG: CliCatalog = {
    version: 1,
    commands: [
        {
            command: ["twilio", "api", "core", "v2010", "accounts", "messages", "create"],
            namespace: "core",
            httpMethod: "POST",
            path: "/2010-04-01/Accounts/{AccountSid}/Messages.json",
            inputs: [
                { wireName: "AccountSid", location: "path", flag: "--account-sid" },
                { wireName: "To", location: "body", flag: "--to" }
            ]
        }
    ]
};

describe("reconstructOpenApiPath", () => {
    it("rebuilds the {Sid}-style path string from literal + path-parameter parts", () => {
        const path = reconstructOpenApiPath({
            pathParameters: [],
            parts: [
                part("/2010-04-01/Accounts/", "literal"),
                part("AccountSid", "pathParameter"),
                part("/Messages.json", "literal")
            ]
        } as EndpointDefinition["path"]);
        expect(path).toBe("/2010-04-01/Accounts/{AccountSid}/Messages.json");
    });
});

describe("injectCliSnippetsIntoApiDefinition", () => {
    it("injects a cli code sample on matching endpoint examples and reports coverage", () => {
        const example = makeExample({
            pathParameters: { AccountSid: "AC123" },
            requestBodyV3: { type: "json", value: { To: "+15551234567" } }
        });
        const api = makeApiDefinition({
            rootEndpoints: [
                makeEndpoint({
                    method: "POST",
                    parts: [
                        part("/2010-04-01/Accounts/", "literal"),
                        part("AccountSid", "pathParameter"),
                        part("/Messages.json", "literal")
                    ],
                    examples: [example]
                })
            ]
        });

        const stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog: MESSAGES_CATALOG });

        expect(stats).toEqual({ totalEndpoints: 1, matchedEndpoints: 1, injectedSamples: 1 });
        const cli = (example.codeSamples ?? []).find((s) => s.language === CLI_SNIPPET_LANGUAGE);
        expect(cli?.code).toBe("twilio api core v2010 accounts messages create --account-sid AC123 --to +15551234567");
    });

    it("counts but does not inject on endpoints with no catalog match", () => {
        const example = makeExample();
        const api = makeApiDefinition({
            rootEndpoints: [makeEndpoint({ method: "GET", parts: [part("/unknown", "literal")], examples: [example] })]
        });
        const stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog: MESSAGES_CATALOG });
        expect(stats).toEqual({ totalEndpoints: 1, matchedEndpoints: 0, injectedSamples: 0 });
        expect(example.codeSamples ?? []).toHaveLength(0);
    });

    it("is idempotent — does not add a second cli sample", () => {
        const example = makeExample({
            pathParameters: { AccountSid: "AC123" },
            requestBodyV3: { type: "json", value: { To: "+1" } },
            codeSamples: [{ language: CLI_SNIPPET_LANGUAGE, code: "pre-existing" }]
        });
        const api = makeApiDefinition({
            rootEndpoints: [
                makeEndpoint({
                    method: "POST",
                    parts: [
                        part("/2010-04-01/Accounts/", "literal"),
                        part("AccountSid", "pathParameter"),
                        part("/Messages.json", "literal")
                    ],
                    examples: [example]
                })
            ]
        });
        const stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog: MESSAGES_CATALOG });
        expect(stats.injectedSamples).toBe(0);
        expect(example.codeSamples).toHaveLength(1);
        expect(example.codeSamples?.[0]?.code).toBe("pre-existing");
    });

    it("traverses subpackage endpoints too", () => {
        const example = makeExample({
            pathParameters: { AccountSid: "AC123" },
            requestBodyV3: { type: "json", value: { To: "+1" } }
        });
        const api = makeApiDefinition({
            subpackages: {
                subpackage_messages: {
                    name: "messages",
                    endpoints: [
                        makeEndpoint({
                            method: "POST",
                            parts: [
                                part("/2010-04-01/Accounts/", "literal"),
                                part("AccountSid", "pathParameter"),
                                part("/Messages.json", "literal")
                            ],
                            examples: [example]
                        })
                    ]
                }
            }
        });
        const stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog: MESSAGES_CATALOG });
        expect(stats.matchedEndpoints).toBe(1);
        expect(example.codeSamples?.some((s) => s.language === CLI_SNIPPET_LANGUAGE)).toBe(true);
    });

    it("refuses to guess when method+path collide across namespaces and no namespace map disambiguates", () => {
        const collidingCatalog: CliCatalog = {
            version: 1,
            commands: [
                {
                    command: ["twilio", "core", "token"],
                    namespace: "core",
                    httpMethod: "POST",
                    path: "/v1/token",
                    inputs: []
                },
                {
                    command: ["twilio", "iam", "token"],
                    namespace: "iam",
                    httpMethod: "POST",
                    path: "/v1/token",
                    inputs: []
                }
            ]
        };
        const example = makeExample();
        const api = makeApiDefinition({
            rootEndpoints: [
                makeEndpoint({ method: "POST", parts: [part("/v1/token", "literal")], examples: [example] })
            ]
        });
        const stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog: collidingCatalog });
        expect(stats.matchedEndpoints).toBe(0);
        expect(example.codeSamples ?? []).toHaveLength(0);
    });

    it("disambiguates colliding keys via the namespace map", () => {
        const collidingCatalog: CliCatalog = {
            version: 1,
            commands: [
                {
                    command: ["twilio", "core", "token"],
                    namespace: "core",
                    httpMethod: "POST",
                    path: "/v1/token",
                    inputs: []
                },
                {
                    command: ["twilio", "iam", "token"],
                    namespace: "iam",
                    httpMethod: "POST",
                    path: "/v1/token",
                    inputs: []
                }
            ]
        };
        const example = makeExample();
        const api = makeApiDefinition({
            subpackages: {
                sub_oauth: {
                    name: "oauth",
                    endpoints: [
                        makeEndpoint({ method: "POST", parts: [part("/v1/token", "literal")], examples: [example] })
                    ]
                }
            }
        });
        const stats = injectCliSnippetsIntoApiDefinition({
            apiDefinition: api,
            catalog: collidingCatalog,
            namespaces: { oauth: "core" }
        });
        expect(stats.matchedEndpoints).toBe(1);
        expect(example.codeSamples?.[0]?.code).toBe("twilio core token");
    });

    it("resolves the namespace via the top-level subpackage for nested (namespaced) APIs", () => {
        // The endpoint lives in a nested leaf subpackage ("messages"), but the `namespaces` config is
        // keyed on the top-level subpackage name ("v2010"). A colliding sibling command forces the
        // join to actually use the namespace, so this fails unless we walk up to the top-level name.
        const example = makeExample({
            pathParameters: { AccountSid: "AC123" },
            requestBodyV3: { type: "json", value: { To: "+1" } }
        });
        const endpoint = makeEndpoint({
            method: "POST",
            parts: [
                part("/2010-04-01/Accounts/", "literal"),
                part("AccountSid", "pathParameter"),
                part("/Messages.json", "literal")
            ],
            examples: [example]
        });
        const api = {
            rootPackage: { endpoints: [], webhooks: [], websockets: [], types: [], subpackages: ["sub_v2010"] },
            subpackages: {
                sub_v2010: { name: "v2010", endpoints: [], subpackages: ["sub_messages"] },
                sub_messages: { name: "messages", endpoints: [endpoint], subpackages: [] }
            }
        } as unknown as ApiDefinition;
        const catalog: CliCatalog = {
            version: 1,
            commands: [
                {
                    command: ["twilio", "core", "messages", "create"],
                    namespace: "core",
                    httpMethod: "POST",
                    path: "/2010-04-01/Accounts/{AccountSid}/Messages.json",
                    inputs: [
                        { wireName: "AccountSid", location: "path", flag: "--account-sid" },
                        { wireName: "To", location: "body", flag: "--to" }
                    ]
                },
                {
                    command: ["twilio", "other", "messages", "create"],
                    namespace: "other",
                    httpMethod: "POST",
                    path: "/2010-04-01/Accounts/{AccountSid}/Messages.json",
                    inputs: []
                }
            ]
        };
        const stats = injectCliSnippetsIntoApiDefinition({
            apiDefinition: api,
            catalog,
            namespaces: { v2010: "core" }
        });
        expect(stats.matchedEndpoints).toBe(1);
        expect(example.codeSamples?.[0]?.code).toBe("twilio core messages create --account-sid AC123 --to +1");
    });
});
