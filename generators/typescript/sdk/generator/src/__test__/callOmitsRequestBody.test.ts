import { FernIr } from "@fern-fern/ir-sdk";
import { createHttpEndpoint } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { callOmitsRequestBody } from "../test-generator/TestGenerator.js";

function endpointWithReferencedBody(required: boolean | undefined): FernIr.HttpEndpoint {
    return createHttpEndpoint({
        requestBody: FernIr.HttpRequestBody.reference({
            requestBodyType: FernIr.TypeReference.named({
                name: { originalName: "Body", camelCase: { unsafeName: "body", safeName: "body" } } as FernIr.Name,
                typeId: "type_:Body",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                default: undefined,
                inline: undefined,
                displayName: undefined
            }),
            required,
            contentType: undefined,
            docs: undefined,
            v2Examples: undefined
        })
    });
}

function exampleWithBody(jsonExample: unknown): FernIr.ExampleEndpointCall {
    return {
        id: undefined,
        name: undefined,
        url: "/test",
        rootPathParameters: [],
        servicePathParameters: [],
        endpointPathParameters: [],
        serviceHeaders: [],
        endpointHeaders: [],
        queryParameters: [],
        request: FernIr.ExampleRequestBody.reference({
            jsonExample,
            shape: FernIr.ExampleTypeReferenceShape.unknown(jsonExample)
        }),
        response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined
    };
}

const exampleWithoutBody: FernIr.ExampleEndpointCall = { ...exampleWithBody({}), request: undefined };

describe("callOmitsRequestBody", () => {
    it("omits the body when the caller may skip it and the example carries nothing for it", () => {
        expect(
            callOmitsRequestBody({
                endpoint: endpointWithReferencedBody(false),
                example: exampleWithoutBody,
                respectOptionalRequestBody: true
            })
        ).toBe(true);
        // the importer fills an absent body in as an empty object, which the call drops too
        expect(
            callOmitsRequestBody({
                endpoint: endpointWithReferencedBody(false),
                example: exampleWithBody({}),
                respectOptionalRequestBody: true
            })
        ).toBe(true);
    });

    it("keeps the body when the example provides one", () => {
        expect(
            callOmitsRequestBody({
                endpoint: endpointWithReferencedBody(false),
                example: exampleWithBody({ amount: 1.1 }),
                respectOptionalRequestBody: true
            })
        ).toBe(false);
    });

    it("keeps the body until the generator opts in", () => {
        expect(
            callOmitsRequestBody({
                endpoint: endpointWithReferencedBody(false),
                example: exampleWithoutBody,
                respectOptionalRequestBody: false
            })
        ).toBe(false);
    });

    it("keeps the body for a required body and for one whose requiredness is unstated", () => {
        expect(
            callOmitsRequestBody({
                endpoint: endpointWithReferencedBody(true),
                example: exampleWithoutBody,
                respectOptionalRequestBody: true
            })
        ).toBe(false);
        expect(
            callOmitsRequestBody({
                endpoint: endpointWithReferencedBody(undefined),
                example: exampleWithoutBody,
                respectOptionalRequestBody: true
            })
        ).toBe(false);
    });
});
