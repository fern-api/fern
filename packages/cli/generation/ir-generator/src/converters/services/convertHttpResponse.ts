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
        type: type ?? TypeReference.void(),
        typeV2: type,
    };
}
