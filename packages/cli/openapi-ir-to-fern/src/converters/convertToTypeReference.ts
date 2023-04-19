import { RawSchemas } from "@fern-api/yaml-schema";
import {
    ArraySchema,
    EnumSchema,
    MapSchema,
    ObjectSchema,
    OptionalSchema,
    PrimitiveSchema,
    PrimitiveSchemaValue,
    ReferencedSchema,
    Schema,
} from "@fern-fern/openapi-ir-model/ir";

export interface TypeReference {
    typeReference: string;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertToTypeReference(schema: Schema): TypeReference {
    if (schema.type === "primitive") {
        return convertPrimitiveToTypeReference(schema);
    } else if (schema.type === "array") {
        return convertArrayToTypeReference(schema);
    } else if (schema.type === "map") {
        return convertMapToTypeReference(schema);
    } else if (schema.type === "reference") {
        return convertReferenceToTypeReference(schema);
    } else if (schema.type === "unknown") {
        return convertUnknownToTypeReference();
    } else if (schema.type === "optional") {
        return convertOptionalToTypeReference(schema);
    } else if (schema.type === "enum") {
        return convertEnumToTypeReference(schema);
    } else if (schema.type === "object") {
        return convertObjectToTypeReference(schema);
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
        typeReference,
        additionalTypeDeclarations: {},
    };
}

export function convertReferenceToTypeReference(reference: ReferencedSchema): TypeReference {
    return {
        typeReference: reference.reference,
        additionalTypeDeclarations: {},
    };
}

export function convertArrayToTypeReference(arraySchema: ArraySchema): TypeReference {
    const elementTypeReference = convertToTypeReference(arraySchema.value);
    return {
        typeReference: `list<${elementTypeReference.typeReference}>`,
        additionalTypeDeclarations: {
            ...elementTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertMapToTypeReference(mapSchema: MapSchema): TypeReference {
    const keyTypeReference = convertPrimitiveToTypeReference(
        Schema.primitive({
            schema: mapSchema.key,
            description: undefined,
        })
    );
    const valueTypeReference = convertToTypeReference(mapSchema.value);
    return {
        typeReference: `map<${keyTypeReference.typeReference}, ${valueTypeReference.typeReference}>`,
        additionalTypeDeclarations: {
            ...valueTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertOptionalToTypeReference(optionalSchema: OptionalSchema): TypeReference {
    const valueTypeReference = convertToTypeReference(optionalSchema.value);
    return {
        typeReference: `optional<${valueTypeReference.typeReference}>`,
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

export function convertEnumToTypeReference(enumSchema: EnumSchema): TypeReference {
    if (enumSchema.name == null) {
        throw new Error(`Add x-name to enum: ${JSON.stringify(enumSchema)}`);
    }
    return {
        typeReference: enumSchema.name,
        additionalTypeDeclarations: {},
    };
}

export function convertObjectToTypeReference(objectSchema: ObjectSchema): TypeReference {
    if (objectSchema.name == null) {
        throw new Error(`Add x-name to object: ${JSON.stringify(schema)}`);
    }
    return {
        typeReference: objectSchema.name,
        additionalTypeDeclarations: {},
    };
}
