import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../../../AbstractConverterContext.js";
import { ErrorCollector } from "../../../ErrorCollector.js";
import { ServersConverter } from "../ServersConverter.js";

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

function createContext(): TestConverterContext {
    return new TestConverterContext({
        spec: {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {}
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

function convertServerUrls(servers: OpenAPIV3_1.ServerObject[]): string[] {
    const output = new ServersConverter({ breadcrumbs: [], context: createContext(), servers }).convert();
    const environments = output?.value.environments;
    if (environments?.type !== "singleBaseUrl") {
        throw new Error("Expected single base url environments");
    }
    return environments.environments.map((environment) => environment.url);
}

describe("ServersConverter", () => {
    it("substitutes a server variable that holds the whole base url", () => {
        expect(
            convertServerUrls([
                {
                    url: "{baseUrl}",
                    description: "Production",
                    variables: { baseUrl: { default: "https://api.example.com" } }
                }
            ])
        ).toEqual(["https://api.example.com"]);
    });

    it("keeps slashes in a server variable default", () => {
        expect(
            convertServerUrls([
                {
                    url: "https://api.example.com/{basePath}",
                    description: "Production",
                    variables: { basePath: { default: "api/v1" } }
                }
            ])
        ).toEqual(["https://api.example.com/api/v1"]);
    });

    it("substitutes every occurrence of a server variable", () => {
        expect(
            convertServerUrls([
                {
                    url: "https://{region}.api.example.com/{region}",
                    description: "Production",
                    variables: { region: { default: "us-east-1" } }
                }
            ])
        ).toEqual(["https://us-east-1.api.example.com/us-east-1"]);
    });

    it("escapes query and fragment delimiters in a path segment default", () => {
        expect(
            convertServerUrls([
                {
                    url: "https://api.example.com/{tenant}/v1",
                    description: "Production",
                    variables: { tenant: { default: "foo?bar#baz" } }
                }
            ])
        ).toEqual(["https://api.example.com/foo%3Fbar%23baz/v1"]);
    });

    it("does not read dollar sequences in a default as replacement patterns", () => {
        expect(
            convertServerUrls([
                {
                    url: "https://api.example.com/{tenant}",
                    description: "Production",
                    variables: { tenant: { default: "a$&b$$c" } }
                }
            ])
        ).toEqual(["https://api.example.com/a$&b$$c"]);
    });
});
