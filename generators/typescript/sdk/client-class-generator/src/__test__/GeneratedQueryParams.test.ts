import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { createMockTypeContext, createMockTypeSchemaContext, createQueryParameter } from "@fern-typescript/test-utils";
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
        typeSchema: createMockTypeSchemaContext({ useSerializerPrefix: true })
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
