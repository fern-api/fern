import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ExampleEndpointCall, HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { PostmanExampleResponse, PostmanHeader } from "@fern-fern/postman-sdk/resources";
import { isEqual } from "lodash";
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
        ...getNameAndStatus({ example, httpEndpoint, allErrors }),
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
    httpEndpoint,
    allErrors,
}: {
    example: ExampleEndpointCall;
    httpEndpoint: HttpEndpoint;
    allErrors: ErrorDeclaration[];
}): Pick<PostmanExampleResponse, "name" | "status" | "code"> {
    if (example.response.type === "ok") {
        return {
            name: `Successful ${httpEndpoint.id}`,
            status: "OK",
            code: 200,
        };
    } else {
        const errorName = example.response.error;
        const errorDeclaration = allErrors.find((error) => isEqual(error.name, errorName));
        if (errorDeclaration == null) {
            throw new Error("Cannot find error: " + errorName.nameV3.unsafeName.originalValue);
        }

        const errorDisplayName = errorName.nameV3.unsafeName.originalValue;
        return {
            name: `Failed ${httpEndpoint.id} (${errorDisplayName})`,
            status: errorDisplayName,
            code: errorDeclaration.statusCode,
        };
    }
}
