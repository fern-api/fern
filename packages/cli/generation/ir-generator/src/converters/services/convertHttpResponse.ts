import { isRawTextType, parseRawFileType, RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse, StreamingResponseChunkType } from "@fern-fern/ir-model/http";
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
        } else {
            return HttpResponse.json({
                docs,
                responseBodyType: file.parseTypeReference(response),
            });
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
