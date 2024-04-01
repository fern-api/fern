import { assertNever } from "@fern-api/core-utils";
import { ObjectProperty, Pagination } from "@fern-api/ir-sdk";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { ResolvedType } from "../../resolvers/ResolvedType";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertQueryParameter } from "./convertQueryParameter";
import { getObjectPropertyFromResolvedType } from "./getObjectPropertyFromResolvedType";

export async function convertPagination({
    typeResolver,
    file,
    endpointSchema
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    endpointSchema: RawSchemas.HttpEndpointSchema;
}): Promise<Pagination | undefined> {
    const endpointPagination =
        typeof endpointSchema.pagination === "boolean" ? file.rootApiFile.pagination : endpointSchema.pagination;
    if (!endpointPagination) {
        return undefined;
    }
    const paginationPropertyComponents = getPaginationPropertyComponents(endpointPagination);
    switch (paginationPropertyComponents.type) {
        case "cursor":
            return await convertCursorPagination({
                typeResolver,
                file,
                endpointSchema,
                paginationPropertyComponents
            });
        case "offset":
            return convertOffsetPagination({
                typeResolver,
                file,
                endpointSchema,
                paginationPropertyComponents
            });
        default:
            assertNever(paginationPropertyComponents);
    }
}

async function convertCursorPagination({
    typeResolver,
    file,
    endpointSchema,
    paginationPropertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    endpointSchema: RawSchemas.HttpEndpointSchema;
    paginationPropertyComponents: CursorPaginationPropertyComponents;
}): Promise<Pagination | undefined> {
    const queryParameterSchema =
        typeof endpointSchema.request !== "string" && endpointSchema.request?.["query-parameters"] != null
            ? endpointSchema?.request?.["query-parameters"]?.[paginationPropertyComponents.cursor]
            : undefined;
    if (queryParameterSchema == null) {
        return undefined;
    }
    const resolvedResponseType = resolveResponseType({
        typeResolver,
        file,
        endpoint: endpointSchema
    });
    const nextCursorObjectProperty = await getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
        resolvedType: resolvedResponseType,
        propertyComponents: paginationPropertyComponents.next_cursor
    });
    if (nextCursorObjectProperty == null) {
        return undefined;
    }
    const resultsObjectProperty = await getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
        resolvedType: resolvedResponseType,
        propertyComponents: paginationPropertyComponents.results
    });
    if (resultsObjectProperty == null) {
        return undefined;
    }
    return Pagination.cursor({
        page: await convertQueryParameter({
            file,
            queryParameterKey: paginationPropertyComponents.cursor,
            queryParameter: queryParameterSchema
        }),
        next: {
            propertyPath: paginationPropertyComponents.next_cursor.map((property) =>
                file.casingsGenerator.generateName(property)
            ),
            property: nextCursorObjectProperty
        },
        results: {
            propertyPath: paginationPropertyComponents.results.map((property) =>
                file.casingsGenerator.generateName(property)
            ),
            property: resultsObjectProperty
        }
    });
}

async function convertOffsetPagination({
    typeResolver,
    file,
    endpointSchema,
    paginationPropertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    endpointSchema: RawSchemas.HttpEndpointSchema;
    paginationPropertyComponents: OffsetPaginationPropertyComponents;
}): Promise<Pagination | undefined> {
    const queryParameterSchema =
        typeof endpointSchema.request !== "string" && endpointSchema.request?.["query-parameters"] != null
            ? endpointSchema?.request?.["query-parameters"]?.[paginationPropertyComponents.offset]
            : undefined;
    if (queryParameterSchema == null) {
        return undefined;
    }
    const resolvedResponseType = resolveResponseType({
        typeResolver,
        file,
        endpoint: endpointSchema
    });
    const resultsObjectProperty = await getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
        resolvedType: resolvedResponseType,
        propertyComponents: paginationPropertyComponents.results
    });
    if (resultsObjectProperty == null) {
        return undefined;
    }
    return Pagination.offset({
        page: await convertQueryParameter({
            file,
            queryParameterKey: paginationPropertyComponents.offset,
            queryParameter: queryParameterSchema
        }),
        results: {
            propertyPath: paginationPropertyComponents.results.map((property) =>
                file.casingsGenerator.generateName(property)
            ),
            property: resultsObjectProperty
        }
    });
}

