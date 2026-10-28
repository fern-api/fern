import { Logger } from "@fern-api/logger";
import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";

import {
    applyTwilioVisibility,
    getSkippedVisibility,
    getTwilioVisibility,
    resolveTwilioVisibility,
    shouldSkipForVisibility,
    TwilioVisibilityKey
} from "../openapi/v3/extensions/twilioVisibility.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS, VisibilityFilter } from "../options.js";
import { parse } from "../parse.js";

function createLogger(): Logger {
    return {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        trace: vi.fn(),
        log: vi.fn(),
        disable: vi.fn(),
        enable: vi.fn()
    } as unknown as Logger;
}

function twilio(libraryVisibility: unknown, docsVisibility: unknown = "public"): Record<string, unknown> {
    return { "x-twilio": { libraryVisibility, docsVisibility } };
}

const ALL = { libraryVisibility: "all", docsVisibility: "all" } as const;

describe("getTwilioVisibility", () => {
    it.each<TwilioVisibilityKey>(["libraryVisibility", "docsVisibility"])("reads x-twilio.%s", (key) => {
        const logger = createLogger();
        const object = { "x-twilio": { [key]: "private" } };
        expect(getTwilioVisibility({ object, key, logger, breadcrumbs: ["a"] })).toBe("private");
        expect(getTwilioVisibility({ object: twilio("hidden", "hidden"), key, logger, breadcrumbs: ["a"] })).toBe(
            "hidden"
        );
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("reads the two keys independently", () => {
        const logger = createLogger();
        const object = twilio("private", "hidden");
        expect(getTwilioVisibility({ object, key: "libraryVisibility", logger, breadcrumbs: [] })).toBe("private");
        expect(getTwilioVisibility({ object, key: "docsVisibility", logger, breadcrumbs: [] })).toBe("hidden");
    });

    it("returns undefined when the extension is absent", () => {
        const logger = createLogger();
        const key = "libraryVisibility";
        expect(getTwilioVisibility({ object: {}, key, logger, breadcrumbs: ["a"] })).toBeUndefined();
        expect(getTwilioVisibility({ object: { "x-twilio": {} }, key, logger, breadcrumbs: ["a"] })).toBeUndefined();
        expect(getTwilioVisibility({ object: undefined, key, logger, breadcrumbs: ["a"] })).toBeUndefined();
        expect(
            getTwilioVisibility({ object: { "x-twilio": "private" }, key, logger, breadcrumbs: ["a"] })
        ).toBeUndefined();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("warns and returns undefined for unknown values", () => {
        const logger = createLogger();
        const key = "libraryVisibility";
        expect(
            getTwilioVisibility({ object: twilio("internal"), key, logger, breadcrumbs: ["GET /x"] })
        ).toBeUndefined();
        expect(getTwilioVisibility({ object: twilio(true), key, logger, breadcrumbs: ["GET /x"] })).toBeUndefined();
        expect(logger.warn).toHaveBeenCalledTimes(2);
    });
});

describe("resolveTwilioVisibility", () => {
    const logger = createLogger();
    const key = "libraryVisibility";

    it("uses the most specific value first", () => {
        expect(
            resolveTwilioVisibility({
                objects: [twilio("public"), twilio("private"), twilio("hidden")],
                key,
                logger,
                breadcrumbs: []
            })
        ).toBe("public");
    });

    it("falls back to the path item, then info", () => {
        expect(
            resolveTwilioVisibility({
                objects: [{}, twilio("hidden"), twilio("private")],
                key,
                logger,
                breadcrumbs: []
            })
        ).toBe("hidden");
        expect(resolveTwilioVisibility({ objects: [{}, {}, twilio("private")], key, logger, breadcrumbs: [] })).toBe(
            "private"
        );
        expect(
            resolveTwilioVisibility({ objects: [{}, undefined, twilio("private")], key, logger, breadcrumbs: [] })
        ).toBe("private");
    });

    it("defaults to public", () => {
        expect(resolveTwilioVisibility({ objects: [{}, undefined, {}], key, logger, breadcrumbs: [] })).toBe("public");
        expect(resolveTwilioVisibility({ objects: [], key, logger, breadcrumbs: [] })).toBe("public");
    });
});

describe("shouldSkipForVisibility", () => {
    it.each<[VisibilityFilter, boolean, boolean, boolean]>([
        // filter, skip public?, skip private?, skip hidden?
        ["all", false, false, false],
        ["public", false, true, true],
        ["private", false, false, true]
    ])("filter=%s", (filter, skipPublic, skipPrivate, skipHidden) => {
        expect(shouldSkipForVisibility({ visibility: "public", filter })).toBe(skipPublic);
        expect(shouldSkipForVisibility({ visibility: "private", filter })).toBe(skipPrivate);
        expect(shouldSkipForVisibility({ visibility: "hidden", filter })).toBe(skipHidden);
    });
});

describe("getSkippedVisibility", () => {
    const logger = createLogger();

    it("returns the offending key and visibility, or undefined", () => {
        expect(
            getSkippedVisibility({
                objects: [twilio("private")],
                logger,
                options: { ...ALL, libraryVisibility: "public" },
                breadcrumbs: []
            })
        ).toEqual({ key: "libraryVisibility", visibility: "private" });
        expect(
            getSkippedVisibility({
                objects: [twilio("private")],
                logger,
                options: { ...ALL, libraryVisibility: "private" },
                breadcrumbs: []
            })
        ).toBeUndefined();
        expect(
            getSkippedVisibility({ objects: [twilio("hidden", "hidden")], logger, options: ALL, breadcrumbs: [] })
        ).toBeUndefined();
    });

    it("filters libraryVisibility and docsVisibility independently", () => {
        const sdkOnly = twilio("public", "hidden");
        expect(
            getSkippedVisibility({
                objects: [sdkOnly],
                logger,
                options: { ...ALL, libraryVisibility: "public" },
                breadcrumbs: []
            })
        ).toBeUndefined();
        expect(
            getSkippedVisibility({
                objects: [sdkOnly],
                logger,
                options: { ...ALL, docsVisibility: "private" },
                breadcrumbs: []
            })
        ).toEqual({ key: "docsVisibility", visibility: "hidden" });
    });
});

const document: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: { title: "Visibility API", version: "1.0.0", ...twilio("private", "private") },
    paths: {
        "/public": {
            get: {
                operationId: "getPublic",
                ...twilio("public", "public"),
                responses: { "200": { description: "ok" } }
            }
        },
        "/untagged": {
            get: {
                operationId: "getUntagged",
                responses: { "200": { description: "ok" } }
            }
        },
        "/hidden": {
            get: {
                operationId: "getHidden",
                ...twilio("hidden", "hidden"),
                responses: { "200": { description: "ok" } }
            }
        },
        "/docs-only": {
            get: {
                operationId: "getDocsOnly",
                ...twilio("hidden", "public"),
                responses: { "200": { description: "ok" } }
            }
        },
        "/keyed/{id}": {
            get: {
                operationId: "getKeyed",
                ...twilio("public", "public"),
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        ...twilio("hidden", "hidden")
                    }
                ],
                responses: { "200": { description: "ok" } }
            }
        },
        "/path-private": {
            ...twilio("private", "private"),
            get: {
                operationId: "getPathPrivate",
                responses: { "200": { description: "ok" } }
            },
            post: {
                operationId: "postPathPrivateOverriddenPublic",
                ...twilio("public", "public"),
                parameters: [
                    { name: "shown", in: "query", schema: { type: "string" } },
                    { name: "secret", in: "query", schema: { type: "string" }, ...twilio("private", "private") },
                    { name: "gone", in: "query", schema: { type: "string" }, ...twilio("hidden", "hidden") },
                    { $ref: "#/components/parameters/RefSecret" }
                ],
                responses: { "200": { description: "ok" } }
            }
        }
    },
    components: {
        parameters: {
            RefSecret: { name: "ref_secret", in: "query", schema: { type: "string" }, ...twilio("private", "private") }
        },
        schemas: {
            Account: {
                type: "object",
                ...twilio("public", "public"),
                required: ["sid", "internal_flags"],
                properties: {
                    sid: { type: "string" },
                    internal_flags: { type: "string", ...twilio("private", "private") },
                    debug: { type: "string", ...twilio("hidden", "hidden") }
                }
            },
            PrivateThing: {
                type: "object",
                ...twilio("private", "private"),
                properties: { id: { type: "string" } }
            },
            HiddenThing: {
                type: "object",
                ...twilio("hidden", "hidden"),
                properties: { id: { type: "string" } }
            },
            UntaggedThing: {
                type: "object",
                properties: { id: { type: "string" } }
            }
        }
    }
};

describe("applyTwilioVisibility", () => {
    it("returns the same document when no filter is enabled", () => {
        const logger = createLogger();
        expect(applyTwilioVisibility({ document, options: ALL, logger })).toBe(document);
    });

    it("does not mutate the input and drops emptied path items", () => {
        const logger = createLogger();
        const before = structuredClone(document);
        const pruned = applyTwilioVisibility({ document, options: { ...ALL, libraryVisibility: "public" }, logger });
        expect(document).toEqual(before);
        expect(pruned).not.toBe(document);
        expect(Object.keys(pruned.paths).sort()).toEqual(["/keyed/{id}", "/path-private", "/public"]);
        expect(Object.keys(pruned.paths["/path-private"] ?? {}).sort()).toEqual(["post", "x-twilio"]);
    });

    it("removes dropped properties from required", () => {
        const logger = createLogger();
        const pruned = applyTwilioVisibility({ document, options: { ...ALL, libraryVisibility: "public" }, logger });
        const account = pruned.components?.schemas?.Account;
        expect(account != null && !("$ref" in account) ? account.required : undefined).toEqual(["sid"]);
    });

    it("does not treat example data as schemas", () => {
        const logger = createLogger();
        const withExample: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Examples", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Thing: {
                        type: "object",
                        properties: { data: { type: "object" } },
                        example: { properties: { secret: { ...twilio("hidden", "hidden") } } }
                    }
                }
            }
        };
        const pruned = applyTwilioVisibility({
            document: withExample,
            options: { libraryVisibility: "public", docsVisibility: "public" },
            logger
        });
        expect(pruned).toEqual(withExample);
    });

    it("filters by docsVisibility with the same rules", () => {
        const logger = createLogger();
        const pruned = applyTwilioVisibility({ document, options: { ...ALL, docsVisibility: "private" }, logger });
        expect(Object.keys(pruned.paths).sort()).toEqual([
            "/docs-only",
            "/keyed/{id}",
            "/path-private",
            "/public",
            "/untagged"
        ]);
        expect(Object.keys(pruned.components?.schemas ?? {}).sort()).toEqual([
            "Account",
            "PrivateThing",
            "UntaggedThing"
        ]);
    });

    it("prunes webhooks like paths", () => {
        const logger = createLogger();
        const withWebhooks = {
            ...structuredClone(document),
            webhooks: {
                publicHook: { post: { operationId: "publicHook", ...twilio("public"), responses: {} } },
                inheritedPrivateHook: { post: { operationId: "inheritedPrivateHook", responses: {} } }
            }
        };
        const pruned = applyTwilioVisibility({
            document: withWebhooks,
            options: { ...ALL, libraryVisibility: "public" },
            logger
        });
        expect(Object.keys(pruned.webhooks)).toEqual(["publicHook"]);
    });
});

