import { RawSchemas } from "@fern-api/yaml-schema";
import {
    ArraySchema,
    EnumSchema,
    MapSchema,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    PrimitiveSchemaValue,
    ReferencedSchema,
    Schema,
} from "@fern-fern/openapi-ir-model/ir";
import { convertObjectToTypeDeclaration, convertOneOfToTypeDeclaration } from "./convertToTypeDeclaration";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface TypeReference {
    typeReference: RawSchemas.TypeReferenceWithDocsSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertToTypeReference({ schema, prefix }: { schema: Schema; prefix?: string }): TypeReference {
    if (schema.type === "primitive") {
        return convertPrimitiveToTypeReference(schema);
    } else if (schema.type === "array") {
        return convertArrayToTypeReference({ schema, prefix });
    } else if (schema.type === "map") {
        return convertMapToTypeReference({ schema, prefix });
    } else if (schema.type === "reference") {
        return convertReferenceToTypeReference({ schema, prefix });
    } else if (schema.type === "unknown") {
        return convertUnknownToTypeReference();
    } else if (schema.type === "optional") {
        return convertOptionalToTypeReference({ schema, prefix });
    } else if (schema.type === "enum") {
        return convertEnumToTypeReference({ schema, prefix });
    } else if (schema.type === "object") {
        return convertObjectToTypeReference({ schema, prefix });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (schema.type === "oneOf") {
        return convertOneOfToTypeReference({ schema: schema.oneOf, prefix });
    }
    throw new Error(`Failed to convert to type reference: ${JSON.stringify(schema)}`);
}

export function convertPrimitiveToTypeReference(primitiveSchema: PrimitiveSchema): TypeReference {
    const typeReference = PrimitiveSchemaValue._visit<string>(primitiveSchema.schema, {
        int: () => "integer",
        int64: () => "long",
        float: () => "double",
        double: () => "double",
        string: () => "string",
        datetime: () => "datetime",
        date: () => "date",
        base64: () => "base64",
        boolean: () => "boolean",
        _unknown: () => "unknown",
    });
    return {
        typeReference: {
            type: typeReference,
            docs: primitiveSchema.description ?? undefined,
        },
        additionalTypeDeclarations: {},
    };
}

export function convertReferenceToTypeReference({
    schema,
    prefix,
}: {
    schema: ReferencedSchema;
    prefix?: string;
}): TypeReference {
    return {
        typeReference: {
            type: prefix != null ? `${prefix}.${schema.schema}` : schema.schema,
            docs: schema.description ?? undefined,
        },
        additionalTypeDeclarations: {},
    };
}

export function convertArrayToTypeReference({
    schema,
    prefix,
}: {
    schema: ArraySchema;
    prefix?: string;
}): TypeReference {
    const elementTypeReference = convertToTypeReference({ schema: schema.value, prefix });
    return {
        typeReference: {
            docs: schema.description ?? undefined,
            type: `list<${getTypeFromTypeReference(elementTypeReference.typeReference)}>`,
        },
        additionalTypeDeclarations: {
            ...elementTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertMapToTypeReference({ schema, prefix }: { schema: MapSchema; prefix?: string }): TypeReference {
    const keyTypeReference = convertPrimitiveToTypeReference(
        Schema.primitive({
            schema: schema.key,
            description: undefined,
        })
    );
    const valueTypeReference = convertToTypeReference({
        schema: schema.value,
        prefix,
    });
    return {
        typeReference: {
            docs: schema.description ?? undefined,
            type: `map<${getTypeFromTypeReference(keyTypeReference.typeReference)}, ${getTypeFromTypeReference(
                valueTypeReference.typeReference
            )}>`,
        },
        additionalTypeDeclarations: {
            ...valueTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertOptionalToTypeReference({
    schema,
    prefix,
}: {
    schema: OptionalSchema;
    prefix?: string;
}): TypeReference {
    const valueTypeReference = convertToTypeReference({
        schema: schema.value,
        prefix,
    });
    return {
        typeReference: {
            docs: schema.description ?? undefined,
            type: `optional<${getTypeFromTypeReference(valueTypeReference.typeReference)}>`,
        },
        additionalTypeDeclarations: {
            ...valueTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertUnknownToTypeReference(): TypeReference {
    return {
        typeReference: "unknown",
        additionalTypeDeclarations: {},
    };
}

export function convertEnumToTypeReference({ schema, prefix }: { schema: EnumSchema; prefix?: string }): TypeReference {
    return {
        typeReference: {
            type:
                prefix != null
                    ? `${prefix}.${schema.nameOverride ?? schema.generatedName}`
                    : schema.nameOverride ?? schema.generatedName,
            docs: schema.description ?? undefined,
        },
        additionalTypeDeclarations: {},
    };
}

export function convertObjectToTypeReference({
    schema,
    prefix,
}: {
    schema: ObjectSchema;
    prefix?: string;
}): TypeReference {
    const objectTypeDeclaration = convertObjectToTypeDeclaration(schema);
    objectTypeDeclaration.additionalTypeDeclarations;
    return {
        typeReference: {
            type:
                prefix != null
                    ? `${prefix}.${schema.nameOverride ?? schema.generatedName}`
                    : schema.nameOverride ?? schema.generatedName,
            docs: schema.description ?? undefined,
        },
        additionalTypeDeclarations: {
            [schema.nameOverride ?? schema.generatedName]: objectTypeDeclaration.typeDeclaration,
            ...objectTypeDeclaration.additionalTypeDeclarations,
        },
    };
}

export function convertOneOfToTypeReference({
    schema,
    prefix,
}: {
    schema: OneOfSchema;
    prefix?: string;
}): TypeReference {
    const unionTypeDeclaration = convertOneOfToTypeDeclaration(schema);
    return {
        typeReference: {
            type:
                prefix != null
                    ? `${prefix}.${schema.nameOverride ?? schema.generatedName}`
                    : schema.nameOverride ?? schema.generatedName,
            docs: schema.description ?? undefined,
        },
        additionalTypeDeclarations: {
            [schema.nameOverride ?? schema.generatedName]: unionTypeDeclaration.typeDeclaration,
            ...unionTypeDeclaration.additionalTypeDeclarations,
        },
    };
}
