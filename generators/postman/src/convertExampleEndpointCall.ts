import {
    ErrorDeclaration,
    ExampleEndpointCall,
    HttpEndpoint,
    HttpService,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { PostmanExampleResponse, PostmanHeader } from "@fern-fern/postman-sdk/api";
import { isEqual, startCase } from "lodash";
import { GeneratedExampleRequest } from "./request/GeneratedExampleRequest";

export function convertExampleEndpointCall({
    authHeaders,
    httpEndpoint,
    httpService,
    example,
    allErrors,
    allTypes
}: {
    authHeaders: PostmanHeader[];
    httpEndpoint: HttpEndpoint;
    httpService: HttpService;
    example: ExampleEndpointCall;
    allErrors: ErrorDeclaration[];
    allTypes: TypeDeclaration[];
}): PostmanExampleResponse {
    const generatedRequest = new GeneratedExampleRequest({
        authHeaders,
        httpEndpoint,
        httpService,
        example,
        allTypes
    }).get();

    return {
        ...getNameAndStatus({ example, allErrors }),
        originalRequest: generatedRequest,
        description:
            httpEndpoint.response?.body?._visit({
                fileDownload: (value) => value.docs,
                json: (value) => value.docs,
                streamParameter: (value) => value.streamResponse.docs,
                streaming: (value) => value.docs,
                text: (value) => value.docs,
                _other: () => undefined
            }) ?? undefined,
        body: example.response._visit({
            ok: (value) => {
                return value._visit({
                    body: (value) => JSON.stringify(value?.jsonExample, undefined, 4),
                    sse: (value) => JSON.stringify(value, undefined, 4),
                    stream: (value) => JSON.stringify(value, undefined, 4), 
                    _other: () => ""
                })
            },
            error: (value) => {
                return (value.body?.jsonExample) != null 
                    ? JSON.stringify(value.body?.jsonExample, undefined, 4)
                    : ""
            },
            _other: () => ""
        }),
        postmanPreviewlanguage: "json"
    };
}

function getNameAndStatus({
    example,
    allErrors
}: {
    example: ExampleEndpointCall;
    allErrors: ErrorDeclaration[];
}): Pick<PostmanExampleResponse, "name" | "status" | "code"> {
    if (example.response.type === "ok") {
        return {
            name: "Success",
            status: "OK",
            code: 200
        };
    } else {
        const errorName = example.response.error;
        const errorDeclaration = allErrors.find((error) => isEqual(error.name, errorName));
        if (errorDeclaration == null) {
            throw new Error("Cannot find error: " + errorName.name.originalName);
        }

        const errorDisplayName = startCase(errorName.name.originalName);
        return {
            name: errorDisplayName,
            status: errorDisplayName,
            code: errorDeclaration.statusCode
        };
    }
}
