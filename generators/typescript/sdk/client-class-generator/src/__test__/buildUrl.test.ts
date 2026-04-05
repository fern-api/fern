import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    createMockCoreUtilities,
    createMockGeneratedClientClass,
    createMockTypeSchemaContext,
    createPathParameter
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { buildUrl } from "../endpoints/utils/buildUrl.js";

function createMockContext(opts?: { useSerializerPrefix?: boolean }) {
    const coreUtilities = createMockCoreUtilities();
    return {
        coreUtilities,
        requestWrapper: {
            shouldInlinePathParameters: () => false
        },
        typeSchema: createMockTypeSchemaContext({ useSerializerPrefix: opts?.useSerializerPrefix }),
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

const defaultGetReferenceToPathParameterVariableFromRequest = (pathParameter: FernIr.PathParameter) =>
    ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("request"),
        ts.factory.createIdentifier(caseConverter.camelUnsafe(pathParameter.name))
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

        assert(result != null, "expected buildUrl to return an expression for static path");
        expect(getTextOfTsNode(result)).toBe('"/api/v1/users"');
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

        assert(result != null, "expected buildUrl to return an expression for single parameter path");
        const text = getTextOfTsNode(result);
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

        assert(result != null, "expected buildUrl to return an expression for multiple parameter path");
        const text = getTextOfTsNode(result);
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

        assert(result != null, "expected buildUrl to return an expression for trailing path");
        const text = getTextOfTsNode(result);
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

        assert(result != null, "expected buildUrl to return an expression for ROOT location parameter");
        const text = getTextOfTsNode(result);
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

        assert(result != null, "expected buildUrl to return an expression with original casing");
        const text = getTextOfTsNode(result);
        expect(text).toMatchSnapshot();
    });

    it("serializes named type path parameter with includeSerdeLayer", () => {
        const namedParam: FernIr.PathParameter = {
            ...createPathParameter("userId"),
            valueType: FernIr.TypeReference.named({
                typeId: "type_UserId" as FernIr.TypeId,
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "UserId",
                    camelCase: { unsafeName: "userId", safeName: "userId" },
                    snakeCase: { unsafeName: "user_id", safeName: "user_id" },
                    screamingSnakeCase: { unsafeName: "USER_ID", safeName: "USER_ID" },
                    pascalCase: { unsafeName: "UserId", safeName: "UserId" }
                },
                default: undefined,
                inline: undefined,
                displayName: undefined
            })
        };

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                },
                allPathParameters: [namedParam],
                path: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: createMockContext({ useSerializerPrefix: true }),
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        assert(result != null, "expected buildUrl to return an expression for named type with serde");
        const text = getTextOfTsNode(result);
        // Should include serializer.jsonOrThrow serialization for named type
        expect(text).toContain("serializer.jsonOrThrow");
        expect(text).toMatchSnapshot();
    });

    it("uses variable reference when path parameter has variable property", () => {
        const variableParam: FernIr.PathParameter = {
            ...createPathParameter("userId"),
            variable: "userId" as FernIr.VariableId
        };

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                },
                allPathParameters: [variableParam],
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

        assert(result != null, "expected buildUrl to return an expression for variable path parameter");
        const text = getTextOfTsNode(result);
        // Should reference the variable via generatedClientClass.getReferenceToVariable
        expect(text).toContain("this");
        expect(text).toMatchSnapshot();
    });

    it("uses request reference when shouldInlinePathParameters is true", () => {
        const param = createPathParameter("userId");

        const mockContext = createMockContext();
        mockContext.requestWrapper.shouldInlinePathParameters = () => true;

        const result = buildUrl({
            endpoint: {
                sdkRequest: undefined,
                fullPath: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                },
                allPathParameters: [param],
                path: {
                    head: "/users/",
                    parts: [{ pathParameter: "userId", tail: "" }]
                }
            },
            generatedClientClass: createMockGeneratedClientClass(),
            context: mockContext,
            includeSerdeLayer: false,
            retainOriginalCasing: false,
            omitUndefined: false,
            parameterNaming: "default",
            getReferenceToPathParameterVariableFromRequest: defaultGetReferenceToPathParameterVariableFromRequest
        });

        assert(result != null, "expected buildUrl to return an expression for inline path parameters");
        const text = getTextOfTsNode(result);
        // Should use the getReferenceToPathParameterVariableFromRequest callback
        expect(text).toContain("request.userId");
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
