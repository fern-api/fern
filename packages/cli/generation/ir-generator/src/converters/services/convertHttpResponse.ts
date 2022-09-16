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
    return {
        docs: typeof response !== "string" ? response?.docs : undefined,
        type: response != null ? file.parseTypeReference(response) : TypeReference.void(),
    };
}
