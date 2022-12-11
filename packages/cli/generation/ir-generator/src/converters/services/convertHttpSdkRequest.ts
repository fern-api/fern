import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import { SdkRequest } from "@fern-fern/ir-model/services/http";
import { size } from "lodash-es";
import { FernFileContext } from "../../FernFileContext";
import { convertReferenceHttpRequestBody } from "./convertHttpRequestBody";

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

    if (typeof request === "string") {
        return SdkRequest.justRequestBody(convertReferenceHttpRequestBody(request, file));
    }

    const { headers = {}, "query-parameters": queryParameters = {}, body } = request;
    if (size(headers) > 0 || size(queryParameters) > 0 || (body != null && isInlineRequestBody(body))) {
        if (request.name == null) {
            throw new Error("Name is missing for request wrapper");
        }
        return SdkRequest.wrapper({
            wrapperName: file.casingsGenerator.generateName(request.name),
        });
    }

    if (body == null) {
        return undefined;
    }

    return SdkRequest.justRequestBody(convertReferenceHttpRequestBody(body, file));
}
