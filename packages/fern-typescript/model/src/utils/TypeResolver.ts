import { FernFilepath, IntermediateRepresentation, NamedType, Type, TypeReference } from "@fern-api/api";

type Filepath = string;
type SimpleTypeName = string;

export declare namespace TypeResolver {
    export type ResolvedType = "object" | "union" | "primitive" | "container" | "enum" | "void";
}

export class TypeResolver {
    private resolvedTypes: Record<FernFilepath, Record<SimpleTypeName, TypeResolver.ResolvedType>> = {};

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

    public resolveType(typeName: NamedType): TypeResolver.ResolvedType {
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
    }): TypeResolver.ResolvedType {
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

        const resolvedType = Type._visit<TypeResolver.ResolvedType>(type, {
            object: () => "object",
            union: () => "union",
            alias: (alias) =>
                TypeReference._visit<TypeResolver.ResolvedType>(alias.aliasOf, {
                    named: (named) =>
                        this.resolveTypeRecursive({
                            allTypes,
                            typeName: named,
                            seen,
                        }),
                    primitive: () => "primitive",
                    container: () => "container",
                    void: () => "void",
                    unknown: () => {
                        throw new Error("Unkonwn Alias type reference: " + alias.aliasOf._type);
                    },
                }),
            enum: () => "enum",
            unknown: () => {
                throw new Error("Unkonwn Type: " + type._type);
            },
        });

        let resolvedTypesAtFilepath = this.resolvedTypes[typeName.fernFilepath];
        if (resolvedTypesAtFilepath == null) {
            resolvedTypesAtFilepath = {};
            this.resolvedTypes[typeName.fernFilepath] = resolvedTypesAtFilepath;
        }
        resolvedTypesAtFilepath[typeName.name] = resolvedType;

        return resolvedType;
    }
}

function typeNameToString(typeName: NamedType) {
    return `${typeName.fernFilepath}.${typeName.name}`;
}
