import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import { HttpResponseBody, JsonResponse } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getResponseBodyType({
    context,
    body
}: {
    context: SdkGeneratorContext;
    body: HttpResponseBody;
}): go.Type {
    switch (body.type) {
        case "bytes":
            return go.Type.bytes();
        case "streamParameter":
            return go.Type.any();
        case "fileDownload":
            return go.Type.reference(context.getIoReaderTypeReference());
        case "json":
            return getEndpointReturnTypeJson({ context, responseBody: body.value });
        case "streaming":
            return go.Type.pointer(
                go.Type.reference(context.getStreamTypeReference(context.getStreamPayload(body.value)))
            );
        case "text":
            return go.Type.string();
        default:
            assertNever(body);
    }
}

function getEndpointReturnTypeJson({
    context,
    responseBody
}: {
    context: SdkGeneratorContext;
    responseBody: JsonResponse;
}): go.Type {
    switch (responseBody.type) {
        case "response":
            return context.goTypeMapper.convert({ reference: responseBody.responseBodyType });
        case "nestedPropertyAsResponse": {
            const typeReference =
                responseBody.responseProperty != null
                    ? responseBody.responseProperty.valueType
                    : responseBody.responseBodyType;
            return context.goTypeMapper.convert({ reference: typeReference });
        }
        default:
            assertNever(responseBody);
    }
}
