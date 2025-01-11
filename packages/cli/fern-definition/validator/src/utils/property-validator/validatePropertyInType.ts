import { RawSchemas, isRawObjectDefinition } from "@fern-api/fern-definition-schema";
import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";

export declare namespace ValidatePropertyInType {
    interface Args {
        /* the path to the property */
        path: string[];
        typeResolver: TypeResolver;
        file: FernFileContext;
        resolvedType: ResolvedType | undefined;
        validate: ({ resolvedType }: { resolvedType: ResolvedType | undefined }) => RuleViolation[];
    }
}

export function validatePropertyInType({
    path,
    typeResolver,
    file,
    resolvedType,
    validate
}: ValidatePropertyInType.Args): RuleViolation[] {
    let type = resolvedType;
    for (const property of path) {
        if (type == null) {
            return validate({ resolvedType: undefined });
        }
        const maybeObject = getMaybeObject(type);
        if (maybeObject == null) {
            return validate({ resolvedType: undefined });
        }
        const properties = getAllPropertiesForRawObjectSchema({
            typeResolver,
            file,
            objectSchema: maybeObject
        });
        const propertyTypeReference = properties[property];
        if (propertyTypeReference == null) {
            return validate({ resolvedType: undefined });
        }
        type = typeResolver.resolveType({
            type: propertyTypeReference,
            file
        });
    }
    return validate({ resolvedType: type });
}

export function getAllPropertiesForRawObjectSchema({
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

function getMaybeObject(resolvedType: ResolvedType | undefined): RawSchemas.ObjectSchema | undefined {
    if (resolvedType == null) {
        return undefined;
    }
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return resolvedType.declaration;
    }
    if (resolvedType._type === "container" && resolvedType.container._type === "optional") {
        return getMaybeObject(resolvedType.container.itemType);
    }
    return undefined;
}
