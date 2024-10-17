import { ObjectProperty } from "@fern-api/ir-sdk";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext } from "../../FernFileContext";
import { ResolvedType } from "../../resolvers/ResolvedType";
import { TypeResolver } from "../../resolvers/TypeResolver";
import {
    getObjectPropertyFromObjectSchema,
    getObjectPropertyFromResolvedType
} from "./getObjectPropertyFromResolvedType";
import { isNonInlinedTypeReference, isStringTypeReference } from "../../utils/isNonInlinedTypeReferenceSchema";

export async function getNestedObjectPropertyFromResolvedType({
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
    return getNestedObjectPropertyFromObjectSchema({
        typeResolver,
        file,
        objectSchema,
        propertyComponents
    });
}

export async function getNestedObjectPropertyFromObjectSchema({
    typeResolver,
    file,
    objectSchema,
    propertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
    propertyComponents: string[];
}): Promise<ObjectProperty | undefined> {
    if (propertyComponents.length === 0) {
        return undefined;
    }
    if (propertyComponents.length === 1) {
        return await getObjectPropertyFromObjectSchema({
            typeResolver,
            file,
            objectSchema,
            property: propertyComponents[0] ?? ""
        });
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

export async function getPropertyTypeFromObjectSchema({
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
            if (isNonInlinedTypeReference(propertyType) || isStringTypeReference(propertyType)) {
                properties[propertyKey] = typeof propertyType === "string" ? propertyType : propertyType.type;
            } else {
                // handle else case
            }
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

export function getRequestPropertyComponents(value: string): string[] {
    const trimmed = value.substring("$request.".length);
    return trimmed?.split(".") ?? [];
}

export function getResponsePropertyComponents(value: string): string[] {
    const trimmed = value.substring("$response.".length);
    return trimmed?.split(".") ?? [];
}
