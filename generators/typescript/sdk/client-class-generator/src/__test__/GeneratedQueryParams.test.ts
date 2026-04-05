import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    createMockTypeContext,
    createMockTypeSchemaContext,
    createQueryParameter
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams.js";

function createMockContext(opts?: {
    includeSerdeLayer?: boolean;
    retainOriginalCasing?: boolean;
    omitUndefined?: boolean;
}) {
    return {
        includeSerdeLayer: opts?.includeSerdeLayer ?? false,
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        type: createMockTypeContext(),
        typeSchema: createMockTypeSchemaContext({ useSerializerPrefix: true }),
        case: caseConverter
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
            assert(firstStatement != null, "expected at least one build statement for single parameter");
            const text = getTextOfTsNode(firstStatement);
            expect(text).toMatchSnapshot();
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
            assert(firstStatement != null, "expected at least one build statement for multiple parameters");
            const text = getTextOfTsNode(firstStatement);
            expect(text).toMatchSnapshot();
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
            assert(firstStatement != null, "expected at least one build statement for wire value mismatch");
            const text = getTextOfTsNode(firstStatement);
            expect(text).toMatchSnapshot();
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
            assert(firstStatement != null, "expected at least one build statement for allowMultiple");
            const text = getTextOfTsNode(firstStatement);
            expect(text).toMatchSnapshot();
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
            assert(firstStatement != null, "expected at least one build statement for date-time stringify");
            const text = getTextOfTsNode(firstStatement);
            expect(text).toMatchSnapshot();
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
            assert(firstStatement != null, "expected at least one build statement for special characters");
            const text = getTextOfTsNode(firstStatement);
            expect(text).toMatchSnapshot();
        });

        it("generates query params with object type and serde layer (serializer call)", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_MyObject",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "MyObject",
                    camelCase: { unsafeName: "myObject", safeName: "myObject" },
                    snakeCase: { unsafeName: "my_object", safeName: "my_object" },
                    screamingSnakeCase: { unsafeName: "MY_OBJECT", safeName: "MY_OBJECT" },
                    pascalCase: { unsafeName: "MyObject", safeName: "MyObject" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const queryParams = [createQueryParameter("filter", namedType)];
            const mockContext = createMockContext({ includeSerdeLayer: true });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            });

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).toContain("jsonOrThrow");
            expect(text).toMatchSnapshot();
        });

        it("generates query params with optional object type and serde layer (conditional serializer)", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_MyObject",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "MyObject",
                    camelCase: { unsafeName: "myObject", safeName: "myObject" },
                    snakeCase: { unsafeName: "my_object", safeName: "my_object" },
                    screamingSnakeCase: { unsafeName: "MY_OBJECT", safeName: "MY_OBJECT" },
                    pascalCase: { unsafeName: "MyObject", safeName: "MyObject" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const optionalNamedType = FernIr.TypeReference.container(FernIr.ContainerType.optional(namedType));
            const queryParams = [createQueryParameter("filter", optionalNamedType)];
            const mockContext = createMockContext({ includeSerdeLayer: true });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            });

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // Optional object should have conditional: filter !== null ? serializer : filter
            expect(text).toContain("!= null");
            expect(text).toContain("jsonOrThrow");
            expect(text).toMatchSnapshot();
        });

        it("generates query params with object type without serde layer (passthrough)", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_MyObject",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "MyObject",
                    camelCase: { unsafeName: "myObject", safeName: "myObject" },
                    snakeCase: { unsafeName: "my_object", safeName: "my_object" },
                    screamingSnakeCase: { unsafeName: "MY_OBJECT", safeName: "MY_OBJECT" },
                    pascalCase: { unsafeName: "MyObject", safeName: "MyObject" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const queryParams = [createQueryParameter("filter", namedType)];
            const mockContext = createMockContext({ includeSerdeLayer: false });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            });

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // Without serde layer, object type just passes through
            expect(text).not.toContain("jsonOrThrow");
            expect(text).toMatchSnapshot();
        });

        it("generates allowMultiple with object type list items and serde layer (async map)", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_MyObject",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "MyObject",
                    camelCase: { unsafeName: "myObject", safeName: "myObject" },
                    snakeCase: { unsafeName: "my_object", safeName: "my_object" },
                    screamingSnakeCase: { unsafeName: "MY_OBJECT", safeName: "MY_OBJECT" },
                    pascalCase: { unsafeName: "MyObject", safeName: "MyObject" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const listOfObject = FernIr.TypeReference.container(FernIr.ContainerType.list(namedType));
            const queryParams = [createQueryParameter("items", listOfObject, { allowMultiple: true })];
            const mockContext = createMockContext({ includeSerdeLayer: true });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            });

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // Should have Array.isArray check and async map with Promise.all
            expect(text).toContain("Array.isArray");
            expect(text).toContain("Promise.all");
            expect(text).toContain("async");
            expect(text).toMatchSnapshot();
        });

        it("generates allowMultiple with date-time list items (stringify map)", () => {
            const dateTimeType = FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined });
            const listOfDateTime = FernIr.TypeReference.container(FernIr.ContainerType.list(dateTimeType));
            const queryParams = [createQueryParameter("dates", listOfDateTime, { allowMultiple: true })];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // Should have Array.isArray check and map with stringify
            expect(text).toContain("Array.isArray");
            expect(text).toContain("map");
            expect(text).toContain("toString");
            expect(text).toMatchSnapshot();
        });

        it("generates allowMultiple with string list items (no transform needed)", () => {
            const stringType = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
            const listOfString = FernIr.TypeReference.container(FernIr.ContainerType.list(stringType));
            const queryParams = [createQueryParameter("tags", listOfString, { allowMultiple: true })];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // String list doesn't need transform, should just be passed through
            expect(text).toMatchSnapshot();
        });

        it("generates query params with unknown type (stringify fallback)", () => {
            const queryParams = [createQueryParameter("data", FernIr.TypeReference.unknown())];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).toContain("toString");
            expect(text).toMatchSnapshot();
        });

        it("uses originalName when retainOriginalCasing is true", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_MyObject",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "MyObject",
                    camelCase: { unsafeName: "myObject", safeName: "myObject" },
                    snakeCase: { unsafeName: "my_object", safeName: "my_object" },
                    screamingSnakeCase: { unsafeName: "MY_OBJECT", safeName: "MY_OBJECT" },
                    pascalCase: { unsafeName: "MyObject", safeName: "MyObject" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const queryParams = [createQueryParameter("filter_data", namedType)];
            const mockContext = createMockContext({ includeSerdeLayer: true, retainOriginalCasing: true });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            });

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // retainOriginalCasing uses originalName for breadcrumbs
            expect(text).toContain("filter_data");
            expect(text).toMatchSnapshot();
        });

        it("generates query params with alias resolving to primitive", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_MyAlias",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "MyAlias",
                    camelCase: { unsafeName: "myAlias", safeName: "myAlias" },
                    snakeCase: { unsafeName: "my_alias", safeName: "my_alias" },
                    screamingSnakeCase: { unsafeName: "MY_ALIAS", safeName: "MY_ALIAS" },
                    pascalCase: { unsafeName: "MyAlias", safeName: "MyAlias" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const queryParams = [createQueryParameter("aliased", namedType)];
            const mockContext = createMockContext();
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.alias({
                    aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    resolvedType: FernIr.ResolvedTypeReference.primitive({ v1: "STRING", v2: undefined })
                })
            });

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            // Alias of string primitive should not need stringify
            expect(text).not.toContain("toString");
            expect(text).toMatchSnapshot();
        });

        it("generates query params with nullable wrapping a primitive", () => {
            const nullableString = FernIr.TypeReference.container(
                FernIr.ContainerType.nullable(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            );
            const queryParams = [createQueryParameter("optName", nullableString)];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).toMatchSnapshot();
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
            assert(result != null, "expected getReferenceTo to return an expression when parameters exist");
            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });

        it("returns only requestOptions queryParams when no parameters", () => {
            const generator = new GeneratedQueryParams({
                queryParameters: undefined,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const result = generator.getReferenceTo();
            assert(result != null, "expected getReferenceTo to return an expression when no parameters");
            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });
    });
});
