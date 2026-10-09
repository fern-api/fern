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
    deepObjectMapQueryParameters?: boolean;
}) {
    return {
        includeSerdeLayer: opts?.includeSerdeLayer ?? false,
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        deepObjectMapQueryParameters: opts?.deepObjectMapQueryParameters ?? false,
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
                    extendedProperties: undefined,
                    deferredUnionBaseProperties: undefined
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
                    extendedProperties: undefined,
                    deferredUnionBaseProperties: undefined
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
                    extendedProperties: undefined,
                    deferredUnionBaseProperties: undefined
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
                    extendedProperties: undefined,
                    deferredUnionBaseProperties: undefined
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

        it("stringifies map<string, string> by default", () => {
            const mapType = FernIr.TypeReference.container(
                FernIr.ContainerType.map({
                    keyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                })
            );
            const queryParams = [createQueryParameter("metadata", mapType)];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext());
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).toContain("toString");
            expect(text).toMatchSnapshot();
        });

        it("passes map<string, string> through untouched when deepObjectMapQueryParameters is enabled", () => {
            const mapType = FernIr.TypeReference.container(
                FernIr.ContainerType.map({
                    keyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                })
            );
            const queryParams = [createQueryParameter("metadata", mapType)];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext({ deepObjectMapQueryParameters: true }));
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).not.toContain("toJson");
            expect(text).toMatchSnapshot();
        });

        it("passes optional<map<string, integer>> through untouched when deepObjectMapQueryParameters is enabled", () => {
            const mapType = FernIr.TypeReference.container(
                FernIr.ContainerType.optional(
                    FernIr.TypeReference.container(
                        FernIr.ContainerType.map({
                            keyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            valueType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })
                        })
                    )
                )
            );
            const queryParams = [createQueryParameter("counts", mapType)];

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(createMockContext({ deepObjectMapQueryParameters: true }));
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).not.toContain("toJson");
            expect(text).toMatchSnapshot();
        });

        describe("deepObjectMapQueryParameters with non-primitive map values", () => {
            const stringType = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
            const dateTimeType = FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined });
            const myObjectType = FernIr.TypeReference.named({
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
            const mapOf = (valueType: FernIr.TypeReference) =>
                FernIr.TypeReference.container(FernIr.ContainerType.map({ keyType: stringType, valueType }));
            const objectShape = FernIr.Type.object({
                properties: [],
                extends: [],
                extraProperties: false,
                extendedProperties: undefined,
                deferredUnionBaseProperties: undefined
            });

            function generate(
                name: string,
                type: FernIr.TypeReference,
                opts: { includeSerdeLayer: boolean; deepObjectMapQueryParameters?: boolean }
            ): string {
                const mockContext = createMockContext({
                    includeSerdeLayer: opts.includeSerdeLayer,
                    deepObjectMapQueryParameters: opts.deepObjectMapQueryParameters ?? true
                });
                mockContext.type.getTypeDeclaration = () => ({ shape: objectShape });
                mockContext.typeSchema.getSchemaOfTypeReference = () => ({
                    jsonOrThrow: (expr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("serializers.record.jsonOrThrow"),
                            undefined,
                            [expr]
                        )
                });
                const generator = new GeneratedQueryParams({
                    queryParameters: [createQueryParameter(name, type)],
                    referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
                });
                const firstStmt = generator.getBuildStatements(mockContext)[0];
                assert(firstStmt != null, "expected at least one statement");
                return getTextOfTsNode(firstStmt);
            }

            it("still stringifies map<string, MyObject> when the flag is disabled", () => {
                const text = generate("metadata", mapOf(myObjectType), {
                    includeSerdeLayer: true,
                    deepObjectMapQueryParameters: false
                });
                expect(text).toContain("toString");
                expect(text).not.toContain("jsonOrThrow");
                expect(text).toMatchSnapshot();
            });

            it("serializes map<string, datetime> via the serde layer", () => {
                const text = generate("timestamps", mapOf(dateTimeType), { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(timestamps)");
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("serializes map<string, MyObject> via the serde layer", () => {
                const text = generate("metadata", mapOf(myObjectType), { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(metadata)");
                expect(text).toMatchSnapshot();
            });

            it("serializes optional<map<string, MyObject>> via the serde layer with a null guard", () => {
                const type = FernIr.TypeReference.container(FernIr.ContainerType.optional(mapOf(myObjectType)));
                const text = generate("metadata", type, { includeSerdeLayer: true });
                expect(text).toContain("metadata != null ? serializers.record.jsonOrThrow(metadata) : metadata");
                expect(text).toMatchSnapshot();
            });

            it("serializes nullable<map<string, MyObject>> via the serde layer (nullable schema handles null)", () => {
                const type = FernIr.TypeReference.container(FernIr.ContainerType.nullable(mapOf(myObjectType)));
                const text = generate("metadata", type, { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(metadata)");
                expect(text).toMatchSnapshot();
            });

            it("passes nullable<map<string, boolean>> through untouched", () => {
                const boolType = FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined });
                const type = FernIr.TypeReference.container(FernIr.ContainerType.nullable(mapOf(boolType)));
                const text = generate("flags", type, { includeSerdeLayer: true });
                expect(text).not.toContain("jsonOrThrow");
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("serializes map<string, list<datetime>> via the serde layer", () => {
                const listOfDates = FernIr.TypeReference.container(FernIr.ContainerType.list(dateTimeType));
                const text = generate("windows", mapOf(listOfDates), { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(windows)");
                expect(text).toMatchSnapshot();
            });

            it("serializes map<string, map<string, MyObject>> (nested map) via the serde layer", () => {
                const text = generate("nested", mapOf(mapOf(myObjectType)), { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(nested)");
                expect(text).toMatchSnapshot();
            });

            it("serializes map<string, list<MyObject>> via the serde layer", () => {
                const listOfObject = FernIr.TypeReference.container(FernIr.ContainerType.list(myObjectType));
                const text = generate("grouped", mapOf(listOfObject), { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(grouped)");
                expect(text).toMatchSnapshot();
            });

            it("serializes map<string, set<string>> via the serde layer (a JS Set would vanish)", () => {
                const setOfStrings = FernIr.TypeReference.container(FernIr.ContainerType.set(stringType));
                const text = generate("tags", mapOf(setOfStrings), { includeSerdeLayer: true });
                expect(text).toContain("serializers.record.jsonOrThrow(tags)");
                expect(text).toMatchSnapshot();
            });

            it("passes map<string, set<string>> through untouched when the serde layer is disabled", () => {
                // Without serde, `set<string>` is generated as an array, which the query builder walks natively.
                const setOfStrings = FernIr.TypeReference.container(FernIr.ContainerType.set(stringType));
                const text = generate("tags", mapOf(setOfStrings), { includeSerdeLayer: false });
                expect(text).not.toContain("jsonOrThrow");
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("keeps both branches of an allowMultiple map<string, string> in deepObject form", () => {
                const mockContext = createMockContext({
                    includeSerdeLayer: true,
                    deepObjectMapQueryParameters: true
                });
                const generator = new GeneratedQueryParams({
                    queryParameters: [createQueryParameter("m", mapOf(stringType), { allowMultiple: true })],
                    referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
                });
                const firstStmt = generator.getBuildStatements(mockContext)[0];
                assert(firstStmt != null, "expected at least one statement");
                const text = getTextOfTsNode(firstStmt);
                // Neither branch may stringify: the scalar branch passes through, so the array
                // branch must too, otherwise the same param encodes two different ways.
                expect(text).not.toContain("toString");
                expect(text).not.toContain("jsonOrThrow");
                expect(text).toMatchSnapshot();
            });

            it("serializes both branches of an allowMultiple map<string, datetime> via serde", () => {
                const mockContext = createMockContext({
                    includeSerdeLayer: true,
                    deepObjectMapQueryParameters: true
                });
                mockContext.typeSchema.getSchemaOfTypeReference = () => ({
                    jsonOrThrow: (expr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("serializers.record.jsonOrThrow"),
                            undefined,
                            [expr]
                        )
                });
                const generator = new GeneratedQueryParams({
                    queryParameters: [createQueryParameter("m", mapOf(dateTimeType), { allowMultiple: true })],
                    referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
                });
                const firstStmt = generator.getBuildStatements(mockContext)[0];
                assert(firstStmt != null, "expected at least one statement");
                const text = getTextOfTsNode(firstStmt);
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("does not deepObject-encode a map declared explode: false", () => {
                const mockContext = createMockContext({
                    includeSerdeLayer: true,
                    deepObjectMapQueryParameters: true
                });
                const queryParameter = createQueryParameter("filters", mapOf(stringType));
                const generator = new GeneratedQueryParams({
                    queryParameters: [{ ...queryParameter, explode: false }],
                    referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
                });
                const firstStmt = generator.getBuildStatements(mockContext)[0];
                assert(firstStmt != null, "expected at least one statement");
                const text = getTextOfTsNode(firstStmt);
                // `explode: false` asks for comma-joining, not `?filters[a]=1`, so the flag stays out of it.
                expect(text).toContain("toString");
                expect(text).toMatchSnapshot();
            });

            describe("unknown-valued maps are rejected at generation time", () => {
                const unknownType = FernIr.TypeReference.unknown();

                function build(
                    name: string,
                    type: FernIr.TypeReference,
                    opts?: { deepObjectMapQueryParameters?: boolean; endpointLabel?: string }
                ) {
                    const mockContext = createMockContext({
                        includeSerdeLayer: true,
                        deepObjectMapQueryParameters: opts?.deepObjectMapQueryParameters ?? true
                    });
                    mockContext.type.getTypeDeclaration = () => ({ shape: objectShape });
                    mockContext.typeSchema.getSchemaOfTypeReference = () => ({
                        jsonOrThrow: (expr: ts.Expression) => expr
                    });
                    const generator = new GeneratedQueryParams({
                        queryParameters: [createQueryParameter(name, type)],
                        referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty,
                        endpointLabel: opts?.endpointLabel
                    });
                    return () => generator.getBuildStatements(mockContext);
                }

                it("throws for map<string, unknown>", () => {
                    expect(build("metadata", mapOf(unknownType))).toThrow(
                        /Query parameter 'metadata' is a map with `unknown` values/
                    );
                });

                it("names the endpoint when one is available", () => {
                    expect(build("metadata", mapOf(unknownType), { endpointLabel: "GET /search" })).toThrow(
                        /Query parameter 'metadata' on GET \/search is a map with `unknown` values/
                    );
                });

                it("explains both ways out", () => {
                    expect(build("metadata", mapOf(unknownType))).toThrow(
                        /give the map a concrete value type.*or disable `deepObjectMapQueryParameters`/s
                    );
                });

                it("throws for unknown nested under a list", () => {
                    const listOfUnknown = FernIr.TypeReference.container(FernIr.ContainerType.list(unknownType));
                    expect(build("metadata", mapOf(listOfUnknown))).toThrow(/`unknown` values/);
                });

                it("throws for unknown nested under an inner map", () => {
                    expect(build("metadata", mapOf(mapOf(unknownType)))).toThrow(/`unknown` values/);
                });

                it("throws for optional<map<string, unknown>>", () => {
                    const type = FernIr.TypeReference.container(FernIr.ContainerType.optional(mapOf(unknownType)));
                    expect(build("metadata", type)).toThrow(/`unknown` values/);
                });

                it("does not throw when the flag is disabled", () => {
                    expect(
                        build("metadata", mapOf(unknownType), { deepObjectMapQueryParameters: false })
                    ).not.toThrow();
                });

                it("does not throw for a map declared explode: false", () => {
                    const mockContext = createMockContext({
                        includeSerdeLayer: true,
                        deepObjectMapQueryParameters: true
                    });
                    const queryParameter = createQueryParameter("metadata", mapOf(unknownType));
                    const generator = new GeneratedQueryParams({
                        queryParameters: [{ ...queryParameter, explode: false }],
                        referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
                    });
                    expect(() => generator.getBuildStatements(mockContext)).not.toThrow();
                });

                it("does not throw for typed map values, which serde normalizes", () => {
                    expect(build("metadata", mapOf(myObjectType))).not.toThrow();
                    expect(build("timestamps", mapOf(dateTimeType))).not.toThrow();
                    expect(build("labels", mapOf(stringType))).not.toThrow();
                });

                it("does not throw for a bare unknown query parameter (not a map)", () => {
                    expect(build("anything", unknownType)).not.toThrow();
                });
            });

            it("passes map<string, map<string, string>> through untouched (no serde needed)", () => {
                const text = generate("nested", mapOf(mapOf(stringType)), { includeSerdeLayer: true });
                expect(text).not.toContain("jsonOrThrow");
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("passes a named alias to map<string, string> through untouched", () => {
                const mockContext = createMockContext({ deepObjectMapQueryParameters: true });
                mockContext.type.getTypeDeclaration = () => ({
                    shape: FernIr.Type.alias({
                        aliasOf: mapOf(stringType),
                        resolvedType: FernIr.ResolvedTypeReference.container(
                            FernIr.ContainerType.map({ keyType: stringType, valueType: stringType })
                        )
                    })
                });
                const generator = new GeneratedQueryParams({
                    queryParameters: [createQueryParameter("metadata", myObjectType)],
                    referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
                });
                const firstStmt = generator.getBuildStatements(mockContext)[0];
                assert(firstStmt != null, "expected at least one statement");
                const text = getTextOfTsNode(firstStmt);
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("passes map<string, MyObject> through untouched when the serde layer is disabled", () => {
                const text = generate("metadata", mapOf(myObjectType), { includeSerdeLayer: false });
                expect(text).not.toContain("jsonOrThrow");
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });

            it("passes map<string, datetime> through untouched when the serde layer is disabled", () => {
                const text = generate("timestamps", mapOf(dateTimeType), { includeSerdeLayer: false });
                expect(text).not.toContain("jsonOrThrow");
                expect(text).not.toContain("toString");
                expect(text).toMatchSnapshot();
            });
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
                    extendedProperties: undefined,
                    deferredUnionBaseProperties: undefined
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

        it("emits Array.isArray ternary for undiscriminated union with allowMultiple: false (no serde)", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_EventTypeParam",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "EventTypeParam",
                    camelCase: { unsafeName: "eventTypeParam", safeName: "eventTypeParam" },
                    snakeCase: { unsafeName: "event_type_param", safeName: "event_type_param" },
                    screamingSnakeCase: { unsafeName: "EVENT_TYPE_PARAM", safeName: "EVENT_TYPE_PARAM" },
                    pascalCase: { unsafeName: "EventTypeParam", safeName: "EventTypeParam" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const queryParams = [createQueryParameter("eventType", namedType)];
            const mockContext = createMockContext({ includeSerdeLayer: false });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), docs: undefined },
                        {
                            type: FernIr.TypeReference.container(
                                FernIr.ContainerType.list(
                                    FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                                )
                            ),
                            docs: undefined
                        }
                    ],
                    baseProperties: undefined
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
            expect(text).toContain("Array.isArray");
            expect(text).toContain(".map");
            expect(text).toMatchSnapshot();
        });

        it("emits Array.isArray ternary for optional<undiscriminated union> with allowMultiple: false (serde)", () => {
            const namedType = FernIr.TypeReference.named({
                typeId: "type_EventTypeParam",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "EventTypeParam",
                    camelCase: { unsafeName: "eventTypeParam", safeName: "eventTypeParam" },
                    snakeCase: { unsafeName: "event_type_param", safeName: "event_type_param" },
                    screamingSnakeCase: { unsafeName: "EVENT_TYPE_PARAM", safeName: "EVENT_TYPE_PARAM" },
                    pascalCase: { unsafeName: "EventTypeParam", safeName: "EventTypeParam" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const optionalNamedType = FernIr.TypeReference.container(FernIr.ContainerType.optional(namedType));
            const queryParams = [createQueryParameter("eventType", optionalNamedType)];
            const mockContext = createMockContext({ includeSerdeLayer: true });
            mockContext.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), docs: undefined },
                        {
                            type: FernIr.TypeReference.container(
                                FernIr.ContainerType.list(
                                    FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                                )
                            ),
                            docs: undefined
                        }
                    ],
                    baseProperties: undefined
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
            expect(text).toContain("Array.isArray");
            expect(text).toContain(".map");
            expect(text).toMatchSnapshot();
        });

        it("emits Array.isArray ternary for alias resolving to an undiscriminated union", () => {
            const aliasNamedType = FernIr.TypeReference.named({
                typeId: "type_EventAlias",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "EventAlias",
                    camelCase: { unsafeName: "eventAlias", safeName: "eventAlias" },
                    snakeCase: { unsafeName: "event_alias", safeName: "event_alias" },
                    screamingSnakeCase: { unsafeName: "EVENT_ALIAS", safeName: "EVENT_ALIAS" },
                    pascalCase: { unsafeName: "EventAlias", safeName: "EventAlias" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const unionNamedType = FernIr.TypeReference.named({
                typeId: "type_EventTypeParam",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: {
                    originalName: "EventTypeParam",
                    camelCase: { unsafeName: "eventTypeParam", safeName: "eventTypeParam" },
                    snakeCase: { unsafeName: "event_type_param", safeName: "event_type_param" },
                    screamingSnakeCase: { unsafeName: "EVENT_TYPE_PARAM", safeName: "EVENT_TYPE_PARAM" },
                    pascalCase: { unsafeName: "EventTypeParam", safeName: "EventTypeParam" }
                },
                displayName: undefined,
                default: undefined,
                inline: undefined
            });
            const queryParams = [createQueryParameter("eventType", aliasNamedType)];
            const mockContext = createMockContext();
            mockContext.type.getTypeDeclaration = (typeRef: FernIr.TypeReference) => {
                if (typeRef.type === "named" && typeRef.typeId === "type_EventAlias") {
                    return {
                        shape: FernIr.Type.alias({
                            aliasOf: unionNamedType,
                            resolvedType: FernIr.ResolvedTypeReference.named({
                                name: unionNamedType,
                                shape: FernIr.ShapeType.UndiscriminatedUnion
                            })
                        })
                    };
                }
                return {
                    shape: FernIr.Type.undiscriminatedUnion({
                        members: [
                            { type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), docs: undefined }
                        ],
                        baseProperties: undefined
                    })
                };
            };

            const generator = new GeneratedQueryParams({
                queryParameters: queryParams,
                referenceToQueryParameterProperty: defaultReferenceToQueryParameterProperty
            });

            const statements = generator.getBuildStatements(mockContext);
            expect(statements).toHaveLength(1);
            const firstStmt = statements[0];
            assert(firstStmt != null, "expected at least one statement");
            const text = getTextOfTsNode(firstStmt);
            expect(text).toContain("Array.isArray");
            expect(text).toMatchSnapshot();
        });
    });
});
