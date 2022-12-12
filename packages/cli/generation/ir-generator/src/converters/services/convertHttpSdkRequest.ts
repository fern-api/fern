import { RawSchemas } from "@fern-api/yaml-schema";
import { SdkRequest } from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpSdkRequest({
    request,
    file,
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
}): SdkRequest | undefined {
    if (request == null) {
        return undefined;
    }

    return SdkRequest.justRequestBody({
        docs: typeof request !== "string" ? request.docs : undefined,
        requestBodyType: file.parseTypeReference(request),
    });
}
