import { RawSchemas, isInlineRequestBody, isRawObjectDefinition } from "@fern-api/fern-definition-schema";
import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { PrimitiveTypeV1 } from "@fern-api/ir-sdk";

export const REQUEST_PREFIX = "$request.";
export const RESPONSE_PREFIX = "$response.";

export interface RequestPropertyValidator {
    propertyID: string;
    validate: RequestPropertyValidatorFunc;
}

export type RequestPropertyValidatorFunc = ({ resolvedType }: { resolvedType: ResolvedType | undefined }) => boolean;

export interface ResponsePropertyValidator {
    propertyID: string;
    validate: ResponsePropertyValidatorFunc;
}

export type ResponsePropertyValidatorFunc = ({
    typeResolver,
    file,
    resolvedType,
    propertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType | undefined;
    propertyComponents: string[];
}) => boolean;

export function requestTypeHasProperty({
    typeResolver,
    file,
    endpoint,
    propertyComponents,
    validate
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    endpoint: RawSchemas.HttpEndpointSchema;
    propertyComponents: string[];
    validate: RequestPropertyValidatorFunc;
}): boolean {
    if (endpoint.request == null) {
        return false;
    }
    if (typeof endpoint.request === "string") {
        const resolvedType = typeResolver.resolveType({
            type: endpoint.request,
            file
        });
        return resolvedTypeHasProperty({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            resolvedType,
            propertyComponents,
            validate
        });
    }
    return inlinedRequestTypeHasProperty({
        typeResolver,
        file,
        requestType: endpoint.request,
        propertyComponents,
        validate
    });
}

function inlinedRequestTypeHasProperty({
    typeResolver,
    file,
    requestType,
    propertyComponents,
    validate
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    requestType: RawSchemas.HttpRequestSchema;
    propertyComponents: string[];
    validate: RequestPropertyValidatorFunc;
}): boolean {
    if (
        isQueryParameterProperty({
            typeResolver,
            file,
            requestType,
            propertyComponents,
            validate
        })
    ) {
        return true;
    }
    if (requestType.body == null) {
        return false;
    }
    if (typeof requestType.body === "string") {
        const resolvedType = typeResolver.resolveType({
            type: requestType.body,
            file
        });
        return resolvedTypeHasProperty({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            resolvedType,
            propertyComponents,
            validate
        });
    }
    if (isInlineRequestBody(requestType.body)) {
        return objectSchemaHasProperty({
            typeResolver,
            file,
            objectSchema: requestType.body,
            propertyComponents,
            validate
        });
    }
    const resolvedType = typeResolver.resolveType({
        type: requestType.body.type,
        file
    });
    return resolvedTypeHasProperty({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedType) ?? file,
        resolvedType: typeResolver.resolveType({
            type: requestType.body.type,
            file
        }),
        propertyComponents,
        validate
    });
}

export function isQueryParameterProperty({
    typeResolver,
    file,
    requestType,
    propertyComponents,
    validate
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    requestType: RawSchemas.HttpRequestSchema;
    propertyComponents: string[];
    validate: RequestPropertyValidatorFunc;
}): boolean {
    if (propertyComponents.length !== 1 || typeof requestType === "string" || requestType["query-parameters"] == null) {
        return false;
    }
    const queryParameter = requestType["query-parameters"][propertyComponents[0] ?? ""];
    if (queryParameter == null) {
        return false;
    }
    const resolvedQueryParameterType = typeResolver.resolveType({
        type: typeof queryParameter !== "string" ? queryParameter.type : queryParameter,
        file
    });
    return validate({
        resolvedType: resolvedQueryParameterType
    });
}

export function resolvedTypeHasProperty({
    typeResolver,
    file,
    resolvedType,
    propertyComponents,
    validate
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType | undefined;
    propertyComponents: string[];
    validate: RequestPropertyValidatorFunc;
}): boolean {
    if (propertyComponents.length === 0) {
        return validate({ resolvedType });
    }
    const objectSchema = maybeObjectSchema(resolvedType);
    if (objectSchema == null) {
        return false;
    }
    return objectSchemaHasProperty({
        typeResolver,
        file,
        objectSchema,
        propertyComponents,
        validate
    });
}

