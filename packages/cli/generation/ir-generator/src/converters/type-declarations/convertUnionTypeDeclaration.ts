import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { SingleUnionTypeProperties, Type } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../type-resolver/TypeResolver";
import { generateWireStringWithAllCasings } from "../../utils/generateCasings";
import { getDocs } from "../../utils/getDocs";

const UNION_VALUE_PROPERTY_NAME = "value";

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
        discriminantV2: generateWireStringWithAllCasings({
            wireValue: discriminant,
            name: getUnionDiscriminantName(union).name,
        }),
        types: Object.entries(union.union).map(([unionKey, unionedType]) => {
            const rawType: string | undefined =
                typeof unionedType === "string" ? unionedType : unionedType.type != null ? unionedType.type : undefined;

            const discriminantValue = generateWireStringWithAllCasings({
                wireValue: unionKey,
                name: getUnionedTypeName({ unionKey, unionedType }).name,
            });

            const docs = getDocs(unionedType);

            if (rawType == null) {
                return {
                    discriminantValue,
                    docs,
                    shape: SingleUnionTypeProperties.noProperties(),
                };
            }

            return {
                discriminantValue,
                shape: getSingleUnionTypeProperties({ rawType, file, typeResolver }),
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
    file,
    typeResolver,
}: {
    rawType: string;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): SingleUnionTypeProperties {
    const resolvedType = typeResolver.resolveType({ type: rawType, file });
    const valueType = file.parseTypeReference(rawType);

    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return SingleUnionTypeProperties.samePropertiesAsObject(resolvedType.name);
    } else {
        return SingleUnionTypeProperties.singleProperty({
            name: generateWireStringWithAllCasings({
                wireValue: UNION_VALUE_PROPERTY_NAME,
                name: UNION_VALUE_PROPERTY_NAME,
            }),
            type: valueType,
        });
    }
}
