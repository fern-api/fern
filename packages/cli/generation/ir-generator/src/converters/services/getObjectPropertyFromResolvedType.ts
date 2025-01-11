import { assertNever } from "@fern-api/core-utils";
import { RawSchemas, isRawObjectDefinition } from "@fern-api/fern-definition-schema";
import { ObjectProperty } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { ResolvedType } from "../../resolvers/ResolvedType";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getObjectPropertiesFromRawObjectSchema } from "../type-declarations/convertObjectTypeDeclaration";

export function getObjectPropertyFromResolvedType({
    typeResolver,
    file,
    resolvedType,
    property
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType;
    property: string;
}): ObjectProperty {
    switch (resolvedType._type) {
        case "container":
            if (resolvedType.container._type === "optional") {
                return getObjectPropertyFromResolvedType({
                    typeResolver,
                    file,
                    resolvedType: resolvedType.container.itemType,
                    property
                });
            }
            break;
        case "named":
            if (isRawObjectDefinition(resolvedType.declaration)) {
                return getObjectPropertyFromObjectSchema({
                    typeResolver,
                    file: resolvedType.file,
                    objectSchema: resolvedType.declaration,
                    property
                });
            }
            break;
        case "primitive":
        case "unknown":
            break;
        default:
            assertNever(resolvedType);
    }
    throw new Error("Internal error; response must be an object in order to return a property as a response");
}

export function getObjectPropertyFromObjectSchema({
    typeResolver,
    file,
    objectSchema,
    property
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    objectSchema: RawSchemas.ObjectSchema;
    property: string;
}): ObjectProperty {
    const properties = getAllPropertiesForRawObjectSchema(objectSchema, file, typeResolver);
    const objectProperty = properties[property];
    if (objectProperty == null) {
        throw new Error(`Object does not have a property named ${property}.`);
    }
    return objectProperty;
}

function getAllPropertiesForRawObjectSchema(
    objectSchema: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Record<string, ObjectProperty> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties: Record<string, ObjectProperty> = {};
    for (const extendedType of extendedTypes) {
        const extendedProperties = getAllPropertiesForExtendedType(extendedType, file, typeResolver);
        Object.entries(extendedProperties).map(([propertyKey, objectProperty]) => {
            properties[propertyKey] = objectProperty;
        });
    }

    const objectProperties = getObjectPropertiesFromRawObjectSchema(objectSchema, file);
    objectProperties.forEach((objectProperty) => {
        properties[objectProperty.name.name.originalName] = objectProperty;
    });

    return properties;
}

function getAllPropertiesForExtendedType(
    extendedType: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Record<string, ObjectProperty> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return getAllPropertiesForRawObjectSchema(resolvedType.declaration, file, typeResolver);
    }
    // This should be unreachable; extended types must be named objects.
    throw new Error(`Extended type ${extendedType} must be another named type`);
}