describe("parse honors x-twilio visibility", () => {
    const mockTaskContext = {
        logger: createLogger()
    } as unknown as TaskContext;

    function parseWith(options: { libraryVisibility?: VisibilityFilter; docsVisibility?: VisibilityFilter }) {
        const ir = parse({
            context: mockTaskContext,
            documents: [
                {
                    type: "openapi",
                    value: structuredClone(document),
                    source: Source.openapi({ file: "test.yml" }),
                    settings: { ...DEFAULT_PARSE_OPENAPI_SETTINGS, onlyIncludeReferencedSchemas: false }
                }
            ],
            options
        });
        const endpoints = ir.endpoints.map((endpoint) => endpoint.path).sort();
        const queryParams = ir.endpoints
            .find((endpoint) => endpoint.path === "/path-private" && endpoint.method === "POST")
            ?.queryParameters.map((param) => param.name)
            .sort();
        const keyedPathParams = ir.endpoints
            .find((endpoint) => endpoint.path === "/keyed/{id}")
            ?.pathParameters.map((param) => `${param.name}:${param.schema.type}`);
        const schemas = Object.keys(ir.groupedSchemas.rootSchemas).sort();
        const account = ir.groupedSchemas.rootSchemas.Account;
        const accountProperties =
            account?.type === "object" ? account.properties.map((property) => property.key).sort() : undefined;
        return { endpoints, queryParams, keyedPathParams, schemas, accountProperties };
    }

    it("public (fern generate): keeps only public elements; untagged inherit info-level private", () => {
        const result = parseWith({ libraryVisibility: "public" });
        expect(result.endpoints).toEqual(["/keyed/{id}", "/path-private", "/public"]);
        expect(result.queryParams).toEqual(["shown"]);
        expect(result.keyedPathParams).toEqual(["id:primitive"]);
        expect(result.schemas).toEqual(["Account", "UntaggedThing"]);
        expect(result.accountProperties).toEqual(["sid"]);
    });

    it("private (fern generate --private): keeps public + private, drops hidden", () => {
        const result = parseWith({ libraryVisibility: "private" });
        expect(result.endpoints).toEqual(["/keyed/{id}", "/path-private", "/path-private", "/public", "/untagged"]);
        expect(result.keyedPathParams).toEqual(["id:primitive"]);
        expect(result.queryParams).toEqual(["ref_secret", "secret", "shown"]);
        expect(result.schemas).toEqual(["Account", "PrivateThing", "UntaggedThing"]);
        expect(result.accountProperties).toEqual(["internal_flags", "sid"]);
    });

    it("docsVisibility public (fern generate --docs): ignores libraryVisibility", () => {
        const result = parseWith({ docsVisibility: "public" });
        expect(result.endpoints).toEqual(["/docs-only", "/keyed/{id}", "/path-private", "/public"]);
        expect(result.queryParams).toEqual(["shown"]);
        expect(result.schemas).toEqual(["Account", "UntaggedThing"]);
        expect(result.accountProperties).toEqual(["sid"]);
    });

    it("all: no filtering", () => {
        const result = parseWith({ libraryVisibility: "all", docsVisibility: "all" });
        expect(result.endpoints).toEqual([
            "/docs-only",
            "/hidden",
            "/keyed/{id}",
            "/path-private",
            "/path-private",
            "/public",
            "/untagged"
        ]);
        expect(result.keyedPathParams).toEqual(["id:primitive"]);
        expect(result.queryParams).toEqual(["gone", "ref_secret", "secret", "shown"]);
        expect(result.schemas).toEqual(["Account", "HiddenThing", "PrivateThing", "UntaggedThing"]);
        expect(result.accountProperties).toEqual(["debug", "internal_flags", "sid"]);
    });

    it("warns when an included element references a schema excluded by visibility", () => {
        const logger = createLogger();
        const dangling: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Dangling", version: "1.0.0" },
            paths: {
                "/public": {
                    get: {
                        operationId: "getPublic",
                        responses: {
                            "200": {
                                description: "ok",
                                content: {
                                    "application/json": { schema: { $ref: "#/components/schemas/PrivateThing" } }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    PrivateThing: { type: "object", ...twilio("private"), properties: { id: { type: "string" } } }
                }
            }
        };
        const ir = parse({
            context: { logger } as unknown as TaskContext,
            documents: [
                {
                    type: "openapi",
                    value: dangling,
                    source: Source.openapi({ file: "test.yml" }),
                    settings: { ...DEFAULT_PARSE_OPENAPI_SETTINGS }
                }
            ],
            options: { libraryVisibility: "public" }
        });
        expect(ir.endpoints).toHaveLength(1);
        expect(Object.keys(ir.groupedSchemas.rootSchemas)).toEqual([]);
        expect(logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Schema PrivateThing has libraryVisibility "private" and was excluded')
        );
    });
});
