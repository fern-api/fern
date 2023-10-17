import { isRawTextType, parseRawFileType, parseRawTextType, RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse, JsonResponse, StreamingResponseChunkType } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpResponse({
    endpoint,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
}): HttpResponse | undefined {
    const { response, ["response-stream"]: responseStream } = endpoint;

    if (response != null) {
        const docs = typeof response !== "string" ? response.docs : undefined;
        const responseType = typeof response === "string" ? response : response.type;

        if (parseRawFileType(responseType) != null) {
            return HttpResponse.fileDownload({
                docs,
            });
        } else if (parseRawTextType(responseType) != null) {
            return HttpResponse.text({
                docs,
            });
        } else {
            return convertJsonResponse(response, docs, file);
        }
    }

    if (responseStream != null) {
        return HttpResponse.streaming({
            docs: typeof responseStream !== "string" ? responseStream.docs : undefined,
            dataEventType: constructStreamingResponseChunkType(responseStream, file),
            terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
        });
    }

    return undefined;
}

function constructStreamingResponseChunkType(
    responseStream: RawSchemas.HttpResponseStreamSchema | string,
    file: FernFileContext
): StreamingResponseChunkType {
    const typeReference = typeof responseStream === "string" ? responseStream : responseStream.type;
    if (isRawTextType(typeReference)) {
        return StreamingResponseChunkType.text();
    } else {
        return StreamingResponseChunkType.json(file.parseTypeReference(typeReference));
    }
}

function convertJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext
): HttpResponse {
    const responseBodyType = file.parseTypeReference(response);
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (responseProperty != null) {
        return HttpResponse.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty:
                    responseProperty != null ? file.casingsGenerator.generateName(responseProperty) : undefined,
            })
        );
    }
    return HttpResponse.json(
        JsonResponse.response({
            docs,
            responseBodyType,
        })
    );
}
