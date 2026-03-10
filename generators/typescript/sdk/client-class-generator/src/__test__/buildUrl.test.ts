import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { buildUrl } from "../endpoints/utils/buildUrl.js";

function createName(name: string): FernIr.Name {
    return {
        originalName: name,
        camelCase: { unsafeName: name.charAt(0).toLowerCase() + name.slice(1), safeName: name.charAt(0).toLowerCase() + name.slice(1) },
        pascalCase: { unsafeName: name.charAt(0).toUpperCase() + name.slice(1), safeName: name.charAt(0).toUpperCase() + name.slice(1) },
        snakeCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
        screamingSnakeCase: { unsafeName: name.toUpperCase(), safeName: name.toUpperCase() }
    };
}

function createPathParameter(
    name: string,
    location: FernIr.PathParameterLocation = "ENDPOINT"
): FernIr.PathParameter {
    return {
        name: createName(name),
        valueType: FernIr.TypeReference.primitive({
            v1: "STRING",
            v2: undefined
        }),
        location,
        variable: undefined,
        v2Examples: undefined,
        docs: undefined,
        explode: undefined
    };
}

// Minimal mock that returns the expression as-is (no encoding wrapper)
function createMockContext() {
    return {
        coreUtilities: {
            urlUtils: {
                encodePathParam: {
                    _invoke: (expr: ts.Expression) => expr
                }
            }
        },
        requestWrapper: {
            shouldInlinePathParameters: () => false
        },
        typeSchema: {
            getSchemaOfNamedType: () => ({
                jsonOrThrow: (expr: ts.Expression) => expr
            })
        }
    } as any;
}

function createMockGeneratedClientClass() {
    return {
        getReferenceToVariable: (variableId: string) => ts.factory.createIdentifier(`this._${variableId}`),
        getReferenceToRootPathParameter: (pathParam: FernIr.PathParameter) =>
            ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier(pathParam.name.camelCase.unsafeName)
            )
    } as any;
}

const defaultGetReferenceToPathParameterVariableFromRequest = (pathParameter: FernIr.PathParameter) =>
    ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("request"),
        ts.factory.createIdentifier(pathParameter.name.camelCase.unsafeName)
    );

describe("buildUrl", () => {
    it("returns undefined for empty path with no path parameters", () => {
        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: { head: "", parts: [] },
                allPathParameters: [],
                path: { head: "", parts: [] }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeUndefined();
    });

    it("returns string literal for static path with no parameters", () => {
        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: { head: "/api/v1/users", parts: [] },
                allPathParameters: [],
                path: { head: "/api/v1/users", parts: [] }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeDefined();
        expect(getTextOfTsNode(result!)).toBe('"/api/v1/users"');
    });

    it("generates template literal for path with one parameter", () => {
        const userIdParam = createPathParameter("userId");

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                },
                allPathParameters: [userIdParam],
                path: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeDefined();
        const text = getTextOfTsNode(result!);
        expect(text).toMatchSnapshot();
    });

    it("generates template literal for path with multiple parameters", () => {
        const orgIdParam = createPathParameter("orgId");
        const userIdParam = createPathParameter("userId");

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/orgs/",
                    parts: [
                        { pathParameter: "orgId", tail: "/users/" },
                        { pathParameter: "userId", tail: "" }
                    ]
                },
                allPathParameters: [orgIdParam, userIdParam],
                path: {
                    head: "/orgs/",
                    parts: [
                        { pathParameter: "orgId", tail: "/users/" },
                        { pathParameter: "userId", tail: "" }
                    ]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeDefined();
        const text = getTextOfTsNode(result!);
        expect(text).toMatchSnapshot();
    });

    it("generates template literal with trailing path after parameter", () => {
        const userIdParam = createPathParameter("userId");

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "/profile" }]
                },
                allPathParameters: [userIdParam],
                path: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "/profile" }]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeDefined();
        const text = getTextOfTsNode(result!);
        expect(text).toMatchSnapshot();
    });

    it("uses root path parameter reference for ROOT location", () => {
        const rootParam = createPathParameter("tenantId", "ROOT");

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/tenants/",
                    parts: [{ pathParameter: "tenantId", tail: "/data" }]
                },
                allPathParameters: [rootParam],
                path: {
                    head: "/tenants/",
                    parts: [{ pathParameter: "tenantId", tail: "/data" }]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeDefined();
        const text = getTextOfTsNode(result!);
        expect(text).toMatchSnapshot();
    });

    it("retains original casing when retainOriginalCasing is true", () => {
        const param = createPathParameter("user_id");

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/users/",
                    parts: [{ pathParameter: "user_id", tail: "" }]
                },
                allPathParameters: [param],
                path: {
                    head: "/users/",
                    parts: [{ pathParameter: "user_id", tail: "" }]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext(),
            includeSerdeLayer: false,
            retainOriginalCasing: true,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        expect(result).toBeDefined();
        const text = getTextOfTsNode(result!);
        expect(text).toMatchSnapshot();
    });

    it("throws when path parameter is not found in allPathParameters", () => {
        // Need at least one path parameter so buildUrl doesn't take the early return path
        const existingParam = createPathParameter("existing");
        expect(() =>
            buildUrl({
                endpoint: {
                    sdkRequest: undefined,
                    fullPath: {
                        head: "/users/",
                        parts: [{ pathParameter: "nonexistent", tail: "" }]
                    },
                    allPathParameters: [existingParam],
                    path: {
                        head: "/users/",
                        parts: [{ pathParameter: "nonexistent", tail: "" }]
                    }
                },
                generatedClientClass: createMockGeneratedClientClass(),
                context: createMockContext(),
                includeSerdeLayer: false,
                retainOriginalCasing: false,
                omitUndefined: false,
                parameterNaming: "default",
                getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
            })
        ).toThrow("Could not locate path parameter: nonexistent");
    });
});
