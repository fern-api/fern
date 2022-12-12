import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpRequestBody } from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpRequestBody({
    request,
    file,
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
}): HttpRequestBody | undefined {
    if (request == null) {
        return undefined;
    }

    return HttpRequestBody.reference({
        docs: typeof request !== "string" ? request.docs : undefined,
        requestBodyType: file.parseTypeReference(request),
    });
}
