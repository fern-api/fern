import { assertNever } from "@fern-api/core-utils";
import {
    HttpEndpoint,
    TypeDeclaration,
    TypeId,
    ExampleEndpointCall,
    HttpService,
    IntermediateRepresentation,
    ExamplePathParameter,
    PathParameter,
    ExampleQueryParameterShape,
    ExampleResponse,
    HttpHeader,
    ExampleHeader,
    ExampleEndpointSuccessResponse,
    ExampleRequestBody
} from "@fern-api/ir-sdk";
import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample";

export declare namespace generateSuccessEndpointExample {
    interface Args {
        ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
        service: HttpService;
        endpoint: HttpEndpoint;
        typeDeclarations: Record<TypeId, TypeDeclaration>;
    }

    interface ParameterGroup<T, K> {
        params: T[];
        add: (example: K) => void;
    }
}

export function generateSuccessEndpointExample({
    ir,
    endpoint,
    service,
    typeDeclarations
}: generateSuccessEndpointExample.Args): ExampleGenerationResult<ExampleEndpointCall> {
    const result: Omit<ExampleEndpointCall, "id" | "url"> = {
        name: undefined,
        endpointHeaders: [],
        endpointPathParameters: [],
        queryParameters: [],
        servicePathParameters: [],
        serviceHeaders: [],
        rootPathParameters: [],
        request: undefined,
        response: ExampleResponse.ok(ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined
    };

    const pathParameterGroups: generateSuccessEndpointExample.ParameterGroup<PathParameter, ExamplePathParameter>[] = [
        {
            params: endpoint.pathParameters,
            add: (example: ExamplePathParameter) => result.endpointPathParameters.push(example)
        },
        {
            params: service.pathParameters,
            add: (example: ExamplePathParameter) => result.servicePathParameters.push(example)
        },
        {
            params: ir.pathParameters,
            add: (example: ExamplePathParameter) => result.rootPathParameters.push(example)
        }
    ];

    for (const group of pathParameterGroups) {
        for (const pathParameter of group.params) {
            const generatedExample = generateTypeReferenceExample({
                fieldName: pathParameter.name.originalName,
                currentDepth: 0,
                maxDepth: 1,
                typeDeclarations,
                typeReference: pathParameter.valueType
            });
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example } = generatedExample;
            group.add({
                name: pathParameter.name,
                value: example
            });
        }
    }

    for (const queryParameter of endpoint.queryParameters) {
        const generatedExample = generateTypeReferenceExample({
            fieldName: queryParameter.name.name.originalName,
            currentDepth: 0,
            maxDepth: 1,
            typeDeclarations,
            typeReference: queryParameter.valueType
        });
        if (generatedExample.type === "failure") {
            return generatedExample;
        }
        const { example } = generatedExample;
        result.queryParameters.push({
            name: queryParameter.name,
            shape: queryParameter.allowMultiple
                ? ExampleQueryParameterShape.exploded()
                : ExampleQueryParameterShape.single(),
            value: example
        });
    }

    const headerGroup: generateSuccessEndpointExample.ParameterGroup<HttpHeader, ExampleHeader>[] = [
        {
            params: endpoint.headers,
            add: (example: ExampleHeader) => result.endpointHeaders.push(example)
        },
        {
            params: service.headers,
            add: (example: ExampleHeader) => result.serviceHeaders.push(example)
        }
    ];

    for (const group of headerGroup) {
        for (const header of group.params) {
            const generatedExample = generateTypeReferenceExample({
                fieldName: header.name.name.originalName,
                currentDepth: 0,
                maxDepth: 1,
                typeDeclarations,
                typeReference: header.valueType
            });
            if (generatedExample.type === "failure") {
                return generatedExample;
            }
            const { example } = generatedExample;
            group.add({
                name: header.name,
                value: example
            });
        }
    }

    if (endpoint.requestBody != null) {
        switch (endpoint.requestBody.type) {
            case "bytes":
                return { type: "failure" };
            case "fileUpload":
                return { type: "failure" };
            case "inlinedRequestBody":
                return { type: "failure" };
            case "reference": {
                const generatedExample = generateTypeReferenceExample({
                    currentDepth: 0,
                    maxDepth: 10,
                    typeDeclarations,
                    typeReference: endpoint.requestBody.requestBodyType
                });
                if (generatedExample.type === "failure") {
                    return generatedExample;
                }
                const { example } = generatedExample;
                result.request = ExampleRequestBody.reference(example);
                break;
            }
            default:
                assertNever(endpoint.requestBody);
        }
    }

    if (endpoint.response?.body != null) {
        switch (endpoint.response.body.type) {
            case "fileDownload":
                return { type: "failure" };
            case "json": {
                const generatedExample = generateTypeReferenceExample({
                    currentDepth: 0,
                    maxDepth: 10,
                    typeDeclarations,
                    typeReference: endpoint.response.body.value.responseBodyType
                });
                if (generatedExample.type === "failure") {
                    return generatedExample;
                }
                const { example } = generatedExample;
                result.response = ExampleResponse.ok(ExampleEndpointSuccessResponse.body(example));
                break;
            }
            case "streamParameter":
                return { type: "failure" };
            case "streaming":
                return { type: "failure" };
            case "text":
                return { type: "failure" };
            default:
                assertNever(endpoint.response.body);
        }
    }

    return {
        type: "success",
        example: {
            id: "",
            url: getUrlForExample(endpoint, result),
            ...result
        },
        jsonExample: undefined // dummmy
    };
}

function getUrlForExample(endpoint: HttpEndpoint, example: Omit<ExampleEndpointCall, "id" | "url">): string {
    const pathParameters: Record<string, string> = {};
    [...example.rootPathParameters, ...example.servicePathParameters, ...example.endpointPathParameters].forEach(
        (examplePathParameter) => {
            const value = examplePathParameter.value.jsonExample;
            const stringValue = typeof value === "string" ? value : JSON.stringify(value);
            pathParameters[examplePathParameter.name.originalName] = stringValue;
        }
    );
    const url =
        endpoint.fullPath.head +
        endpoint.fullPath.parts.map((pathPart) => pathParameters[pathPart.pathParameter] + pathPart.tail).join("");
    return url.startsWith("/") || url === "" ? url : `/${url}`;
}
