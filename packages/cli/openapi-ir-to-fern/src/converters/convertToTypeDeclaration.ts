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

function convertObjectToTypeDeclaration(schema: ObjectSchema): TypeDeclarations {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    const properties: Record<string, RawSchemas.ObjectPropertySchema> = {};
    for (const property of schema.properties) {
        const propertyTypeReference = convertToTypeReference({ schema: property.schema });
        properties[property.key] = {
            type: propertyTypeReference.typeReference,
        };
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...propertyTypeReference.additionalTypeDeclarations,
        };
    }
    return {
        name: schema.name ?? undefined,
        typeDeclaration: {
            docs: schema.description ?? undefined,
            properties,
        },
        additionalTypeDeclarations,
    };
}

function convertArrayToTypeDeclaration(schema: ArraySchema): TypeDeclarations {
    const arrayTypeReference = convertArrayToTypeReference({ schema });
    return {
        typeDeclaration: {
            docs: schema.description ?? undefined,
            type: arrayTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...arrayTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertMapToTypeDeclaration(schema: MapSchema): TypeDeclarations {
    const mapTypeReference = convertMapToTypeReference({ schema });
    return {
        typeDeclaration: {
            docs: schema.description ?? undefined,
            type: mapTypeReference.typeReference,
        },
        additionalTypeDeclarations: {
            ...mapTypeReference.additionalTypeDeclarations,
        },
    };
}

function convertPrimitiveToTypeDeclaration(schema: PrimitiveSchema): TypeDeclarations {
    const primitiveTypeReference = convertPrimitiveToTypeReference(schema);
    return {
        typeDeclaration: {
            docs: schema.description ?? undefined,
            type: primitiveTypeReference.typeReference,
        },
        additionalTypeDeclarations: {},
    };
}

function convertEnumToTypeDeclaration(schema: EnumSchema): TypeDeclarations {
    return {
        typeDeclaration: {
            docs: schema.description ?? undefined,
            enum: schema.values.map((enumValue) => {
                return {
                    name: enumValue.name ?? enumValue.value,
                    value: enumValue.value,
                };
            }),
        },
        additionalTypeDeclarations: {},
    };
}

function convertReferenceToTypeDeclaration(schema: ReferencedSchema): TypeDeclarations {
    const referenceTypeReference = convertReferenceToTypeReference({ schema });
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

function convertOptionalToTypeDeclaration(schema: OptionalSchema): TypeDeclarations {
    const optionalTypeReference = convertOptionalToTypeReference({ schema });
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
