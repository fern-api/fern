import { FernFilepath, IntermediateRepresentation, Type, TypeName, TypeReference } from "@fern-api/api";
import { ResolvedType } from "./types";

type Filepath = string;
type SimpleTypeName = string;

/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private resolvedTypes: Record<FernFilepath, Record<SimpleTypeName, ResolvedType>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        const allTypes: Record<Filepath, Record<SimpleTypeName, Type>> = {};

        for (const type of intermediateRepresentation.types) {
            let typesAtFilepath = allTypes[type.name.fernFilepath];
            if (typesAtFilepath == null) {
                typesAtFilepath = {};
                allTypes[type.name.fernFilepath] = typesAtFilepath;
            }

            typesAtFilepath[type.name.name] = type.shape;
        }
        for (const type of intermediateRepresentation.types) {
            this.resolveTypeRecursive({
                allTypes,
                typeName: type.name,
            });
        }
    }

    public resolveTypeName(typeName: TypeName): ResolvedType {
        const resolvedType = this.resolvedTypes[typeName.fernFilepath]?.[typeName.name];
        if (resolvedType == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }
        return resolvedType;
    }

    public resolveTypeReference(type: TypeReference): ResolvedType {
        return this.resolveTypeDefinition(Type.alias({ aliasOf: type }));
    }

    public resolveTypeDefinition(type: Type): ResolvedType {
        return this.resolveTypeDefinitionWithContinuation(type, (typeName) => this.resolveTypeName(typeName));
    }

    private resolveTypeRecursive({
        allTypes,
        typeName,
        seen = {},
    }: {
        allTypes: Record<Filepath, Record<SimpleTypeName, Type>>;
        typeName: TypeName;
        seen?: Record<Filepath, Set<SimpleTypeName>>;
    }): ResolvedType {
        let seenAtFilepath = seen[typeName.fernFilepath];
        if (seenAtFilepath == null) {
            seenAtFilepath = new Set();
            seen[typeName.fernFilepath] = seenAtFilepath;
        } else if (seenAtFilepath.has(typeName.name)) {
            throw new Error("Detected cycle when resolving type: " + typeNameToString(typeName));
        }
        seenAtFilepath.add(typeName.name);

        const type = allTypes[typeName.fernFilepath]?.[typeName.name];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }

        const resolvedType = this.resolveTypeDefinitionWithContinuation(type, (typeName) =>
            this.resolveTypeRecursive({
                allTypes,
                typeName,
                seen,
            })
        );

        let resolvedTypesAtFilepath = this.resolvedTypes[typeName.fernFilepath];
        if (resolvedTypesAtFilepath == null) {
            resolvedTypesAtFilepath = {};
            this.resolvedTypes[typeName.fernFilepath] = resolvedTypesAtFilepath;
        }
        resolvedTypesAtFilepath[typeName.name] = resolvedType;

        return resolvedType;
    }

    private resolveTypeDefinitionWithContinuation(
        type: Type,
        resolveNamedType: (typeName: TypeName) => ResolvedType
    ): ResolvedType {
        return Type._visit<ResolvedType>(type, {
            object: ResolvedType.object,
            union: ResolvedType.union,
            alias: (alias) =>
                TypeReference._visit<ResolvedType>(alias.aliasOf, {
                    named: resolveNamedType,
                    primitive: ResolvedType.primitive,
                    container: ResolvedType.container,
                    void: ResolvedType.void,
                    unknown: ResolvedType.unknown,
                    _unknown: () => {
                        throw new Error("Unkonwn Alias type reference: " + alias.aliasOf._type);
                    },
                }),
            enum: ResolvedType.enum,
            _unknown: () => {
                throw new Error("Unkonwn Type: " + type._type);
            },
        });
    }
}

function typeNameToString(typeName: TypeName) {
    return `${typeName.fernFilepath}.${typeName.name}`;
}
