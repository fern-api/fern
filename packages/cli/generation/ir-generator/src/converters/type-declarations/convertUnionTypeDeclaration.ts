import { RawSchemas } from "@fern-api/yaml-schema";
import {
    ResolvedTypeReference,
    ShapeType,
    SingleUnionTypeProperties,
    Type,
    TypeReference,
} from "@fern-fern/ir-model/types";
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
            const valueType = rawType != null ? file.parseTypeReference(rawType) : TypeReference.void();
            const resolvedType =
                rawType != null ? typeResolver.resolveType({ type: rawType, file }) : ResolvedTypeReference.void();
            return {
                discriminantValue: generateWireStringWithAllCasings({
                    wireValue: unionKey,
                    name: typeof unionedType !== "string" && unionedType.name != null ? unionedType.name : unionKey,
                }),
                valueType,
                shape:
                    resolvedType._type === "void"
                        ? SingleUnionTypeProperties.noProperties()
                        : resolvedType._type === "named" && resolvedType.shape === ShapeType.Object
                        ? SingleUnionTypeProperties.samePropertiesAsObject(resolvedType.name)
                        : SingleUnionTypeProperties.singleProperty({
                              name: generateWireStringWithAllCasings({
                                  wireValue: UNION_VALUE_PROPERTY_NAME,
                                  name: UNION_VALUE_PROPERTY_NAME,
                              }),
                              type: valueType,
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
