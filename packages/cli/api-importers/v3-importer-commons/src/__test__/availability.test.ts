import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { AvailabilityStatus } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
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

function createContext(spec: Partial<OpenAPIV3_1.Document> = {}): TestConverterContext {
    return new TestConverterContext({
        spec: {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            ...spec
        },
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        logger: mockLogger as any,
        generationLanguage: undefined,
        smartCasing: false,
        exampleGenerationArgs: { disabled: false },
        errorCollector: new ErrorCollector({
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            logger: mockLogger as any
        }),
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: getOpenAPISettings()
    });
}

describe("getAvailability", () => {
    it.each([
        ["generally-available", AvailabilityStatus.GeneralAvailability],
        ["ga", AvailabilityStatus.GeneralAvailability],
        ["beta", AvailabilityStatus.Beta],
        ["deprecated", AvailabilityStatus.Deprecated]
    ])("reads x-fern-availability: %s on an operation", (value, expected) => {
        const operation = { "x-fern-availability": value, responses: {} } as OpenAPIV3_1.OperationObject;
        expect(createContext().getAvailability({ node: operation, breadcrumbs: [] })?.status).toBe(expected);
    });

    it("lets generally-available on a $ref override a deprecated schema", () => {
        const context = createContext({
            components: { schemas: { OldPet: { type: "object", deprecated: true } } }
        });
        const reference = {
            $ref: "#/components/schemas/OldPet",
            "x-fern-availability": "generally-available"
        } as OpenAPIV3_1.ReferenceObject;
        expect(context.getAvailability({ node: reference, breadcrumbs: [] })?.status).toBe(
            AvailabilityStatus.GeneralAvailability
        );
    });
});