async function getNestedObjectPropertyFromResolvedType({
    typeResolver,
    file,
    resolvedType,
    propertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType;
    propertyComponents: string[];
}): Promise<ObjectProperty | undefined> {
    if (propertyComponents.length === 0) {
        return undefined;
    }
    if (propertyComponents.length === 1) {
        return await getObjectPropertyFromResolvedType({
            typeResolver,
            file,
            resolvedType,
            property: propertyComponents[0] ?? ""
        });
    }
    const objectSchema = maybeObjectSchema(resolvedType);
    if (objectSchema == null) {
        return undefined;
    }
    const propertyType = await getPropertyTypeFromObjectSchema({
        typeResolver,
        file,
        objectSchema,
        property: propertyComponents[0] ?? ""
    });
    const resolvedTypeProperty = typeResolver.resolveTypeOrThrow({
        type: propertyType,
        file
    });
    return getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedTypeProperty) ?? file,
        resolvedType: resolvedTypeProperty,
        propertyComponents: propertyComponents.slice(1)
    });
}

async function getPropertyTypeFromObjectSchema({
    typeResolver,
    file,
    objectSchema,
    property
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
    property: string;
}): Promise<string> {
    const properties = await getAllPropertiesForRawObjectSchema({
        typeResolver,
        file,
        objectSchema
    });
    const propertyType = properties[property];
    if (propertyType == null) {
        throw new Error(`Response does not have a property named ${property}.`);
    }
    return propertyType;
}

async function getAllPropertiesForRawObjectSchema({
    typeResolver,
    file,
    objectSchema
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
}): Promise<Record<string, string>> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties: Record<string, string> = {};
    for (const extendedType of extendedTypes) {
        const extendedProperties = await getAllPropertiesForExtendedType({
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

async function getAllPropertiesForExtendedType({
    typeResolver,
    file,
    extendedType
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    extendedType: string;
}): Promise<Record<string, string>> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return await getAllPropertiesForRawObjectSchema({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            objectSchema: resolvedType.declaration
        });
    }
    // This should be unreachable; extended types must be named objects.
    throw new Error(`Extended type ${extendedType} must be another named type.`);
}

function resolveResponseType({
    endpoint,
    typeResolver,
    file
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ResolvedType {
    return typeResolver.resolveTypeOrThrow({
        type: (typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response) ?? "",
        file
    });
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

function maybeFileFromResolvedType(resolvedType: ResolvedType | undefined): FernFileContext | undefined {
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

type PaginationPropertyComponents = CursorPaginationPropertyComponents | OffsetPaginationPropertyComponents;

interface CursorPaginationPropertyComponents {
    type: "cursor";
    cursor: string;
    next_cursor: string[];
    results: string[];
}

interface OffsetPaginationPropertyComponents {
    type: "offset";
    offset: string;
    results: string[];
}

function getPaginationPropertyComponents(
    endpointPagination: RawSchemas.PaginationSchema
): PaginationPropertyComponents {
    if (isRawOffsetPaginationSchema(endpointPagination)) {
        return {
            type: "offset",
            offset: getRequestProperty(endpointPagination.offset),
            results: getResponsePropertyComponents(endpointPagination.results)
        };
    }
    return {
        type: "cursor",
        cursor: getRequestProperty(endpointPagination.cursor),
        next_cursor: getResponsePropertyComponents(endpointPagination.next_cursor),
        results: getResponsePropertyComponents(endpointPagination.results)
    };
}

function getRequestProperty(value: string): string {
    return value.substring("$request.".length);
}

function getResponsePropertyComponents(value: string): string[] {
    const trimmed = value.substring("$response.".length);
    return trimmed?.split(".") ?? [];
}

function isRawOffsetPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.OffsetPaginationSchema {
    return (
        (rawPaginationSchema as RawSchemas.OffsetPaginationSchema).offset != null &&
        (rawPaginationSchema as RawSchemas.OffsetPaginationSchema).results != null
    );
}
