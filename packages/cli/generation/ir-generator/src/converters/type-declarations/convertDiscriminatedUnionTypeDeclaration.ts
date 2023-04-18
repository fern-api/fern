import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { SingleUnionType, SingleUnionTypeProperties, Type, TypeReference } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getDocs } from "../../utils/getDocs";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";
import { getExtensionsAsList, getPropertyName } from "./convertObjectTypeDeclaration";

const DEFAULT_UNION_VALUE_PROPERTY_VALUE = "value";

export function convertDiscriminatedUnionTypeDeclaration({
    union,
    file,
    typeResolver,
}: {
    union: RawSchemas.DiscriminatedUnionSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    const discriminant = getUnionDiscriminant(union);
    return Type.union({
        discriminant: file.casingsGenerator.generateNameAndWireValue({
            wireValue: discriminant,
            name: getUnionDiscriminantName(union).name,
        }),
        extends: getExtensionsAsList(union.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        baseProperties:
            union["base-properties"] != null
                ? Object.entries(union["base-properties"]).map(([propertyKey, propertyDefinition]) => ({
                      ...convertDeclaration(propertyDefinition),
                      name: file.casingsGenerator.generateNameAndWireValue({
                          wireValue: propertyKey,
                          name: getPropertyName({ propertyKey, property: propertyDefinition }).name,
                      }),
                      valueType: file.parseTypeReference(propertyDefinition),
                  }))
                : [],
        types: Object.entries(union.union).map(([unionKey, rawSingleUnionType]): SingleUnionType => {
            const rawType: string | undefined =
                typeof rawSingleUnionType === "string"
                    ? rawSingleUnionType
                    : typeof rawSingleUnionType.type === "string"
                    ? rawSingleUnionType.type
                    : undefined;

            const discriminantValue = file.casingsGenerator.generateNameAndWireValue({
                wireValue: unionKey,
                name: getSingleUnionTypeName({ unionKey, rawSingleUnionType }).name,
            });

            const docs = getDocs(rawSingleUnionType);

            if (rawType == null) {
                return {
                    discriminantValue,
                    docs,
                    shape: SingleUnionTypeProperties.noProperties(),
                };
            }

            const parsedValueType = file.parseTypeReference(rawType);

            return {
                discriminantValue,
                shape: getSingleUnionTypeProperties({
                    rawSingleUnionType,
                    rawValueType: rawType,
                    parsedValueType,
                    file,
                    typeResolver,
                }),
                docs: getDocs(rawSingleUnionType),
            };
        }),
    });
}

export function getUnionDiscriminant(union: RawSchemas.DiscriminatedUnionSchema): string {
    if (union.discriminant == null) {
        return "type";
    }
    if (typeof union.discriminant === "string") {
        return union.discriminant;
    }
    return union.discriminant.value;
}

export function getUnionDiscriminantName(union: RawSchemas.DiscriminatedUnionSchema): {
    name: string;
    wasExplicitlySet: boolean;
} {
    if (union.discriminant != null && typeof union.discriminant !== "string" && union.discriminant.name != null) {
        return {
            name: union.discriminant.name,
            wasExplicitlySet: true,
        };
    }
    return {
        name: getUnionDiscriminant(union),
        wasExplicitlySet: false,
    };
}

export function getSingleUnionTypeName({
    unionKey,
    rawSingleUnionType,
}: {
    unionKey: string;
    rawSingleUnionType: string | RawSchemas.SingleUnionTypeSchema;
}): {
    name: string;
    wasExplicitlySet: boolean;
} {
    if (typeof rawSingleUnionType !== "string" && rawSingleUnionType.name != null) {
        return {
            name: rawSingleUnionType.name,
            wasExplicitlySet: true,
        };
    }

    return {
        name: unionKey,
        wasExplicitlySet: false,
    };
}

export function getSingleUnionTypeProperties({
    rawSingleUnionType,
    rawValueType,
    parsedValueType,
    file,
    typeResolver,
}: {
    rawSingleUnionType: RawSchemas.SingleUnionTypeSchema;
    rawValueType: string;
    parsedValueType: TypeReference;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): SingleUnionTypeProperties.SamePropertiesAsObject | SingleUnionTypeProperties.SingleProperty {
    const resolvedType = typeResolver.resolveTypeOrThrow({ type: rawValueType, file });

    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return SingleUnionTypeProperties.samePropertiesAsObject(resolvedType.name);
    } else {
        const singlePropertyKey = typeof rawSingleUnionType !== "string" ? rawSingleUnionType.key : undefined;
        return SingleUnionTypeProperties.singleProperty({
            name: file.casingsGenerator.generateNameAndWireValue({
                wireValue: getSinglePropertyKeyValue(singlePropertyKey),
                name: getSinglePropertyKeyName(singlePropertyKey),
            }),
            type: parsedValueType,
        });
    }
}

function getSinglePropertyKeyName(
    rawSingleUnionType: string | RawSchemas.SingleUnionTypeKeySchema | undefined
): string {
    if (rawSingleUnionType != null) {
        if (typeof rawSingleUnionType === "string") {
            return rawSingleUnionType;
        }
        return rawSingleUnionType.name ?? rawSingleUnionType.value;
    }
    return DEFAULT_UNION_VALUE_PROPERTY_VALUE;
}

function getSinglePropertyKeyValue(
    rawSingleUnionType: string | RawSchemas.SingleUnionTypeKeySchema | undefined
): string {
    if (rawSingleUnionType != null) {
        if (typeof rawSingleUnionType === "string") {
            return rawSingleUnionType;
        }
        return rawSingleUnionType.value;
    }
    return DEFAULT_UNION_VALUE_PROPERTY_VALUE;
}
