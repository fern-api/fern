import { RawSchemas, isInlineRequestBody } from "@fern-api/fern-definition-schema";
import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import { getAllPropertiesForRawObjectSchema, validatePropertyInType } from "./validatePropertyInType";

export declare namespace ValidatePropertyInRequest {
    interface Args {
        /* the path to the property */
        path: string[];
        typeResolver: TypeResolver;
        file: FernFileContext;
        request: RawSchemas.HttpRequestSchema;
        validate: ({ resolvedType }: { resolvedType: ResolvedType | undefined }) => RuleViolation[];
    }
}

export function validatePropertyInRequest({
    path,
    typeResolver,
    file,
    request,
    validate
}: ValidatePropertyInRequest.Args): RuleViolation[] {
    if (request == null) {
        return validate({ resolvedType: undefined });
    }

    // referenced request
    if (typeof request === "string") {
        const resolvedType = typeResolver.resolveType({
            type: request,
            file
        });
        return validatePropertyInType({
            path,
            typeResolver,
            file,
            validate,
            resolvedType
        });
    }

    const firstComponent = path[0];
    if (firstComponent == null) {
        return validate({ resolvedType: undefined });
    }

    // inlined query param
    const queryParam = request["query-parameters"]?.[firstComponent];
    if (queryParam != null) {
        const resolvedQueryParamType = typeResolver.resolveType({
            type: getTypeFromTypeReference(queryParam),
            file
        });
        return validatePropertyInType({ path, typeResolver, file, resolvedType: resolvedQueryParamType, validate });
    }

    if (request.body == null) {
        return validate({ resolvedType: undefined });
    }

    // inlined request
    if (isInlineRequestBody(request.body)) {
        const properties = getAllPropertiesForRawObjectSchema({
            typeResolver,
            file,
            objectSchema: request.body
        });
        const propertyTypeReference = properties[firstComponent];
        if (propertyTypeReference == null) {
            return validate({ resolvedType: undefined });
        }
        const resolvedBodyPropertyType = typeResolver.resolveType({
            type: getTypeFromTypeReference(propertyTypeReference),
            file
        });
        return validatePropertyInType({ path, typeResolver, file, resolvedType: resolvedBodyPropertyType, validate });
    }

    // referenced request
    const resolvedBodyPropertyType = typeResolver.resolveType({
        type: getTypeFromTypeReference(request.body),
        file
    });
    return validatePropertyInType({ path, typeResolver, file, resolvedType: resolvedBodyPropertyType, validate });
}

function getTypeFromTypeReference(typeReference: RawSchemas.TypeReferenceSchema): string {
    if (typeof typeReference === "string") {
        return typeReference;
    }
    return typeReference.type;
}
