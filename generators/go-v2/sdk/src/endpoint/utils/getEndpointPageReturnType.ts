import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpResponseBody, Pagination, TypeReference } from "@fern-fern/ir-sdk/api";

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

    // Get the response body type (T) - this is the full response type
    // getResponseBodyType already returns the correct type (including pointer if needed)
    const responseType = getResponseBodyType({ context, body: response.body });

    // Get the data type (D) from pagination.results
    // For custom pagination, D should be the full slice type (e.g., []*Type), not just the element type
    // So we don't unwrap the iterable - we convert the full valueType directly
    const dataType = context.goTypeMapper.convert({ reference: pagination.results.property.valueType });

    // Get the link type (L) from the response body type declaration
    const linkType = getLinkTypeFromResponse({ context, responseBody: response.body });

    const customPagerName = context.customConfig.customPagerName ?? "CustomPager";
    return go.Type.pointer(
        go.Type.reference(
            go.typeReference({
                name: customPagerName,
                importPath: context.getCoreImportPath(),
                generics: [responseType, dataType, linkType]
            })
        )
    );
}

function getLinkTypeFromResponse({
    context,
    responseBody
}: {
    context: SdkGeneratorContext;
    responseBody: HttpResponseBody;
}): go.Type {
    // Extract the response body type reference
    let responseTypeReference: TypeReference | undefined;
    if (responseBody.type === "json") {
        if (responseBody.value.type === "response") {
            responseTypeReference = responseBody.value.responseBodyType;
        } else if (responseBody.value.type === "nestedPropertyAsResponse") {
            responseTypeReference =
                responseBody.value.responseProperty?.valueType ?? responseBody.value.responseBodyType;
        }
    }

    if (responseTypeReference == null) {
        throw new Error("Could not extract response type reference for custom pagination");
    }

    // Unwrap optional/nullable to get to the base type
    const baseTypeReference = context.maybeUnwrapOptionalOrNullable(responseTypeReference) ?? responseTypeReference;

    // Get the type declaration
    if (baseTypeReference.type !== "named") {
        throw new Error("Custom pagination response type must be a named type");
    }

    const typeDeclaration = context.getTypeDeclarationOrThrow(baseTypeReference.typeId);
    if (typeDeclaration.shape.type !== "object") {
        throw new Error("Custom pagination response type must be an object type");
    }

    // Get all properties including extended properties
    const allProperties = [...(typeDeclaration.shape.extendedProperties ?? []), ...typeDeclaration.shape.properties];

    // Find the "links" property (case-insensitive, try multiple variations)
    const propertyNames = allProperties.map((p) => p.name.name.originalName);
    const linksProperty =
        allProperties.find((prop) => prop.name.name.originalName.toLowerCase() === "links") ??
        allProperties.find((prop) => prop.name.name.originalName.toLowerCase() === "link") ??
        allProperties.find((prop) => prop.name.name.originalName.toLowerCase() === "_links");

    if (linksProperty == null) {
        const availableProperties = propertyNames.join(", ");
        throw new Error(
            `Custom pagination response type must have a 'links' property. Available properties: ${availableProperties}`
        );
    }

    // Extract the element type from the list/slice
    const linksValueType = linksProperty.valueType;
    const linkElementType = context.maybeUnwrapIterable(linksValueType);

    if (linkElementType == null) {
        throw new Error("Custom pagination 'links' property must be a list/array type");
    }

    // Convert to Go type
    return context.goTypeMapper.convert({ reference: linkElementType });
}
