import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams.js";

function createName(name: string): FernIr.Name {
    return {
        originalName: name,
        camelCase: {
            unsafeName: name.charAt(0).toLowerCase() + name.slice(1),
            safeName: name.charAt(0).toLowerCase() + name.slice(1)
        },
        pascalCase: {
            unsafeName: name.charAt(0).toUpperCase() + name.slice(1),
            safeName: name.charAt(0).toUpperCase() + name.slice(1)
        },
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

function createQueryParameter(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { allowMultiple?: boolean; wireValue?: string }
): FernIr.QueryParameter {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        allowMultiple: opts?.allowMultiple ?? false,
        v2Examples: undefined,
        docs: undefined,
        availability: undefined,
        explode: undefined
    };
}

function createMockContext(opts?: {
    includeSerdeLayer?: boolean;
    retainOriginalCasing?: boolean;
    omitUndefined?: boolean;
}) {
    return {
        includeSerdeLayer: opts?.includeSerdeLayer ?? false,
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        type: {
            // biome-ignore lint/suspicious/noExplicitAny: test mock callback signature
            stringify: (expr: ts.Expression, _typeRef: FernIr.TypeReference, _opts: any) => {
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
        typeSchema: {
            getSchemaOfNamedType: () => ({
                jsonOrThrow: (expr: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createIdentifier("serializer.jsonOrThrow"),
                        undefined,
                        [expr]
                    );
                }
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

function defaultReferenceToQueryParameterProperty(queryParameterKey: string) {
    return ts.factory.createIdentifier(queryParameterKey);
}

describe("GeneratedQueryParams", () => {
    describe("getBuildStatements", () => {
        it("returns empty array when no query parameters", () => {
            const generator = new GeneratedQueryParams({
                queryParameters: undefined,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });
            const result = generator.getBuildStatements(createMockContext());
            expect(result).toHaveLength(0);
        });

        it("returns empty array when query parameters is empty array", () => {
            const generator = new GeneratedQueryParams({
                queryParameters: [],
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });
            const result = generator.getBuildStatements(createMockContext());
            expect(result).toHaveLength(0);
        });

        it("generates query params for single string parameter", () => {
            const queryParams = [
                createQueryParameter("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);

            const firstStatement = statements[0];
            if (firstStatement != null) {
                const text = getTextOfTsNode(firstStatement);
                expect(text).toMatchSnapshot();
            }
        });

        it("generates query params for multiple parameters", () => {
            const queryParams = [
                createQueryParameter("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                createQueryParameter("age", FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })),
                createQueryParameter("active", FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined }))
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);

            const firstStatement = statements[0];
            if (firstStatement != null) {
                const text = getTextOfTsNode(firstStatement);
                expect(text).toMatchSnapshot();
            }
        });

        it("generates query params with wire value different from name", () => {
            const queryParams = [
                createQueryParameter("filterBy", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                    wireValue: "filter_by"
                })
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: (_key) => ts.factory.createIdentifier("filterBy")
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);

            const firstStatement = statements[0];
            if (firstStatement != null) {
                const text = getTextOfTsNode(firstStatement);
                expect(text).toMatchSnapshot();
            }
        });

        it("generates query params with allowMultiple and array check", () => {
            const queryParams = [
                createQueryParameter(
                    "tags",
                    FernIr.TypeReference.container(
                        FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                    ),
                    { allowMultiple: true }
                )
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);

            const firstStatement = statements[0];
            if (firstStatement != null) {
                const text = getTextOfTsNode(firstStatement);
                expect(text).toMatchSnapshot();
            }
        });

        it("generates query params with date-time type needing stringify", () => {
            const queryParams = [
                createQueryParameter("createdAfter", FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined }))
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);

            const firstStatement = statements[0];
            if (firstStatement != null) {
                const text = getTextOfTsNode(firstStatement);
                expect(text).toMatchSnapshot();
            }
        });

        it("handles special characters in wire values", () => {
            const queryParams = [
                createQueryParameter("filterDate", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                    wireValue: "filter.date"
                })
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: (_key) =>
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("request"),
                        ts.factory.createIdentifier("filterDate")
                    )
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);

            const firstStatement = statements[0];
            if (firstStatement != null) {
                const text = getTextOfTsNode(firstStatement);
                expect(text).toMatchSnapshot();
            }
        });
    });

    describe("getReferenceTo", () => {
        it("returns spread with query params when parameters exist", () => {
            const queryParams = [
                createQueryParameter("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const result = generator.getReferenceTo();
            expect(result).toBeDefined();

            if (result != null) {
                const text = getTextOfTsNode(result);
                expect(text).toMatchSnapshot();
            }
        });

        it("returns only requestOptions queryParams when no parameters", () => {
            const generator = new GeneratedQueryParams({
                queryParameters: undefined,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const result = generator.getReferenceTo();
            expect(result).toBeDefined();

            if (result != null) {
                const text = getTextOfTsNode(result);
                expect(text).toMatchSnapshot();
            }
        });
    });
});