export function resolveResponseType({
    endpoint,
    typeResolver,
    file
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ResolvedType | undefined {
    const responseType = typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response;
    if (responseType == null) {
        return undefined;
    }
    return typeResolver.resolveType({
        type: responseType,
        file
    });
}

export function maybePrimitiveType(resolvedType: ResolvedType | undefined): PrimitiveTypeV1 | undefined {
    if (resolvedType?._type === "primitive") {
        return resolvedType.primitive.v1;
    }
    if (resolvedType?._type === "container" && resolvedType.container._type === "optional") {
        return maybePrimitiveType(resolvedType.container.itemType);
    }
    return undefined;
}

export function maybeFileFromResolvedType(resolvedType: ResolvedType | undefined): FernFileContext | undefined {
    if (resolvedType == null) {
        return undefined;
    }
    if (resolvedType._type === "named") {
        return resolvedType.file;
    }
    if (resolvedType._type === "container" && resolvedType.container._type === "optional") {
        return maybeFileFromResolvedType(resolvedType.container.itemType);
    }
    return undefined;
}

export function getRequestPropertyComponents(value: string): string[] | undefined {
    const trimmed = trimPrefix(value, REQUEST_PREFIX);
    return trimmed?.split(".");
}

export function getResponsePropertyComponents(value: string): string[] | undefined {
    const trimmed = trimPrefix(value, RESPONSE_PREFIX);
    return trimmed?.split(".");
}

function objectSchemaHasProperty({
    typeResolver,
    file,
    objectSchema,
    propertyComponents,
    validate
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
    propertyComponents: string[];
    validate: RequestPropertyValidatorFunc;
}): boolean {
    const property = getPropertyTypeFromObjectSchema({
        typeResolver,
        file,
        objectSchema,
        property: propertyComponents[0] ?? ""
    });
    if (property == null) {
        return false;
    }
    const resolvedTypeProperty = typeResolver.resolveType({
        type: property,
        file
    });
    return resolvedTypeHasProperty({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedTypeProperty) ?? file,
        resolvedType: resolvedTypeProperty,
        propertyComponents: propertyComponents.slice(1),
        validate
    });
}

function getPropertyTypeFromObjectSchema({
    typeResolver,
    file,
    objectSchema,
    property
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
    property: string;
}): string | undefined {
    const properties = getAllPropertiesForRawObjectSchema({
        typeResolver,
        file,
        objectSchema
    });
    return properties[property];
}

function getAllPropertiesForRawObjectSchema({
    typeResolver,
    file,
    objectSchema
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
}): Record<string, string> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties: Record<string, string> = {};
    for (const extendedType of extendedTypes) {
        const extendedProperties = getAllPropertiesForExtendedType({
            typeResolver,
            file,
            extendedType
        });
        Object.entries(extendedProperties).map(([propertyKey, propertyType]) => {
            properties[propertyKey] = propertyType;
        });
    }

    if (objectSchema.properties != null) {
        Object.entries(objectSchema.properties).map(([propertyKey, propertyType]) => {
            properties[propertyKey] = typeof propertyType === "string" ? propertyType : propertyType.type;
        });
    }

    return properties;
}

function getAllPropertiesForExtendedType({
    typeResolver,
    file,
    extendedType
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    extendedType: string;
}): Record<string, string> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return getAllPropertiesForRawObjectSchema({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            objectSchema: resolvedType.declaration
        });
    }
    return {};
}

function maybeObjectSchema(resolvedType: ResolvedType | undefined): RawSchemas.ObjectSchema | undefined {
    if (resolvedType == null) {
        return undefined;
    }
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return resolvedType.declaration;
    }
    if (resolvedType._type === "container" && resolvedType.container._type === "optional") {
        return maybeObjectSchema(resolvedType.container.itemType);
    }
    return undefined;
}

function trimPrefix(value: string, prefix: string): string | null {
    if (value.startsWith(prefix)) {
        return value.substring(prefix.length);
    }
    return null;
}
