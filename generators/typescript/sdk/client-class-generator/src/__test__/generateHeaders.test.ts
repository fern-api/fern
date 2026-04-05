import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
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
        },
        case: caseConverter
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
        const header = createHttpHeader("X-Required", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
            wireValue: "X-Required"
        });

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

    it("generates header with stringify for named alias to DATE_TIME type", () => {
        const mockContext = createMockContext();
        // Override getTypeDeclaration to return alias shape pointing to DATE_TIME
        mockContext.type.getTypeDeclaration = () => ({
            shape: FernIr.Type.alias({
                aliasOf: FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined }),
                resolvedType: FernIr.ResolvedTypeReference.primitive({
                    v1: "DATE_TIME",
                    v2: undefined
                })
            })
        });

        const namedHeader = createHttpHeader(
            "X-Timestamp",
            FernIr.TypeReference.named({
                typeId: "type_Timestamp" as FernIr.TypeId,
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "Timestamp",
                    camelCase: { unsafeName: "timestamp", safeName: "timestamp" },
                    snakeCase: { unsafeName: "timestamp", safeName: "timestamp" },
                    screamingSnakeCase: { unsafeName: "TIMESTAMP", safeName: "TIMESTAMP" },
                    pascalCase: { unsafeName: "Timestamp", safeName: "Timestamp" }
                },
                default: undefined,
                inline: undefined,
                displayName: undefined
            }),
            { wireValue: "X-Timestamp" }
        );

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [namedHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Named alias to DATE_TIME should trigger stringify
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates header without stringify for named enum type", () => {
        const mockContext = createMockContext();
        mockContext.type.getTypeDeclaration = () => ({
            shape: FernIr.Type.enum({ values: [], default: undefined, forwardCompatible: undefined })
        });

        const namedEnumHeader = createHttpHeader(
            "X-Status",
            FernIr.TypeReference.named({
                typeId: "type_Status" as FernIr.TypeId,
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "Status",
                    camelCase: { unsafeName: "status", safeName: "status" },
                    snakeCase: { unsafeName: "status", safeName: "status" },
                    screamingSnakeCase: { unsafeName: "STATUS", safeName: "STATUS" },
                    pascalCase: { unsafeName: "Status", safeName: "Status" }
                },
                default: undefined,
                inline: undefined,
                displayName: undefined
            }),
            { wireValue: "X-Status" }
        );

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [namedEnumHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Enum type should NOT trigger stringify
        expect(text).not.toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates nullable header with optional wrapping nullable (typeContainsNullable recurses)", () => {
        const optionalNullableHeader = createHttpHeader(
            "X-OptNullable",
            FernIr.TypeReference.container(
                FernIr.ContainerType.optional(
                    FernIr.TypeReference.container(
                        FernIr.ContainerType.nullable(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                    )
                )
            ),
            { wireValue: "X-OptNullable" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [optionalNullableHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Optional wrapping nullable should still produce ?? undefined
        expect(text).toContain("?? undefined");
        expect(text).toMatchSnapshot();
    });

    it("generates nullable header with named alias to nullable type (typeContainsNullable named branch)", () => {
        const mockContext = createMockContext();
        mockContext.type.getTypeDeclaration = () => ({
            shape: FernIr.Type.alias({
                aliasOf: FernIr.TypeReference.container(
                    FernIr.ContainerType.nullable(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ),
                resolvedType: FernIr.ResolvedTypeReference.container(
                    FernIr.ContainerType.nullable(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                )
            })
        });

        const namedNullableHeader = createHttpHeader(
            "X-NullableAlias",
            FernIr.TypeReference.named({
                typeId: "type_NullableString" as FernIr.TypeId,
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "NullableString",
                    camelCase: { unsafeName: "nullableString", safeName: "nullableString" },
                    snakeCase: { unsafeName: "nullable_string", safeName: "nullable_string" },
                    screamingSnakeCase: { unsafeName: "NULLABLE_STRING", safeName: "NULLABLE_STRING" },
                    pascalCase: { unsafeName: "NullableString", safeName: "NullableString" }
                },
                default: undefined,
                inline: undefined,
                displayName: undefined
            }),
            { wireValue: "X-NullableAlias" }
        );

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [namedNullableHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Named alias to nullable should produce ?? undefined
        expect(text).toContain("?? undefined");
        expect(text).toMatchSnapshot();
    });

    it("generates header with stringify for set container type", () => {
        const setHeader = createHttpHeader(
            "X-Ids",
            FernIr.TypeReference.container(
                FernIr.ContainerType.set(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ),
            { wireValue: "X-Ids" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [setHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Set container should trigger stringify
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates header with stringify for map container type", () => {
        const mapHeader = createHttpHeader(
            "X-Meta",
            FernIr.TypeReference.container(
                FernIr.ContainerType.map({
                    keyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                })
            ),
            { wireValue: "X-Meta" }
        );

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [mapHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Map container should trigger stringify
        expect(text).toContain("toString");
        expect(text).toMatchSnapshot();
    });

    it("generates header with stringify for named object type", () => {
        const mockContext = createMockContext();
        mockContext.type.getTypeDeclaration = () => ({
            shape: FernIr.Type.object({
                properties: [],
                extends: [],
                extraProperties: false,
                extendedProperties: undefined
            })
        });

        const namedObjHeader = createHttpHeader(
            "X-Config",
            FernIr.TypeReference.named({
                typeId: "type_Config" as FernIr.TypeId,
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "Config",
                    camelCase: { unsafeName: "config", safeName: "config" },
                    snakeCase: { unsafeName: "config", safeName: "config" },
                    screamingSnakeCase: { unsafeName: "CONFIG", safeName: "CONFIG" },
                    pascalCase: { unsafeName: "Config", safeName: "Config" }
                },
                default: undefined,
                inline: undefined,
                displayName: undefined
            }),
            { wireValue: "X-Config" }
        );

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [namedObjHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        // Object named type should trigger stringify
        expect(text).toContain("toString");
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
