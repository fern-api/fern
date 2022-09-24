import { RawSchemas, visitRawTypeDeclaration, visitRawTypeReference } from "@fern-api/yaml-schema";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../type-resolver/TypeResolver";
import { parseTypeName } from "../../utils/parseTypeName";

interface SeenTypeNames {
    addTypeName: (typeName: DeclaredTypeName) => void;
    hasTypeNameBeenSeen: (typeName: DeclaredTypeName) => boolean;
}

export function getReferencedTypesFromRawDeclaration({
    typeDeclaration,
    file,
    typeResolver,
    seenTypeNames = new SeenTypeNamesImpl(),
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    seenTypeNames?: SeenTypeNames;
}): DeclaredTypeName[] {
    const rawTypeReferences = visitRawTypeDeclaration<string[]>(typeDeclaration, {
        alias: (aliasDeclaration) => {
            return [typeof aliasDeclaration === "string" ? aliasDeclaration : aliasDeclaration.alias];
        },
        object: (objectDeclaration) => {
            const types: string[] = [];
            if (objectDeclaration.extends != null) {
                const extendsArr =
                    typeof objectDeclaration.extends === "string"
                        ? [objectDeclaration.extends]
                        : objectDeclaration.extends;
                types.push(...extendsArr);
            }
            if (objectDeclaration.properties != null) {
                types.push(
                    ...Object.values(objectDeclaration.properties).map((property) =>
                        typeof property === "string" ? property : property.type
                    )
                );
            }
            return types;
        },
        union: (unionDeclaration) => {
            return Object.values(unionDeclaration.union).reduce<string[]>((types, unionedType) => {
                const rawType = typeof unionedType === "string" ? unionedType : unionedType.type;
                if (rawType != null) {
                    types.push(rawType);
                }
                return types;
            }, []);
        },
        enum: () => [],
    });

    const referencedTypes: DeclaredTypeName[] = [];

    for (const rawTypeReference of rawTypeReferences) {
        const rawNames = visitRawTypeReference<string[]>(rawTypeReference, {
            primitive: () => [],
            map: ({ keyType, valueType }) => [...keyType, ...valueType],
            list: (valueType) => valueType,
            optional: (valueType) => valueType,
            set: (valueType) => valueType,
            named: (name) => [name],
            unknown: () => [],
        });

        for (const rawName of rawNames) {
            const parsedTypeName = parseTypeName({ typeName: rawName, file });
            if (!seenTypeNames.hasTypeNameBeenSeen(parsedTypeName)) {
                seenTypeNames.addTypeName(parsedTypeName);

                referencedTypes.push(parsedTypeName);

                const maybeDeclaration = typeResolver.getDeclarationOfNamedType({
                    referenceToNamedType: rawName,
                    file,
                });
                if (maybeDeclaration == null) {
                    throw new Error("Cannot find declaration for: " + rawName);
                }

                referencedTypes.push(
                    ...getReferencedTypesFromRawDeclaration({
                        typeDeclaration: maybeDeclaration.declaration,
                        file: maybeDeclaration.file,
                        typeResolver,
                        seenTypeNames,
                    })
                );
            }
        }
    }

    return referencedTypes;
}

class SeenTypeNamesImpl implements SeenTypeNames {
    private cache = new Set<string>();

    public addTypeName(typeName: DeclaredTypeName): void {
        this.cache.add(this.computeCacheKey(typeName));
    }

    public hasTypeNameBeenSeen(typeName: DeclaredTypeName): boolean {
        return this.cache.has(this.computeCacheKey(typeName));
    }

    private computeCacheKey(typeName: DeclaredTypeName): string {
        return typeName.fernFilepath.join("/") + ":" + typeName.name;
    }
}
