import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { caseConverter } from "./caseConverter.js";

/**
 * Creates a mock type context with stringify, getTypeDeclaration, getReferenceToType, and resolveTypeReference.
 * Used by query params, headers, and other components that need to interact with the type system.
 */
export function createMockTypeContext() {
    return {
        // biome-ignore lint/suspicious/noExplicitAny: test mock callback signature
        stringify: (expr: ts.Expression, _typeRef: FernIr.TypeReference, _opts: any) => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier("toString")),
                undefined,
                []
            );
        },
        resolveTypeReference: (typeRef: FernIr.TypeReference) => typeRef,
        getTypeDeclaration: () => ({
            shape: FernIr.Type.object({
                properties: [],
                extends: [],
                extraProperties: false,
                extendedProperties: undefined
            })
        }),
        getReferenceToType: () => ({ isOptional: false })
    };
}

/**
 * Creates a mock typeSchema context with getSchemaOfNamedType.
 * Returns a schema object with a jsonOrThrow method.
 */
export function createMockTypeSchemaContext(opts?: { useSerializerPrefix?: boolean }) {
    return {
        getSchemaOfNamedType: () => ({
            jsonOrThrow: (expr: ts.Expression) => {
                if (opts?.useSerializerPrefix) {
                    return ts.factory.createCallExpression(
                        ts.factory.createIdentifier("serializer.jsonOrThrow"),
                        undefined,
                        [expr]
                    );
                }
                return expr;
            }
        })
    };
}

/**
 * Creates a mock core utilities context for URL encoding, fetcher, and auth.
 */
export function createMockCoreUtilities() {
    return {
        urlUtils: {
            encodePathParam: {
                _invoke: (expr: ts.Expression) => expr
            }
        },
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
    };
}

/**
 * Creates a mock generated client class for buildUrl tests.
 * Provides getReferenceToVariable and getReferenceToRootPathParameter.
 */
export function createMockGeneratedClientClass() {
    return {
        getReferenceToVariable: (variableId: string) => ts.factory.createIdentifier(`this._${variableId}`),
        getReferenceToRootPathParameter: (pathParam: FernIr.PathParameter) =>
            ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier(caseConverter.camelUnsafe(pathParam.name))
            )
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a mock generated SDK client class for header generation tests.
 */
export function createMockGeneratedSdkClientClass(opts?: {
    hasAuthProvider?: boolean;
    generateEndpointMetadata?: boolean;
}) {
    return {
        hasAuthProvider: () => opts?.hasAuthProvider ?? false,
        getGenerateEndpointMetadata: () => opts?.generateEndpointMetadata ?? false,
        getReferenceToAuthProviderOrThrow: () => ts.factory.createIdentifier("this._authProvider"),
        getReferenceToMetadataForEndpointSupplier: () => ts.factory.createIdentifier("_metadata")
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a mock request parameter for header generation tests.
 */
export function createMockRequestParameter() {
    return {
        getReferenceToNonLiteralHeader: (header: FernIr.HttpHeader) => {
            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("request"),
                ts.factory.createIdentifier(caseConverter.camelUnsafe(header.name))
            );
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a mock environments context for environment generator tests.
 */
export function createMockEnvironmentsContext() {
    return {
        environments: {
            getReferenceToEnvironmentsEnum: () => ({
                getExpression: () => ts.factory.createIdentifier("MyEnvironment")
            })
        },
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}
