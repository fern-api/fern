import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    createHttpHeader,
    createMockCoreUtilities,
    createMockGeneratedSdkClientClass,
    createMockRequestParameter,
    createMockTypeContext
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { generateHeaders } from "../endpoints/utils/generateHeaders.js";

function createMockContext() {
    const coreUtilities = createMockCoreUtilities();
    return {
        type: createMockTypeContext(),
        importsManager: {
            addImportFromRoot: () => {
                // no-op for test
            }
        },
        coreUtilities,
        authProvider: {
            isAuthEndpoint: () => false
        },
        versionContext: {
            getGeneratedVersion: () => undefined
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

function statementsToString(statements: ts.Statement[]): string {
    return statements.map((stmt) => getTextOfTsNode(stmt)).join("\n");
}

describe("generateHeaders", () => {
    it("generates headers with no service/endpoint headers and no auth", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        expect(result.length).toBeGreaterThan(0);
        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with service and endpoint headers", () => {
        const serviceHeaders = [
            createHttpHeader("X-API-Version", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "X-API-Version"
            })
        ];

        const endpointHeaders = [
            createHttpHeader("X-Request-Id", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "X-Request-Id"
            })
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: serviceHeaders } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: endpointHeaders, auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with idempotency headers when endpoint is idempotent", () => {
        const idempotencyHeaders = [
            createHttpHeader("Idempotency-Key", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "Idempotency-Key"
            })
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: true } as any,
            idempotencyHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers without idempotency headers when endpoint is not idempotent", () => {
        const idempotencyHeaders = [
            createHttpHeader("Idempotency-Key", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "Idempotency-Key"
            })
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates auth headers when auth provider exists and endpoint requires auth", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass({ hasAuthProvider: true }),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: true, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with literal header value", () => {
        const literalHeader = createHttpHeader(
            "X-Fern-Language",
            FernIr.TypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.string("JavaScript"))),
            { wireValue: "X-Fern-Language" }
        );

        const mockContext = createMockContext();
        // Override resolveTypeReference to return the literal container
        mockContext.type.resolveTypeReference = (typeRef: FernIr.TypeReference) => typeRef;

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [literalHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with root-level overridable headers", () => {
        const rootHeaders = [
            createHttpHeader("X-Custom-Header", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "X-Custom-Header"
            })
        ];

        const mockContext = createMockContext();

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: rootHeaders } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with additional headers parameter", () => {
        const additionalHeaders = [
            {
                header: "X-Extra",
                value: ts.factory.createStringLiteral("extra-value")
            }
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: [],
            additionalHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with additional spread headers", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: [],
            additionalSpreadHeaders: [ts.factory.createIdentifier("spreadHeaders")]
        });

        const text = statementsToString(result);
        expect(text).toContain("spreadHeaders");
        expect(text).toMatchSnapshot();
    });

    it("generates headers with headersToMergeAfterClientOptionsHeaders", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: [],
            headersToMergeAfterClientOptionsHeaders: [ts.factory.createIdentifier("afterHeaders")]
        });

        const text = statementsToString(result);
        expect(text).toContain("afterHeaders");
        expect(text).toMatchSnapshot();
    });

    it("generates nullable header value with ?? undefined coalescing", () => {
        const nullableHeader = createHttpHeader(
            "X-Nullable",
            FernIr.TypeReference.container(
                FernIr.ContainerType.nullable(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ),
            { wireValue: "X-Nullable" }
        );

        const mockContext = createMockContext();

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [nullableHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toContain("?? undefined");
        expect(text).toMatchSnapshot();
    });

    it("generates header with stringify for date type", () => {
        const dateHeader = createHttpHeader(
            "X-Date",
            FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined }),
            { wireValue: "X-Date" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [dateHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // typeNeedsStringify returns true for DATE_TIME, so stringify is called
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates header with stringify for list container type", () => {
        const listHeader = createHttpHeader(
            "X-Tags",
            FernIr.TypeReference.container(
                FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ),
            { wireValue: "X-Tags" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [listHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates header with stringify for unknown type", () => {
        const unknownHeader = createHttpHeader("X-Unknown", FernIr.TypeReference.unknown(), {
            wireValue: "X-Unknown"
        });

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [unknownHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("throws when header is non-literal and requestParameter is undefined", () => {
        const header = createHttpHeader(
            "X-Required",
            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            { wireValue: "X-Required" }
        );

        expect(() =>
            generateHeaders({
                context: createMockContext(),
                // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
                intermediateRepresentation: { headers: [] } as any,
                generatedSdkClientClass: createMockGeneratedSdkClientClass(),
                requestParameter: undefined,
                // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
                service: { headers: [header] } as any,
                // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
                endpoint: { headers: [], auth: false, idempotent: false } as any,
                idempotencyHeaders: []
            })
        ).toThrow("Cannot reference header X-Required because request parameter is not defined.");
    });

    it("generates idempotency header with stringify for date type", () => {
        const dateIdempotencyHeader = createHttpHeader(
            "Idempotency-Timestamp",
            FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined }),
            { wireValue: "Idempotency-Timestamp" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: true } as any,
            idempotencyHeaders: [dateIdempotencyHeader]
        });

        const text = statementsToString(result);
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates nullable idempotency header with ?? undefined coalescing", () => {
        const nullableIdempotencyHeader = createHttpHeader(
            "Idempotency-Nullable",
            FernIr.TypeReference.container(
                FernIr.ContainerType.nullable(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ),
            { wireValue: "Idempotency-Nullable" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: true } as any,
            idempotencyHeaders: [nullableIdempotencyHeader]
        });

        const text = statementsToString(result);
        expect(text).toContain("?? undefined");
        expect(text).toMatchSnapshot();
    });

    it("generates root-level overridable header with boolean literal value", () => {
        const booleanLiteralHeader = createHttpHeader(
            "X-Feature-Flag",
            FernIr.TypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.boolean(true))),
            { wireValue: "X-Feature-Flag" }
        );

        const mockContext = createMockContext();
        mockContext.type.resolveTypeReference = (typeRef: FernIr.TypeReference) => typeRef;

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [booleanLiteralHeader] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toContain("toString");
        expect(text).toContain("true");
        expect(text).toMatchSnapshot();
    });

    it("generates version header when version context has generated version", () => {
        const mockContext = createMockContext();
        mockContext.versionContext.getGeneratedVersion = () => ({
            getHeader: () =>
                createHttpHeader("X-API-Version", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                    wireValue: "X-API-Version"
                })
        });

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toContain("X-API-Version");
        expect(text).toMatchSnapshot();
    });

    it("generates auth headers with endpoint metadata when generateEndpointMetadata is true", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass({
                hasAuthProvider: true,
                generateEndpointMetadata: true
            }),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: true, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toContain("endpointMetadata");
        expect(text).toMatchSnapshot();
    });

    it("filters out Authorization header from root-level overridable headers", () => {
        const authHeader = createHttpHeader(
            "Authorization",
            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            { wireValue: "Authorization" }
        );
        const normalHeader = createHttpHeader(
            "X-Custom",
            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            { wireValue: "X-Custom" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [authHeader, normalHeader] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Authorization header should be filtered out, X-Custom should be present
        expect(text).toContain("X-Custom");
        expect(text).not.toContain('"Authorization"');
        expect(text).toMatchSnapshot();
    });

    it("generates root-level header with non-literal non-boolean value (fallback ?? this._options)", () => {
        const nonLiteralRootHeader = createHttpHeader(
            "X-Tenant",
            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            { wireValue: "X-Tenant" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [nonLiteralRootHeader] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Non-literal root header should have requestOptions?.header ?? this._options?.header fallback
        expect(text).toContain("X-Tenant");
        expect(text).toContain("_options");
        expect(text).toMatchSnapshot();
    });
});
