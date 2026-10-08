import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { OpenAPIV3_1 } from "openapi-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
import { AbstractSpecConverter } from "../AbstractSpecConverter.js";
import { ErrorCollector } from "../ErrorCollector.js";

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

class TestConverterContext extends AbstractConverterContext<OpenAPIV3_1.Document> {
    convertReferenceToTypeReference(): { ok: false } {
        return { ok: false };
    }
}

class TestSpecConverter extends AbstractSpecConverter<TestConverterContext, unknown> {
    public async convert(): Promise<unknown> {
        return this.resolveAllExternalRefs({ spec: this.context.spec });
    }
}

function createContext(spec: object = {}): TestConverterContext {
    return new TestConverterContext({
        spec: { openapi: "3.1.0", info: { title: "Test API", version: "1.0.0" }, paths: {}, ...spec },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        logger: mockLogger as any,
        generationLanguage: undefined,
        smartCasing: false,
        exampleGenerationArgs: { disabled: false },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        errorCollector: new ErrorCollector({ logger: mockLogger as any }),
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: getOpenAPISettings()
    });
}

const COMMON_URL = "https://schemas.acme.com/common.json";
const COMMON = {
    definitions: {
        Money: { type: "object", properties: { currency: { $ref: "#/definitions/Currency" } } },
        Address: { type: "object", properties: { city: { type: "string" } } },
        Currency: { type: "string" }
    }
};

function stubFetch(...responses: Array<() => Response>): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn(async () => {
        const next = responses.length > 1 ? responses.shift() : responses[0];
        if (next == null) {
            throw new Error("Unexpected fetch");
        }
        return next();
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

function commonResponse(): Response {
    return new Response(JSON.stringify(COMMON));
}

describe("external references", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("resolves external refs nested anywhere in the spec", async () => {
        stubFetch(commonResponse);
        const context = createContext({
            components: {
                schemas: {
                    Order: {
                        type: "object",
                        properties: {
                            total: { $ref: `${COMMON_URL}#/definitions/Money` },
                            stops: { type: "array", items: [{ $ref: `${COMMON_URL}#/definitions/Address` }] }
                        }
                    }
                }
            }
        });

        await new TestSpecConverter({ context, audiences: { type: "all" } }).convert();

        expect(context.spec.components?.schemas?.Order).toEqual({
            type: "object",
            properties: {
                total: { type: "object", properties: { currency: { type: "string" } } },
                stops: { type: "array", items: [{ type: "object", properties: { city: { type: "string" } } }] }
            }
        });
    });

    it("fetches a document once for refs to different fragments of it", async () => {
        const fetchMock = stubFetch(commonResponse);
        const context = createContext();

        const money = await context.resolveMaybeExternalReference({ $ref: `${COMMON_URL}#/definitions/Money` });
        const address = await context.resolveMaybeExternalReference({ $ref: `${COMMON_URL}#/definitions/Address` });

        expect(fetchMock).toHaveBeenCalledOnce();
        expect(money).toEqual({
            resolved: true,
            value: { type: "object", properties: { currency: { type: "string" } } }
        });
        expect(address).toEqual({ resolved: true, value: COMMON.definitions.Address });
    });

    it("gives each ref its own copy of the document", async () => {
        stubFetch(commonResponse);
        const context = createContext();

        const first = await context.resolveMaybeExternalReference<Record<string, unknown>>({ $ref: COMMON_URL });
        if (first.resolved) {
            first.value.definitions = {};
        }
        const second = await context.resolveMaybeExternalReference({ $ref: COMMON_URL });

        expect(second).toEqual({ resolved: true, value: COMMON });
    });

    it("fetches the document again after a failed response", async () => {
        const fetchMock = stubFetch(() => new Response("unavailable", { status: 503 }), commonResponse);
        const context = createContext();

        const failed = await context.resolveMaybeExternalReference({ $ref: `${COMMON_URL}#/definitions/Address` });
        const retried = await context.resolveMaybeExternalReference({ $ref: `${COMMON_URL}#/definitions/Address` });

        expect(failed).toEqual({ resolved: false });
        expect(retried).toEqual({ resolved: true, value: COMMON.definitions.Address });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("fetches the document again after a network error", async () => {
        const fetchMock = stubFetch(() => {
            throw new TypeError("fetch failed");
        }, commonResponse);
        const context = createContext();

        await expect(
            context.resolveMaybeExternalReference({ $ref: `${COMMON_URL}#/definitions/Address` })
        ).rejects.toThrow("fetch failed");
        const retried = await context.resolveMaybeExternalReference({ $ref: `${COMMON_URL}#/definitions/Address` });

        expect(retried).toEqual({ resolved: true, value: COMMON.definitions.Address });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
