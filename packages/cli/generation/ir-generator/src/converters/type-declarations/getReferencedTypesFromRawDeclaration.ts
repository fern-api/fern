import { DeclaredTypeName } from "@fern-api/ir-sdk";
import { RawSchemas, recursivelyVisitRawTypeReference, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { parseTypeName } from "../../utils/parseTypeName";

interface SeenTypeNames {
    addTypeName: (typeName: DeclaredTypeName) => void;
    hasTypeNameBeenSeen: (typeName: DeclaredTypeName) => boolean;
}

export function getReferencedTypesFromRawDeclaration({
    typeDeclaration,
    file,
    typeResolver,
    seenTypeNames = new SeenTypeNamesImpl()
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    seenTypeNames?: SeenTypeNames;
}): DeclaredTypeName[] {
    const rawTypeReferences = visitRawTypeDeclaration<string[]>(typeDeclaration, {
        alias: (aliasDeclaration) => {
            return [typeof aliasDeclaration === "string" ? aliasDeclaration : aliasDeclaration.type];
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
        discriminatedUnion: (unionDeclaration) => {
            return Object.values(unionDeclaration.union).reduce<string[]>((types, singleUnionType) => {
                const rawType = typeof singleUnionType === "string" ? singleUnionType : singleUnionType.type;
                if (typeof rawType === "string") {
                    types.push(rawType);
                }
                return types;
            }, []);
        },
        undiscriminatedUnion: (unionDeclaration) => {
            return Object.values(unionDeclaration.union).reduce<string[]>((types, unionMember) => {
                const rawType = typeof unionMember === "string" ? unionMember : unionMember.type;
                if (typeof rawType === "string") {
                    types.push(rawType);
                }
                return types;
            }, []);
        },
        enum: () => []
    });

    const referencedTypes: DeclaredTypeName[] = [];

    for (const rawTypeReference of rawTypeReferences) {
        const rawNames = recursivelyVisitRawTypeReference<string[]>({
            type: rawTypeReference,
            _default: undefined,
            validation: undefined,
            visitor: {
                primitive: () => [],
                map: ({ keyType, valueType }) => [...keyType, ...valueType],
                list: (valueType) => valueType,
                optional: (valueType) => valueType,
                set: (valueType) => valueType,
                named: (name) => [name],
                literal: () => [],
                unknown: () => []
            }
        });

        for (const rawName of rawNames) {
            const parsedTypeName = parseTypeName({ typeName: rawName, file });
            if (!seenTypeNames.hasTypeNameBeenSeen(parsedTypeName)) {
                seenTypeNames.addTypeName(parsedTypeName);

                referencedTypes.push(parsedTypeName);

                const maybeDeclaration = typeResolver.getDeclarationOfNamedTypeOrThrow({
                    referenceToNamedType: rawName,
                    file
                });

                referencedTypes.push(
                    ...getReferencedTypesFromRawDeclaration({
                        typeDeclaration: maybeDeclaration.declaration,
                        file: maybeDeclaration.file,
                        typeResolver,
                        seenTypeNames
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
        return (
            typeName.fernFilepath.allParts.map((part) => part.originalName).join("/") + ":" + typeName.name.originalName
        );
    }
}
