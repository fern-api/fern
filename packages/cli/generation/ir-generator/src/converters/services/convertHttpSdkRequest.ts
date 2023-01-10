import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import { SdkRequest, SdkRequestShape } from "@fern-fern/ir-model/http";
import { size } from "lodash-es";
import { FernFileContext } from "../../FernFileContext";
import { convertReferenceHttpRequestBody } from "./convertHttpRequestBody";

export const DEFAULT_REQUEST_PARAMETER_NAME = "request";
export const DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER = "body";

export function convertHttpSdkRequest({
    request,
    file,
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
}): SdkRequest | undefined {
    const shape = convertHttpSdkRequestShape({ request, file });
    if (shape == null) {
        return undefined;
    }
    return {
        shape,
        requestParameterName: file.casingsGenerator.generateName(DEFAULT_REQUEST_PARAMETER_NAME),
    };
}

function convertHttpSdkRequestShape({
    request,
    file,
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
}): SdkRequestShape | undefined {
    if (request == null) {
        return undefined;
    }

    if (typeof request === "string") {
        return SdkRequestShape.justRequestBody(convertReferenceHttpRequestBody(request, file));
    }

    const { headers = {}, "query-parameters": queryParameters = {}, body } = request;
    if (size(headers) > 0 || size(queryParameters) > 0 || (body != null && isInlineRequestBody(body))) {
        if (request.name == null) {
            throw new Error("Name is missing for request wrapper");
        }
        return SdkRequestShape.wrapper({
            wrapperName: file.casingsGenerator.generateName(request.name),
            bodyKey: file.casingsGenerator.generateName(DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER),
        });
    }

    if (body == null) {
        return undefined;
    }

    return SdkRequestShape.justRequestBody(convertReferenceHttpRequestBody(body, file));
}
