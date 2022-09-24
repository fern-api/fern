import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpResponse({
    response,
    file,
}: {
    response: RawSchemas.HttpResponseSchema | undefined;
    file: FernFileContext;
}): HttpResponse {
    const type = response != null ? file.parseTypeReference(response) : undefined;

    return {
        docs: typeof response !== "string" ? response?.docs : undefined,
        // this is a semantic break! once all the generators are not using
        // HttpResponse (which is deprecated), we an delete endpoint.response
        // from the IR.
        type: type ?? TypeReference.unknown(),
        typeV2: type,
    };
}
