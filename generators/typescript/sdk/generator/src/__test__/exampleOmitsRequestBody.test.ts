import { FernIr } from "@fern-fern/ir-sdk";
import { exampleOmitsRequestBody } from "@fern-typescript/commons";
import { createHttpEndpoint, createNamedTypeReference } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

function endpointWithReferencedBody(required: boolean | undefined): FernIr.HttpEndpoint {
    return createHttpEndpoint({
        requestBody: FernIr.HttpRequestBody.reference({
            requestBodyType: createNamedTypeReference("Body"),
            required,
            contentType: undefined,
            docs: undefined,
            v2Examples: undefined
        })
    });
}

function endpointWithBytesBody(): FernIr.HttpEndpoint {
    return createHttpEndpoint({
        requestBody: FernIr.HttpRequestBody.bytes({
            isOptional: false,
            contentType: undefined,
            docs: undefined,
            v2Examples: undefined
        })
    });
}

const exampleWithoutBody: FernIr.ExampleEndpointCall = {
    id: undefined,
    name: undefined,
    url: "/test",
    rootPathParameters: [],
    servicePathParameters: [],
    endpointPathParameters: [],
    serviceHeaders: [],
    endpointHeaders: [],
    queryParameters: [],
    request: undefined,
    response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
    docs: undefined
};

describe("exampleOmitsRequestBody", () => {
    it("keeps an example for a body no example can carry", () => {
        for (const respectOptionalRequestBody of [false, true]) {
            expect(
                exampleOmitsRequestBody({
                    endpoint: endpointWithBytesBody(),
                    example: exampleWithoutBody,
                    respectOptionalRequestBody
                })
            ).toBe(false);
        }
    });

    it("drops an example missing a body the call requires", () => {
        for (const respectOptionalRequestBody of [false, true]) {
            expect(
                exampleOmitsRequestBody({
                    endpoint: endpointWithReferencedBody(true),
                    example: exampleWithoutBody,
                    respectOptionalRequestBody
                })
            ).toBe(true);
        }
    });

    it("keeps an example whose body the caller may omit", () => {
        expect(
            exampleOmitsRequestBody({
                endpoint: endpointWithReferencedBody(false),
                example: exampleWithoutBody,
                respectOptionalRequestBody: true
            })
        ).toBe(false);
    });

    it("drops an example whose optional body the caller must still pass", () => {
        expect(
            exampleOmitsRequestBody({
                endpoint: endpointWithReferencedBody(false),
                example: exampleWithoutBody,
                respectOptionalRequestBody: false
            })
        ).toBe(true);
    });
});
