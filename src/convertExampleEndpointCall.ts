import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ExampleEndpointCall, HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { PostmanExampleResponse, PostmanHeader } from "@fern-fern/postman-sdk/api";
import { isEqual, startCase } from "lodash";
import { GeneratedExampleRequest } from "./request/GeneratedExampleRequest";

export function convertExampleEndpointCall({
    authHeaders,
    httpEndpoint,
    httpService,
    example,
    allErrors,
    allTypes,
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
        allTypes,
    }).get();

    return {
        ...getNameAndStatus({ example, allErrors }),
        originalRequest: generatedRequest,
        description: httpEndpoint.response.docs ?? undefined,
        body:
            example.response.body?.jsonExample != null
                ? JSON.stringify(example.response.body.jsonExample, undefined, 4)
                : "",
        postmanPreviewlanguage: "json",
    };
}

function getNameAndStatus({
    example,
    allErrors,
}: {
    example: ExampleEndpointCall;
    allErrors: ErrorDeclaration[];
}): Pick<PostmanExampleResponse, "name" | "status" | "code"> {
    if (example.response.type === "ok") {
        return {
            name: "Success",
            status: "OK",
            code: 200,
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
            code: errorDeclaration.statusCode,
        };
    }
}
