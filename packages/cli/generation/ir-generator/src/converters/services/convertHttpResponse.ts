import { HttpResponse, JsonResponse, StreamingResponseChunkType } from "@fern-api/ir-sdk";
import { isRawTextType, parseRawFileType, parseRawTextType, RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getObjectPropertyFromResolvedType } from "./getObjectPropertyFromResolvedType";

export async function convertHttpResponse({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<HttpResponse | undefined> {
    const { response, ["response-stream"]: responseStream } = endpoint;

    if (response != null) {
        const docs = typeof response !== "string" ? response.docs : undefined;
        const responseType = typeof response === "string" ? response : response.type;

        if (parseRawFileType(responseType) != null) {
            return HttpResponse.fileDownload({
                docs
            });
        } else if (parseRawTextType(responseType) != null) {
            return HttpResponse.text({
                docs
            });
        } else {
            return await convertJsonResponse(response, docs, file, typeResolver);
        }
    }

    if (responseStream != null) {
        return HttpResponse.streaming({
            docs: typeof responseStream !== "string" ? responseStream.docs : undefined,
            dataEventType: constructStreamingResponseChunkType(responseStream, file),
            terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined
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

async function convertJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<HttpResponse> {
    const responseBodyType = file.parseTypeReference(response);
    const resolvedType = typeResolver.resolveTypeOrThrow({
        type: typeof response !== "string" ? response.type : response,
        file
    });
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (responseProperty != null) {
        return HttpResponse.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty: await getObjectPropertyFromResolvedType({
                    typeResolver,
                    file,
                    resolvedType,
                    property: responseProperty
                })
            })
        );
    }
    return HttpResponse.json(
        JsonResponse.response({
            docs,
            responseBodyType
        })
    );
}
