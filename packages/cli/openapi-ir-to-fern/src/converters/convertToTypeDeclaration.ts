import { RawSchemas } from "@fern-api/yaml-schema";
import {
    ArraySchema,
    EnumSchema,
    MapSchema,
    ObjectSchema,
    OptionalSchema,
    PrimitiveSchema,
    ReferencedSchema,
    Schema,
} from "@fern-fern/openapi-ir-model/ir";
import {
    convertArrayToTypeReference,
    convertEnumToTypeReference,
    convertMapToTypeReference,
    convertOptionalToTypeReference,
    convertPrimitiveToTypeReference,
    convertReferenceToTypeReference,
    convertToTypeReference,
    convertUnknownToTypeReference,
} from "./convertToTypeReference";

export interface TypeDeclarations {
    name?: string | undefined;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertToTypeDeclaration(schema: Schema): TypeDeclarations {
    if (schema.type === "object") {
        return convertObjectToTypeDeclaration(schema);
    } else if (schema.type === "array") {
        return convertArrayToTypeDeclaration(schema);
    } else if (schema.type === "map") {
        return convertMapToTypeDeclaration(schema);
    } else if (schema.type === "primitive") {
        return convertPrimitiveToTypeDeclaration(schema);
    } else if (schema.type === "enum") {
        return convertEnumToTypeDeclaration(schema);
    } else if (schema.type === "reference") {
        return convertReferenceToTypeDeclaration(schema);
    } else if (schema.type === "optional") {
        return convertOptionalToTypeDeclaration(schema);
    } else if (schema.type === "unknown") {
        return convertUnknownToTypeDeclaration();
    }
    throw new Error(`Failed to convert to type declaration: ${JSON.stringify(schema)}`);
}

function convertObjectToTypeDeclaration(objectSchema: ObjectSchema): TypeDeclarations {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    const properties: Record<string, RawSchemas.ObjectPropertySchema> = {};
    for (const property of objectSchema.properties) {
        const propertyTypeReference = convertToTypeReference(property.schema);
        properties[property.key] = {
            type: propertyTypeReference.typeReference,
        };
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...propertyTypeReference.additionalTypeDeclarations,
        };
    }
    return {
        name: objectSchema.name ?? undefined,
        typeDeclaration: {
            docs: objectSchema.description ?? undefined,
            properties,
        },
        additionalTypeDeclarations,
    };
}

function convertArrayToTypeDeclaration(arraySchema: ArraySchema): TypeDeclarations {
    const arrayTypeReference = convertArrayToTypeReference(arraySchema);
    return {
        typeDeclaration: {
            docs: arraySchema.description ?? undefined,
            type: arrayTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...arrayTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertMapToTypeDeclaration(mapSchema: MapSchema): TypeDeclarations {
    const mapTypeReference = convertMapToTypeReference(mapSchema);
    return {
        typeDeclaration: {
            docs: mapSchema.description ?? undefined,
            type: mapTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...mapTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertPrimitiveToTypeDeclaration(primitiveSchema: PrimitiveSchema): TypeDeclarations {
    const primitiveTypeReference = convertPrimitiveToTypeReference(primitiveSchema);
    return {
        typeDeclaration: {
            docs: primitiveSchema.description ?? undefined,
            type: primitiveTypeReference.typeReference,
        },
        additionalTypeDeclarations: {},
    };
}

function convertEnumToTypeDeclaration(enumSchema: EnumSchema): TypeDeclarations {
    const enumTypeReference = convertEnumToTypeReference(enumSchema);
    return {
        typeDeclaration: {
            docs: enumSchema.description ?? undefined,
            type: enumTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...enumTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertReferenceToTypeDeclaration(referenceSchema: ReferencedSchema): TypeDeclarations {
    const referenceTypeReference = convertReferenceToTypeReference(referenceSchema);
    return {
        typeDeclaration: {
            docs: undefined,
            type: referenceTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...referenceTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertOptionalToTypeDeclaration(optionalSchema: OptionalSchema): TypeDeclarations {
    const optionalTypeReference = convertOptionalToTypeReference(optionalSchema);
    return {
        typeDeclaration: {
            docs: undefined,
            type: optionalTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...optionalTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertUnknownToTypeDeclaration(): TypeDeclarations {
    const unknownTypeReference = convertUnknownToTypeReference();
    return {
        typeDeclaration: {
            docs: undefined,
            type: unknownTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...unknownTypeReference.additionalTypeDeclarations,
        },
    };
}
