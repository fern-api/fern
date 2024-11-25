import { ObjectProperty, Type } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { ResolvedContainerType, ResolvedType } from "../../resolvers/ResolvedType";
import { assertNever } from "@fern-api/core-utils";

export async function convertObjectTypeDeclaration({
    object,
    file,
    typeResolver
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<Type> {
    return Type.object({
        extends: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        properties: await getObjectPropertiesFromRawObjectSchema(object, file, typeResolver),
        extraProperties: object["extra-properties"] ?? false,
        extendedProperties: undefined,
        inline: object.inline
    });
}

export async function getObjectPropertiesFromRawObjectSchema(
    object: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<ObjectProperty[]> {
    if (object.properties == null) {
        return [];
    }
    return await Promise.all(
        Object.entries(object.properties).map(async ([propertyKey, propertyDefinition]) => {
            const isString = typeof propertyDefinition === "string";
            const typeName = isString ? propertyDefinition : propertyDefinition.type;
            const default_ = isString ? undefined : propertyDefinition.default;
            const validation = isString ? undefined : propertyDefinition.validation;

            const type = typeResolver.resolveNamedType({
                referenceToNamedType: typeName,
                file
            });
            const inline = getInline(type);
            const prop = {
                ...(await convertDeclaration(propertyDefinition)),
                name: file.casingsGenerator.generateNameAndWireValue({
                    wireValue: propertyKey,
                    name: getPropertyName({ propertyKey, property: propertyDefinition }).name
                }),
                valueType: file.parseTypeReference({ type: typeName, default: default_, validation, inline })
            };
            return prop;
        })
    );
}

function getInline(type: ResolvedType | ResolvedContainerType | undefined): boolean | undefined {
    if (type == null) {
        return undefined;
    }
    switch (type._type) {
        case "container":
            return getInline(type.container);
        case "named":
            return type.declaration.inline ?? undefined;
        case "primitive":
            return undefined;
        case "list":
            return undefined;
        case "map":
            return undefined;
        case "optional":
            return getInline(type.itemType);
        case "unknown":
            return undefined;
        case "set":
            return undefined;
        case "literal":
            return undefined;
        default:
            assertNever(type);
    }
}

export function getExtensionsAsList(extensions: string | string[] | undefined): string[] {
    if (extensions == null) {
        return [];
    }
    if (typeof extensions === "string") {
        return [extensions];
    }
    return extensions;
}

export function getPropertyName({
    propertyKey,
    property
}: {
    propertyKey: string;
    property: RawSchemas.ObjectPropertySchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof property !== "string" && property.name != null) {
        return {
            name: property.name,
            wasExplicitlySet: true
        };
    }

    return {
        name: propertyKey,
        wasExplicitlySet: false
    };
}
