import { FernFilepath, IntermediateRepresentation, NamedType, Type, TypeReference } from "@fern-api/api";
import { ResolvedType } from "./types";

type Filepath = string;
type SimpleTypeName = string;

/**
 * TypeResolver converts a NamedType to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private resolvedTypes: Record<FernFilepath, Record<SimpleTypeName, ResolvedType>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        const allTypes: Record<Filepath, Record<SimpleTypeName, Type>> = {};
        for (const otherType of intermediateRepresentation.types) {
            let typesAtFilepath = allTypes[otherType.name.fernFilepath];
            if (typesAtFilepath == null) {
                typesAtFilepath = {};
                allTypes[otherType.name.fernFilepath] = typesAtFilepath;
            }

            typesAtFilepath[otherType.name.name] = otherType.shape;
        }

        for (const otherType of intermediateRepresentation.types) {
            this.resolveTypeRecursive({
                allTypes,
                typeName: otherType.name,
            });
        }
    }

    public resolveNamedType(typeName: NamedType): ResolvedType {
        const resolvedType = this.resolvedTypes[typeName.fernFilepath]?.[typeName.name];
        if (resolvedType == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }
        return resolvedType;
    }

    private resolveTypeRecursive({
        allTypes,
        typeName,
        seen = {},
    }: {
        allTypes: Record<Filepath, Record<SimpleTypeName, Type>>;
        typeName: NamedType;
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

        const resolvedType = this.resolveType(type, allTypes, seen);

        let resolvedTypesAtFilepath = this.resolvedTypes[typeName.fernFilepath];
        if (resolvedTypesAtFilepath == null) {
            resolvedTypesAtFilepath = {};
            this.resolvedTypes[typeName.fernFilepath] = resolvedTypesAtFilepath;
        }
        resolvedTypesAtFilepath[typeName.name] = resolvedType;

        return resolvedType;
    }

    private resolveType(
        type: Type,
        allTypes: Record<Filepath, Record<SimpleTypeName, Type>>,
        seen: Record<Filepath, Set<SimpleTypeName>>
    ): ResolvedType {
        return Type._visit<ResolvedType>(type, {
            object: ResolvedType.object,
            union: ResolvedType.union,
            alias: (alias) =>
                TypeReference._visit<ResolvedType>(alias.aliasOf, {
                    named: (named) =>
                        this.resolveTypeRecursive({
                            allTypes,
                            typeName: named,
                            seen,
                        }),
                    primitive: ResolvedType.primitive,
                    container: ResolvedType.container,
                    void: ResolvedType.void,
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

function typeNameToString(typeName: NamedType) {
    return `${typeName.fernFilepath}.${typeName.name}`;
}
