import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    PrimitiveType,
    Type,
    TypeDeclaration,
    TypeReference,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model";
import { OpenAPIV3 } from "openapi-types";

export interface ConvertedType {
    openApiSchema: OpenApiComponentSchema;
    schemaName: string;
}

export type OpenApiComponentSchema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

export function convertType(typeDeclaration: TypeDeclaration): ConvertedType {
    const shape = typeDeclaration.shape;
    const docs = typeDeclaration.docs ?? undefined;
    const openApiSchema = Type._visit(shape, {
        alias: (aliasTypeDeclaration) => {
            return convertAlias({ aliasTypeDeclaration, docs });
        },
        enum: (enumTypeDeclaration) => {
            return convertEnum({ enumTypeDeclaration, docs });
        },
        object: (objectTypeDeclaration) => {
            return convertObject({ objectTypeDeclaration, docs });
        },
        union: (unionTypeDeclaration) => {
            return convertUnion({ unionTypeDeclaration, docs });
        },
        _unknown: () => {
            throw new Error("Encountered unknown type: " + shape._type);
        },
    });
    return {
        openApiSchema,
        schemaName: getNameFromDeclaredTypeName(typeDeclaration.name),
    };
}

export function convertAlias({
    aliasTypeDeclaration,
    docs,
}: {
    aliasTypeDeclaration: AliasTypeDeclaration;
    docs: string | undefined;
}): OpenApiComponentSchema {
    const convertedAliasOf = convertTypeReference(aliasTypeDeclaration.aliasOf);
    return {
        ...convertedAliasOf,
        description: docs,
    };
}

export function convertEnum({
    enumTypeDeclaration,
    docs,
}: {
    enumTypeDeclaration: EnumTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    return {
        type: "string",
        enum: enumTypeDeclaration.values.map((enumValue) => {
            return enumValue.value;
        }),
        description: docs,
    };
}

export function convertObject({
    objectTypeDeclaration,
    docs,
}: {
    objectTypeDeclaration: ObjectTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    const properties: Record<string, OpenApiComponentSchema> = {};
    const required: string[] = [];
    objectTypeDeclaration.properties.forEach((objectProperty) => {
        const convertedObjectProperty = convertTypeReference(objectProperty.valueType);
        properties[objectProperty.name.wireValue] = {
            ...convertedObjectProperty,
            description: objectProperty.docs ?? undefined,
        };
        const isOptionalProperty =
            objectProperty.valueType._type === "container" && objectProperty.valueType.container._type === "optional";
        if (!isOptionalProperty) {
            required.push(objectProperty.name.wireValue);
        }
    });
    const convertedSchemaObject: OpenAPIV3.SchemaObject = {
        type: "object",
        description: docs,
        properties,
    };
    if (required.length > 0) {
        convertedSchemaObject.required = required;
    }
    if (objectTypeDeclaration.extends.length > 0) {
        convertedSchemaObject.allOf = objectTypeDeclaration.extends.map((declaredTypeName) => {
            return {
                $ref: getReferenceFromDeclaredTypeName(declaredTypeName),
            };
        });
    }
    return convertedSchemaObject;
}

export function convertUnion({
    unionTypeDeclaration,
    docs,
}: {
    unionTypeDeclaration: UnionTypeDeclaration;
    docs: string | undefined;
}): OpenAPIV3.SchemaObject {
    const oneOfTypes: OpenAPIV3.SchemaObject[] = unionTypeDeclaration.types.map((singleUnionType) => {
        const valueType = singleUnionType.valueType;
        const convertedValueType = convertTypeReference(valueType);
        if (valueType._type === "named") {
            const properties = {};
            properties[unionTypeDeclaration.discriminant] = {
                type: "string",
                enum: [singleUnionType.discriminantValue.wireValue],
            };
            return {
                type: "object",
                allOf: [
                    {
                        $ref: getReferenceFromDeclaredTypeName(valueType),
                    },
                    {
                        type: "object",
                        properties,
                    },
                ],
            };
        } else {
            const properties = {};
            properties[unionTypeDeclaration.discriminant] = {
                type: "string",
                enum: [singleUnionType.discriminantValue.wireValue],
            };
            properties[unionTypeDeclaration.discriminant] = convertedValueType;
            return {
                type: "object",
                properties,
            };
        }
    });
    return {
        oneOf: oneOfTypes,
        description: docs,
    };
}

export function convertTypeReference(typeReference: TypeReference): OpenApiComponentSchema {
    return TypeReference._visit(typeReference, {
        container: (containerType) => {
            return convertContainerType(containerType);
        },
        named: (declaredTypeName) => {
            return {
                $ref: getReferenceFromDeclaredTypeName(declaredTypeName),
            };
        },
        primitive: (primitiveType) => {
            return convertPrimitiveType(primitiveType);
        },
        unknown: () => {
            return {};
        },
        void: () => {
            return {};
        },
        _unknown: () => {
            throw new Error("Encountered unknown typeReference: " + typeReference._type);
        },
    });
}

function convertPrimitiveType(primitiveType: PrimitiveType): OpenAPIV3.NonArraySchemaObject {
    return PrimitiveType._visit<OpenAPIV3.NonArraySchemaObject>(primitiveType, {
        boolean: () => {
            return { type: "boolean" };
        },
        dateTime: () => {
            return {
                type: "string",
                format: "date-time",
            };
        },
        double: () => {
            return {
                type: "number",
                format: "double",
            };
        },
        integer: () => {
            return {
                type: "integer",
            };
        },
        long: () => {
            return {
                type: "integer",
                format: "int64",
            };
        },
        string: () => {
            return { type: "string" };
        },
        uuid: () => {
            return {
                type: "string",
                format: "uuid",
            };
        },
        _unknown: () => {
            throw new Error("Encountered unknown primitiveType: " + primitiveType);
        },
    });
}

function convertContainerType(containerType: ContainerType): OpenApiComponentSchema {
    return ContainerType._visit<OpenApiComponentSchema>(containerType, {
        list: (listType) => {
            return {
                type: "array",
                items: convertTypeReference(listType),
            };
        },
        set: (setType) => {
            return {
                type: "array",
                items: convertTypeReference(setType),
            };
        },
        map: (mapType) => {
            return {
                type: "object",
                additionalProperties: convertTypeReference(mapType.valueType),
            };
        },
        optional: (optionalType) => {
            return convertTypeReference(optionalType);
        },
        _unknown: () => {
            throw new Error("Encountered unknown containerType: " + containerType._type);
        },
    });
}

export function getReferenceFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return `#/components/schemas/${getNameFromDeclaredTypeName(declaredTypeName)}`;
}

export function getNameFromDeclaredTypeName(declaredTypeName: DeclaredTypeName): string {
    return [...declaredTypeName.fernFilepath.map((part) => part.pascalCase), declaredTypeName.name].join("");
}
