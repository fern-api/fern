import { constructFernFileContext, FernFileContext, TypeResolver, TypeResolverImpl } from "@fern-api/ir-generator";
import { parseRawFileType, parseRawTextType, RawSchemas } from "@fern-api/yaml-schema";
import { TypeReference } from "@fern-fern/ir-sdk/api";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoResponsePropertyRule: Rule = {
    name: "no-response-property",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }, { relativeFilepath, contents }) => {
                    const { response } = endpoint;
                    if (response == null) {
                        return [];
                    }
                    const responseType = typeof response === "string" ? response : response.type;
                    if (parseRawFileType(responseType) != null) {
                        return [];
                    } else if (parseRawTextType(responseType) != null) {
                        return [];
                    }
                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile: contents,
                        rootApiFile: workspace.definition.rootApiFile.contents,
                        casingsGenerator: CASINGS_GENERATOR,
                    });
                    const responseBodyType = file.parseTypeReference(response);
                    const responseProperty = typeof response !== "string" ? response.property : undefined;
                    if (
                        responseProperty != null &&
                        !typeReferenceHasProperty(responseBodyType, responseProperty, file, typeResolver)
                    ) {
                        return [
                            {
                                severity: "error",
                                message: `Response does not have a property named ${responseProperty}.`,
                            },
                        ];
                    }
                    return [];
                },
            },
        };
    },
};

function typeReferenceHasProperty(
    typeReference: TypeReference,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): boolean {
    if (typeReference.type === "container" && typeReference.container.type === "optional") {
        return typeReferenceHasProperty(typeReference.container.optional, property, file, typeResolver);
    }
    if (typeReference.type === "named") {
        const resolvedType = typeResolver.resolveNamedTypeOrThrow({
            referenceToNamedType: typeReference.name.originalName,
            file,
        });
        switch (resolvedType._type) {
            case "container":
                return typeReferenceHasProperty(resolvedType.originalTypeReference, property, file, typeResolver);
            case "named":
                if (isRawObjectDefinition(resolvedType.declaration)) {
                    return rawObjectSchemaHasProperty(resolvedType.declaration, property, file, typeResolver);
                }
                throw new Error("A custom response property is only supported for objects");
        }
    }
    return false;
}

function rawObjectSchemaHasProperty(
    objectSchema: RawSchemas.ObjectSchema,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): boolean {
    const properties = getAllPropertiesForRawObjectSchema(objectSchema, file, typeResolver);
    return properties.has(property);
}

function getAllPropertiesForRawObjectSchema(
    objectSchema: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Set<string> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties = new Set<string>();
    for (const extendedType of extendedTypes) {
        for (const extendedProperty of getAllPropertiesForExtendedType(extendedType, file, typeResolver)) {
            properties.add(extendedProperty);
        }
    }

    for (const propertyKey of Object.keys(objectSchema.properties ?? {})) {
        properties.add(propertyKey);
    }

    return properties;
}

function getAllPropertiesForExtendedType(
    extendedType: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Set<string> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file,
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return getAllPropertiesForRawObjectSchema(resolvedType.declaration, file, typeResolver);
    }
    // This should be unreachable; extended types must be named objects.
    throw new Error(`Extended type ${extendedType} must be another named type`);
}

type NamedDeclaration =
    | RawSchemas.ObjectSchema
    | RawSchemas.DiscriminatedUnionSchema
    | RawSchemas.UndiscriminatedUnionSchema
    | RawSchemas.EnumSchema;

function isRawObjectDefinition(namedDeclaration: NamedDeclaration): namedDeclaration is RawSchemas.ObjectSchema {
    return (
        (namedDeclaration as RawSchemas.ObjectSchema).extends != null ||
        (namedDeclaration as RawSchemas.ObjectSchema).properties != null
    );
}
