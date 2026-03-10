import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { generateHeaders } from "../endpoints/utils/generateHeaders.js";

function createName(name: string): FernIr.Name {
    return {
        originalName: name,
        camelCase: { unsafeName: name.charAt(0).toLowerCase() + name.slice(1), safeName: name.charAt(0).toLowerCase() + name.slice(1) },
        pascalCase: { unsafeName: name.charAt(0).toUpperCase() + name.slice(1), safeName: name.charAt(0).toUpperCase() + name.slice(1) },
        snakeCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
        screamingSnakeCase: { unsafeName: name.toUpperCase(), safeName: name.toUpperCase() }
    };
}

function createNameAndWireValue(name: string, wireValue?: string): FernIr.NameAndWireValue {
    return {
        wireValue: wireValue ?? name,
        name: createName(name)
    };
}

function createHttpHeader(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string; env?: string }
): FernIr.HttpHeader {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        env: opts?.env ?? undefined,
        v2Examples: undefined,
        docs: undefined,
        availability: undefined
    };
}

function createMockContext() {
    return {
        type: {
            resolveTypeReference: (typeRef: FernIr.TypeReference) => typeRef,
            stringify: (expr: ts.Expression) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier("toString")),
                    undefined,
                    []
                );
            },
            getTypeDeclaration: () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            }),
            getReferenceToType: () => ({ isOptional: false })
        },
        importsManager: {
            addImportFromRoot: () => {
                // no-op for test
            }
        },
        coreUtilities: {
            fetcher: {
                Fetcher: {
                    Args: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("Fetcher.Args")
                    }
                }
            },
            auth: {
                AuthRequest: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("AuthRequest")
                },
                AuthProvider: {
                    getAuthRequest: {
                        invoke: (ref: ts.Expression, metadata?: ts.Expression) => {
                            const args = metadata != null ? [ref, metadata] : [ref];
                            return ts.factory.createCallExpression(
                                ts.factory.createIdentifier("getAuthRequest"),
                                undefined,
                                args
                            );
                        }
                    }
                }
            }
        },
        authProvider: {
            isAuthEndpoint: () => false
        },
        versionContext: {
            getGeneratedVersion: () => undefined
        }
    } as any;
}

function createMockGeneratedSdkClientClass(opts?: { hasAuthProvider?: boolean; generateEndpointMetadata?: boolean }) {
    return {
        hasAuthProvider: () => opts?.hasAuthProvider ?? false,
        getGenerateEndpointMetadata: () => opts?.generateEndpointMetadata ?? false,
        getReferenceToAuthProviderOrThrow: () => ts.factory.createIdentifier("this._authProvider"),
        getReferenceToMetadataForEndpointSupplier: () => ts.factory.createIdentifier("_metadata")
    } as any;
}

function createMockRequestParameter() {
    return {
        getReferenceToNonLiteralHeader: (header: FernIr.HttpHeader) => {
            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("request"),
                ts.factory.createIdentifier(header.name.name.camelCase.unsafeName)
            );
        }
    } as any;
}

function statementsToString(statements: ts.Statement[]): string {
    return statements.map((stmt) => getTextOfTsNode(stmt)).join("\n");
}

describe("generateHeaders", () => {
    it("generates headers with no service/endpoint headers and no auth", () => {
        const result = generateHeaders({
            context: createMockContext(),
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: [] } as any,
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        expect(result.length).toBeGreaterThan(0);
        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with service and endpoint headers", () => {
        const serviceHeaders = [
            createHttpHeader(
                "X-API-Version",
                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                { wireValue: "X-API-Version" }
            )
        ];

        const endpointHeaders = [
            createHttpHeader(
                "X-Request-Id",
                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                { wireValue: "X-Request-Id" }
            )
        ];

        const result = generateHeaders({
            context: createMockContext(),
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: serviceHeaders } as any,
            endpoint: { headers: endpointHeaders, auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with idempotency headers when endpoint is idempotent", () => {
        const idempotencyHeaders = [
            createHttpHeader(
                "Idempotency-Key",
                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                { wireValue: "Idempotency-Key" }
            )
        ];

        const result = generateHeaders({
            context: createMockContext(),
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: [] } as any,
            endpoint: { headers: [], auth: false, idempotent: true } as any,
            idempotencyHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers without idempotency headers when endpoint is not idempotent", () => {
        const idempotencyHeaders = [
            createHttpHeader(
                "Idempotency-Key",
                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                { wireValue: "Idempotency-Key" }
            )
        ];

        const result = generateHeaders({
            context: createMockContext(),
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: [] } as any,
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates auth headers when auth provider exists and endpoint requires auth", () => {
        const result = generateHeaders({
            context: createMockContext(),
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass({ hasAuthProvider: true }),
            requestParameter: createMockRequestParameter(),
            service: { headers: [] } as any,
            endpoint: { headers: [], auth: true, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with literal header value", () => {
        const literalHeader = createHttpHeader(
            "X-Fern-Language",
            FernIr.TypeReference.container(
                FernIr.ContainerType.literal(FernIr.Literal.string("JavaScript"))
            ),
            { wireValue: "X-Fern-Language" }
        );

        const mockContext = createMockContext();
        // Override resolveTypeReference to return the literal container
        mockContext.type.resolveTypeReference = (typeRef: FernIr.TypeReference) => typeRef;

        const result = generateHeaders({
            context: mockContext,
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: [literalHeader] } as any,
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with root-level overridable headers", () => {
        const rootHeaders = [
            createHttpHeader(
                "X-Custom-Header",
                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                { wireValue: "X-Custom-Header" }
            )
        ];

        const mockContext = createMockContext();

        const result = generateHeaders({
            context: mockContext,
            intermediateRepresentation: { headers: rootHeaders } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: [] } as any,
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
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            service: { headers: [] } as any,
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: [],
            additionalHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });
});
