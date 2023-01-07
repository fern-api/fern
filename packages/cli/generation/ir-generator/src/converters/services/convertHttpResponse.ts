import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse } from "@fern-fern/ir-model/http";
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
        type: response != null ? file.parseTypeReference(response) : undefined,
    };
}
