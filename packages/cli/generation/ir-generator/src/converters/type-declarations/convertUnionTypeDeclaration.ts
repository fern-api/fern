import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { SingleUnionTypeProperties, Type, TypeReference } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getDocs } from "../../utils/getDocs";

const DEFAULT_UNION_VALUE_PROPERTY_VALUE = "value";

export function convertUnionTypeDeclaration({
    union,
    file,
    typeResolver,
}: {
    union: RawSchemas.UnionSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    const discriminant = getUnionDiscriminant(union);
    return Type.union({
        discriminant,
        discriminantV2: file.casingsGenerator.generateWireCasingsV1({
            wireValue: discriminant,
            name: getUnionDiscriminantName(union).name,
        }),
        discriminantV3: file.casingsGenerator.generateNameAndWireValue({
            wireValue: discriminant,
            name: getUnionDiscriminantName(union).name,
        }),
        types: Object.entries(union.union).map(([unionKey, unionedType]) => {
            const rawType: string | undefined =
                typeof unionedType === "string" ? unionedType : unionedType.type != null ? unionedType.type : undefined;

            const discriminantValue = file.casingsGenerator.generateWireCasingsV1({
                wireValue: unionKey,
                name: getUnionedTypeName({ unionKey, unionedType }).name,
            });

            const discriminantValueV2 = file.casingsGenerator.generateNameAndWireValue({
                wireValue: unionKey,
                name: getUnionedTypeName({ unionKey, unionedType }).name,
            });

            const docs = getDocs(unionedType);

            if (rawType == null) {
                return {
                    discriminantValue,
                    discriminantValueV2,
                    docs,
                    valueType: TypeReference.void(),
                    shape: SingleUnionTypeProperties.noProperties(),
                };
            }

            const valueType = file.parseTypeReference(rawType);

            return {
                discriminantValue,
                discriminantValueV2,
                valueType,
                shape: getSingleUnionTypeProperties({
                    rawType,
                    valueType,
                    file,
                    typeResolver,
                    rawSingleUnionType: typeof unionedType !== "string" ? unionedType.key : undefined,
                }),
                docs: getDocs(unionedType),
            };
        }),
    });
}

function getUnionDiscriminant(union: RawSchemas.UnionSchema): string {
    if (union.discriminant == null) {
        return "type";
    }
    if (typeof union.discriminant === "string") {
        return union.discriminant;
    }
    return union.discriminant.value;
}

export function getUnionDiscriminantName(union: RawSchemas.UnionSchema): { name: string; wasExplicitlySet: boolean } {
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

export function getUnionedTypeName({
    unionKey,
    unionedType,
}: {
    unionKey: string;
    unionedType: string | RawSchemas.SingleUnionTypeSchema;
}): {
    name: string;
    wasExplicitlySet: boolean;
} {
    if (typeof unionedType !== "string" && unionedType.name != null) {
        return {
            name: unionedType.name,
            wasExplicitlySet: true,
        };
    }

    return {
        name: unionKey,
        wasExplicitlySet: false,
    };
}

function getSingleUnionTypeProperties({
    rawType,
    valueType,
    file,
    typeResolver,
    rawSingleUnionType,
}: {
    rawType: string;
    valueType: TypeReference;
    file: FernFileContext;
    typeResolver: TypeResolver;
    rawSingleUnionType: string | RawSchemas.SingleUnionTypeKeySchema | undefined;
}): SingleUnionTypeProperties {
    const resolvedType = typeResolver.resolveType({ type: rawType, file });

    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return SingleUnionTypeProperties.samePropertiesAsObject(resolvedType.name);
    } else {
        return SingleUnionTypeProperties.singleProperty({
            name: file.casingsGenerator.generateWireCasingsV1({
                wireValue: getSinglePropertyKeyValue(rawSingleUnionType),
                name: getSinglePropertyKeyName(rawSingleUnionType),
            }),
            nameV2: file.casingsGenerator.generateNameAndWireValue({
                wireValue: getSinglePropertyKeyValue(rawSingleUnionType),
                name: getSinglePropertyKeyName(rawSingleUnionType),
            }),
            type: valueType,
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
