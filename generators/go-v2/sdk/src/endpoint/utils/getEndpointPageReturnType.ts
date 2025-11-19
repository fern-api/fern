import { go } from "@fern-api/go-ast";

import { HttpEndpoint, Pagination } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getPageType } from "./getPaginationInfo";
import { getResponseBodyType } from "./getResponseBodyType";

export function getEndpointPageReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): go.Type | undefined {
    const response = endpoint.response;
    if (response?.body == null) {
        return undefined;
    }
    const pagination = context.getPagination(endpoint);
    if (pagination != null && !context.isPaginationWithRequestBodyEndpoint(endpoint)) {
        const responseType = getResponseBodyType({ context, body: response.body });
        // Check if this is custom pagination
        if (pagination.type === "custom" && context.customConfig.customPagerName != null) {
            return getCustomPagerReturnType({ context, endpoint, pagination });
        }
        return getCorePageReturnType({ context, pagination, responseType });
    }
    return getResponseBodyType({ context, body: response.body });
}

function getCorePageReturnType({
    context,
    pagination,
    responseType
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    responseType: go.Type;
}): go.Type {
    return go.Type.pointer(
        go.Type.reference(
            context.getPageTypeReference(
                getPageType({ context, pagination }),
                getPaginationValueType({ context, pagination }),
                responseType
            )
        )
    );
}

function getPaginationValueType({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
}): go.Type {
    const iterableType = context.maybeUnwrapIterable(pagination.results.property.valueType);
    if (iterableType != null) {
        return context.goTypeMapper.convert({ reference: iterableType });
    }
    return context.goTypeMapper.convert({ reference: pagination.results.property.valueType });
}

function getCustomPagerReturnType({
    context,
    endpoint,
    pagination
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
    pagination: Pagination;
}): go.Type {
    const response = endpoint.response;
    if (response?.body == null) {
        throw new Error("Custom pagination endpoint must have a response body");
    }
    const responseBodyType = getResponseBodyType({ context, body: response.body });
    const customPagerName = context.customConfig.customPagerName ?? "CustomPager";
    return go.Type.pointer(
        go.Type.reference(
            go.typeReference({
                name: customPagerName,
                importPath: context.getCoreImportPath(),
                generics: [go.Type.pointer(responseBodyType)]
            })
        )
    );
}
