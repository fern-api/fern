import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpResponseBody, JsonResponse } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnZeroValue({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.TypeInstantiation | undefined {
    const response = endpoint.response;
    if (response?.body == null) {
        return undefined;
    }
    const pagination = context.getPagination(endpoint);
    if (pagination != null && !context.isPaginationWithRequestBodyEndpoint(endpoint)) {
        return go.TypeInstantiation.nil();
    }
    return getEndpointReturnZeroValueResponseBody({ context, body: response.body });
}

function getEndpointReturnZeroValueResponseBody({
    context,
    body
}: {
    context: SdkGeneratorContext;
    body: HttpResponseBody;
}): go.TypeInstantiation {
    switch (body.type) {
        case "json":
            return getEndpointReturnZeroValueJson({ context, json: body.value });
        case "text":
            return go.TypeInstantiation.string("");
        case "bytes":
        case "streamParameter":
        case "fileDownload":
        case "streaming":
            return go.TypeInstantiation.nil();
        default:
            assertNever(body);
    }
}

function getEndpointReturnZeroValueJson({
    context,
    json
}: {
    context: SdkGeneratorContext;
    json: JsonResponse;
}): go.TypeInstantiation {
    switch (json.type) {
        case "response":
            return context.goZeroValueMapper.convert({ reference: json.responseBodyType });
        case "nestedPropertyAsResponse": {
            const typeReference =
                json.responseProperty != null ? json.responseProperty.valueType : json.responseBodyType;
            return context.goZeroValueMapper.convert({ reference: typeReference });
        }
        default:
            assertNever(json);
    }
}
