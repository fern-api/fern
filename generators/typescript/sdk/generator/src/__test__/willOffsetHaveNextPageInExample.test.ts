import { FernIr } from "@fern-fern/ir-sdk";
import { createNameAndWireValue, createObjectProperty } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { willOffsetHaveNextPageInExample } from "../test-generator/TestGenerator.js";

const INTEGER = FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined });
const BOOLEAN = FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined });

function createResponseProperty(name: string, valueType: FernIr.TypeReference): FernIr.ResponseProperty {
    return { propertyPath: undefined, property: createObjectProperty(name, valueType) };
}

function createQueryRequestProperty(name: string): FernIr.RequestProperty {
    return {
        propertyPath: undefined,
        property: FernIr.RequestPropertyValue.query({
            name: createNameAndWireValue(name),
            valueType: INTEGER,
            allowMultiple: false,
            availability: undefined,
            docs: undefined,
            v2Examples: undefined,
            clientDefault: undefined,
            defaultValue: undefined,
            explode: undefined
        })
    };
}

function createQueryParameterExample(name: string, jsonExample: unknown): FernIr.ExampleQueryParameter {
    return {
        name: createNameAndWireValue(name),
        value: {
            jsonExample,
            shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.integer(0))
        },
        shape: undefined
    };
}

function createPagination({
    step,
    hasNextPage
}: {
    step?: FernIr.RequestProperty;
    hasNextPage?: FernIr.ResponseProperty;
} = {}): FernIr.OffsetPagination {
    return {
        page: createQueryRequestProperty("offset"),
        results: createResponseProperty("data", INTEGER),
        hasNextPage,
        step
    };
}

const EXAMPLE_WITH_LIMIT_10: FernIr.ExampleEndpointCall["queryParameters"] = [createQueryParameterExample("limit", 10)];

describe("willOffsetHaveNextPageInExample", () => {
    it("has a next page when the response fills the requested step", () => {
        expect(
            willOffsetHaveNextPageInExample({
                example: { queryParameters: EXAMPLE_WITH_LIMIT_10, request: undefined },
                pagination: createPagination({ step: createQueryRequestProperty("limit") }),
                responseJson: { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
            })
        ).toBe(true);
    });

    it("has no next page when the response returns fewer items than the requested step", () => {
        expect(
            willOffsetHaveNextPageInExample({
                example: { queryParameters: EXAMPLE_WITH_LIMIT_10, request: undefined },
                pagination: createPagination({ step: createQueryRequestProperty("limit") }),
                responseJson: { data: [1, 2] }
            })
        ).toBe(false);
    });

    it("ignores the step when the example does not provide one", () => {
        expect(
            willOffsetHaveNextPageInExample({
                example: { queryParameters: [], request: undefined },
                pagination: createPagination({ step: createQueryRequestProperty("limit") }),
                responseJson: { data: [1, 2] }
            })
        ).toBe(true);
    });

    it("has no next page when the results are empty or missing", () => {
        const pagination = createPagination();
        const example = { queryParameters: [], request: undefined };
        expect(willOffsetHaveNextPageInExample({ example, pagination, responseJson: { data: [] } })).toBe(false);
        expect(willOffsetHaveNextPageInExample({ example, pagination, responseJson: {} })).toBe(false);
    });

    it("prefers the response's hasNextPage property over the items check", () => {
        const pagination = createPagination({
            step: createQueryRequestProperty("limit"),
            hasNextPage: createResponseProperty("has_next_page", BOOLEAN)
        });
        const example = { queryParameters: EXAMPLE_WITH_LIMIT_10, request: undefined };
        expect(
            willOffsetHaveNextPageInExample({
                example,
                pagination,
                responseJson: { has_next_page: true, data: [1, 2] }
            })
        ).toBe(true);
        expect(
            willOffsetHaveNextPageInExample({
                example,
                pagination,
                responseJson: { has_next_page: false, data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
            })
        ).toBe(false);
    });

    it("falls back to the items check when hasNextPage is absent from the response", () => {
        expect(
            willOffsetHaveNextPageInExample({
                example: { queryParameters: EXAMPLE_WITH_LIMIT_10, request: undefined },
                pagination: createPagination({
                    step: createQueryRequestProperty("limit"),
                    hasNextPage: createResponseProperty("has_next_page", BOOLEAN)
                }),
                responseJson: { data: [1, 2] }
            })
        ).toBe(false);
    });

    it("reads the step from a request body property", () => {
        expect(
            willOffsetHaveNextPageInExample({
                example: {
                    queryParameters: [],
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        jsonExample: { limit: 10 },
                        properties: [],
                        extraProperties: undefined
                    })
                },
                pagination: createPagination({
                    step: {
                        propertyPath: undefined,
                        property: FernIr.RequestPropertyValue.body(createObjectProperty("limit", INTEGER))
                    }
                }),
                responseJson: { data: [1, 2] }
            })
        ).toBe(false);
    });
});
