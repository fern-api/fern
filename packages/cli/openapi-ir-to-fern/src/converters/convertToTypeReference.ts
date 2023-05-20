import { RawSchemas } from "@fern-api/yaml-schema";
import {
    ArraySchema,
    EnumSchema,
    MapSchema,
    NullableSchema,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    PrimitiveSchemaValue,
    ReferencedSchema,
    Schema,
    SchemaId,
} from "@fern-fern/openapi-ir-model/ir";
import {
    convertEnumToTypeDeclaration,
    convertObjectToTypeDeclaration,
    convertOneOfToTypeDeclaration,
} from "./convertToTypeDeclaration";
import { getDocsFromTypeReference, getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface TypeReference {
    typeReference: RawSchemas.TypeReferenceWithDocsSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertToTypeReference({
    schema,
    prefix,
    schemas,
}: {
    schema: Schema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    if (schema.type === "primitive") {
        return convertPrimitiveToTypeReference(schema);
    } else if (schema.type === "array") {
        return convertArrayToTypeReference({ schema, prefix, schemas });
    } else if (schema.type === "map") {
        return convertMapToTypeReference({ schema, prefix, schemas });
    } else if (schema.type === "reference") {
        return convertReferenceToTypeReference({ schema, prefix, schemas });
    } else if (schema.type === "unknown") {
        return convertUnknownToTypeReference();
    } else if (schema.type === "optional") {
        return convertOptionalToTypeReference({ schema, prefix, schemas });
    } else if (schema.type === "nullable") {
        return convertNullableToTypeReference({ schema, prefix, schemas });
    } else if (schema.type === "enum") {
        return convertEnumToTypeReference({ schema, prefix });
    } else if (schema.type === "literal") {
        return convertLiteralToTypeReference(schema.value);
    } else if (schema.type === "object") {
        return convertObjectToTypeReference({ schema, prefix, schemas });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (schema.type === "oneOf") {
        return convertOneOfToTypeReference({ schema: schema.oneOf, prefix, schemas });
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
    schemas,
}: {
    schema: ReferencedSchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const resolvedSchema = schemas[schema.schema];
    if (resolvedSchema == null) {
        throw new Error(`Failed to look up schema with id ${schema.schema}`);
    }
    const schemaName = getSchemaName(resolvedSchema) ?? schema.schema;
    return {
        typeReference: {
            type: prefix != null ? `${prefix}.${schemaName}` : schemaName,
            docs: schema.description ?? undefined,
        },
        additionalTypeDeclarations: {},
    };
}

export function convertArrayToTypeReference({
    schema,
    prefix,
    schemas,
}: {
    schema: ArraySchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const elementTypeReference = convertToTypeReference({ schema: schema.value, prefix, schemas });
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

export function convertMapToTypeReference({
    schema,
    prefix,
    schemas,
}: {
    schema: MapSchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const keyTypeReference = convertPrimitiveToTypeReference(
        Schema.primitive({
            schema: schema.key,
            description: undefined,
        })
    );
    const valueTypeReference = convertToTypeReference({
        schema: schema.value,
        prefix,
        schemas,
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
    schemas,
}: {
    schema: OptionalSchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const valueTypeReference = convertToTypeReference({
        schema: schema.value,
        prefix,
        schemas,
    });
    const valueType = getTypeFromTypeReference(valueTypeReference.typeReference);
    return {
        typeReference: {
            docs: schema.description ?? getDocsFromTypeReference(valueTypeReference.typeReference),
            type: valueType.startsWith("optional<") ? valueType : `optional<${valueType}>`,
        },
        additionalTypeDeclarations: {
            ...valueTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertNullableToTypeReference({
    schema,
    prefix,
    schemas,
}: {
    schema: NullableSchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const valueTypeReference = convertToTypeReference({
        schema: schema.value,
        prefix,
        schemas,
    });
    const valueType = getTypeFromTypeReference(valueTypeReference.typeReference);
    return {
        typeReference: {
            docs: schema.description ?? getDocsFromTypeReference(valueTypeReference.typeReference),
            type: valueType.startsWith("optional<") ? valueType : `optional<${valueType}>`,
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

export function convertLiteralToTypeReference(value: string): TypeReference {
    return {
        typeReference: `literal<"${value}">`,
        additionalTypeDeclarations: {},
    };
}

export function convertEnumToTypeReference({ schema, prefix }: { schema: EnumSchema; prefix?: string }): TypeReference {
    const enumTypeDeclaration = convertEnumToTypeDeclaration(schema);
    return {
        typeReference: {
            type:
                prefix != null
                    ? `${prefix}.${schema.nameOverride ?? schema.generatedName}`
                    : schema.nameOverride ?? schema.generatedName,
            docs: schema.description ?? undefined,
        },
        additionalTypeDeclarations: {
            [schema.nameOverride ?? schema.generatedName]: enumTypeDeclaration.typeDeclaration,
            ...enumTypeDeclaration.additionalTypeDeclarations,
        },
    };
}

export function convertObjectToTypeReference({
    schema,
    prefix,
    schemas,
}: {
    schema: ObjectSchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const objectTypeDeclaration = convertObjectToTypeDeclaration({ schema, schemas });
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
    schemas,
}: {
    schema: OneOfSchema;
    prefix?: string;
    schemas: Record<SchemaId, Schema>;
}): TypeReference {
    const unionTypeDeclaration = convertOneOfToTypeDeclaration({ schema, schemas });
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

function getSchemaName(schema: Schema) {
    if (schema.type === "object") {
        return schema.nameOverride ?? schema.generatedName;
    } else if (schema.type === "enum") {
        return schema.nameOverride ?? schema.generatedName;
    } else if (schema.type === "oneOf") {
        return schema.oneOf.nameOverride ?? schema.oneOf.generatedName;
    } else if (schema.type === "reference") {
        return schema.nameOverride ?? schema.generatedName;
    }
    return undefined;
}
