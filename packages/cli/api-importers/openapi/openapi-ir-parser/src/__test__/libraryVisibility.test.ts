import { Logger } from "@fern-api/logger";
import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";

import {
    getLibraryVisibility,
    getSkippedLibraryVisibility,
    resolveLibraryVisibility,
    shouldSkipForLibraryVisibility
} from "../openapi/v3/extensions/getLibraryVisibility.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS, LibraryVisibilityFilter } from "../options.js";
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

function twilio(libraryVisibility: unknown): Record<string, unknown> {
    return { "x-twilio": { libraryVisibility, docsVisibility: "public" } };
}

describe("getLibraryVisibility", () => {
    it("reads x-twilio.libraryVisibility", () => {
        const logger = createLogger();
        expect(getLibraryVisibility({ object: twilio("private"), logger, breadcrumbs: ["a"] })).toBe("private");
        expect(getLibraryVisibility({ object: twilio("hidden"), logger, breadcrumbs: ["a"] })).toBe("hidden");
        expect(getLibraryVisibility({ object: twilio("public"), logger, breadcrumbs: ["a"] })).toBe("public");
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("returns undefined when the extension is absent", () => {
        const logger = createLogger();
        expect(getLibraryVisibility({ object: {}, logger, breadcrumbs: ["a"] })).toBeUndefined();
        expect(getLibraryVisibility({ object: { "x-twilio": {} }, logger, breadcrumbs: ["a"] })).toBeUndefined();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("warns and returns undefined for unknown values", () => {
        const logger = createLogger();
        expect(getLibraryVisibility({ object: twilio("internal"), logger, breadcrumbs: ["GET /x"] })).toBeUndefined();
        expect(getLibraryVisibility({ object: twilio(true), logger, breadcrumbs: ["GET /x"] })).toBeUndefined();
        expect(logger.warn).toHaveBeenCalledTimes(2);
    });
});

describe("resolveLibraryVisibility", () => {
    const logger = createLogger();

    it("uses the most specific value first", () => {
        expect(
            resolveLibraryVisibility({
                objects: [twilio("public"), twilio("private"), twilio("hidden")],
                logger,
                breadcrumbs: []
            })
        ).toBe("public");
    });

    it("falls back to the path item, then info", () => {
        expect(
            resolveLibraryVisibility({ objects: [{}, twilio("hidden"), twilio("private")], logger, breadcrumbs: [] })
        ).toBe("hidden");
        expect(resolveLibraryVisibility({ objects: [{}, {}, twilio("private")], logger, breadcrumbs: [] })).toBe(
            "private"
        );
        expect(resolveLibraryVisibility({ objects: [{}, undefined, twilio("private")], logger, breadcrumbs: [] })).toBe(
            "private"
        );
    });

    it("defaults to public", () => {
        expect(resolveLibraryVisibility({ objects: [{}, undefined, {}], logger, breadcrumbs: [] })).toBe("public");
        expect(resolveLibraryVisibility({ objects: [], logger, breadcrumbs: [] })).toBe("public");
    });
});

describe("shouldSkipForLibraryVisibility", () => {
    it.each<[LibraryVisibilityFilter, boolean, boolean, boolean]>([
        // filter, skip public?, skip private?, skip hidden?
        ["all", false, false, false],
        ["public", false, true, true],
        ["private", false, false, true]
    ])("filter=%s", (filter, skipPublic, skipPrivate, skipHidden) => {
        const options = { libraryVisibility: filter };
        expect(shouldSkipForLibraryVisibility({ visibility: "public", options })).toBe(skipPublic);
        expect(shouldSkipForLibraryVisibility({ visibility: "private", options })).toBe(skipPrivate);
        expect(shouldSkipForLibraryVisibility({ visibility: "hidden", options })).toBe(skipHidden);
    });

    it("getSkippedLibraryVisibility returns the offending visibility or undefined", () => {
        const logger = createLogger();
        expect(
            getSkippedLibraryVisibility({
                objects: [twilio("private")],
                logger,
                options: { libraryVisibility: "public" },
                breadcrumbs: []
            })
        ).toBe("private");
        expect(
            getSkippedLibraryVisibility({
                objects: [twilio("private")],
                logger,
                options: { libraryVisibility: "private" },
                breadcrumbs: []
            })
        ).toBeUndefined();
        expect(
            getSkippedLibraryVisibility({
                objects: [twilio("hidden")],
                logger,
                options: { libraryVisibility: "all" },
                breadcrumbs: []
            })
        ).toBeUndefined();
    });
});

describe("parse honors x-twilio.libraryVisibility", () => {
    const mockTaskContext = {
        logger: createLogger()
    } as unknown as TaskContext;

    const document: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Visibility API", version: "1.0.0", ...twilio("private") },
        paths: {
            "/public": {
                get: {
                    operationId: "getPublic",
                    ...twilio("public"),
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
                    ...twilio("hidden"),
                    responses: { "200": { description: "ok" } }
                }
            },
            "/keyed/{id}": {
                get: {
                    operationId: "getKeyed",
                    ...twilio("public"),
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "integer" },
                            ...twilio("hidden")
                        }
                    ],
                    responses: { "200": { description: "ok" } }
                }
            },
            "/path-private": {
                ...twilio("private"),
                get: {
                    operationId: "getPathPrivate",
                    responses: { "200": { description: "ok" } }
                },
                post: {
                    operationId: "postPathPrivateOverriddenPublic",
                    ...twilio("public"),
                    parameters: [
                        { name: "shown", in: "query", schema: { type: "string" } },
                        { name: "secret", in: "query", schema: { type: "string" }, ...twilio("private") },
                        { name: "gone", in: "query", schema: { type: "string" }, ...twilio("hidden") }
                    ],
                    responses: { "200": { description: "ok" } }
                }
            }
        },
        components: {
            schemas: {
                Account: {
                    type: "object",
                    ...twilio("public"),
                    properties: {
                        sid: { type: "string" },
                        internal_flags: { type: "string", ...twilio("private") },
                        debug: { type: "string", ...twilio("hidden") }
                    }
                },
                PrivateThing: {
                    type: "object",
                    ...twilio("private"),
                    properties: { id: { type: "string" } }
                },
                HiddenThing: {
                    type: "object",
                    ...twilio("hidden"),
                    properties: { id: { type: "string" } }
                },
                UntaggedThing: {
                    type: "object",
                    properties: { id: { type: "string" } }
                }
            }
        }
    };

    function parseWith(libraryVisibility: LibraryVisibilityFilter) {
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
            options: { libraryVisibility }
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
        const result = parseWith("public");
        expect(result.endpoints).toEqual(["/keyed/{id}", "/path-private", "/public"]);
        expect(result.queryParams).toEqual(["shown"]);
        expect(result.keyedPathParams).toEqual(["id:primitive"]);
        expect(result.schemas).toEqual(["Account", "UntaggedThing"]);
        expect(result.accountProperties).toEqual(["sid"]);
    });

    it("private (fern generate --private): keeps public + private, drops hidden", () => {
        const result = parseWith("private");
        expect(result.endpoints).toEqual(["/keyed/{id}", "/path-private", "/path-private", "/public", "/untagged"]);
        expect(result.keyedPathParams).toEqual(["id:primitive"]);
        expect(result.queryParams).toEqual(["secret", "shown"]);
        expect(result.schemas).toEqual(["Account", "PrivateThing", "UntaggedThing"]);
        expect(result.accountProperties).toEqual(["internal_flags", "sid"]);
    });

    it("all: no filtering", () => {
        const result = parseWith("all");
        expect(result.endpoints).toEqual([
            "/hidden",
            "/keyed/{id}",
            "/path-private",
            "/path-private",
            "/public",
            "/untagged"
        ]);
        expect(result.keyedPathParams).toEqual(["id:primitive"]);
        expect(result.queryParams).toEqual(["gone", "secret", "shown"]);
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
