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
        return getCorePageReturnType({ context, pagination });
    }
    return getResponseBodyType({ context, body: response.body });
}

function getCorePageReturnType({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
}): go.Type {
    return go.Type.pointer(
        go.Type.reference(
            context.getPageTypeReference(
                getPageType({ context, pagination }),
                getPaginationValueType({ context, pagination })
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
