import { FernIr } from "@fern-fern/ir-sdk";
import { getExampleEndpointCalls } from "@fern-typescript/commons";
import { createHttpEndpoint } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

function exampleCall({ name, withBody }: { name: string; withBody: boolean }): FernIr.ExampleEndpointCall {
    return {
        id: name,
        name: undefined,
        url: "/test",
        rootPathParameters: [],
        servicePathParameters: [],
        endpointPathParameters: [],
        serviceHeaders: [],
        endpointHeaders: [],
        queryParameters: [],
        request: withBody
            ? FernIr.ExampleRequestBody.reference({
                  jsonExample: { amount: 1.1 },
                  shape: FernIr.ExampleTypeReferenceShape.unknown({ amount: 1.1 })
              })
            : undefined,
        response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined
    };
}

function endpointWithExamples(required: boolean | undefined): FernIr.HttpEndpoint {
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
        }),
        userSpecifiedExamples: [
            { example: exampleCall({ name: "withBody", withBody: true }), codeSamples: undefined },
            { example: exampleCall({ name: "withoutBody", withBody: false }), codeSamples: undefined }
        ]
    });
}

describe("getExampleEndpointCalls", () => {
    it("keeps the example that omits an optional body once the generator opts in", () => {
        expect(getExampleEndpointCalls(endpointWithExamples(false), true).map((example) => example.id)).toEqual([
            "withBody",
            "withoutBody"
        ]);
    });

    it("drops the example that omits the body when the caller must pass one", () => {
        expect(getExampleEndpointCalls(endpointWithExamples(false), false).map((example) => example.id)).toEqual([
            "withBody"
        ]);
        expect(getExampleEndpointCalls(endpointWithExamples(true), true).map((example) => example.id)).toEqual([
            "withBody"
        ]);
    });
});
