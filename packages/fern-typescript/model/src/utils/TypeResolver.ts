import { IntermediateRepresentation, Type, TypeName, TypeReference } from "@fern/ir-generation";

type Filepath = string;
type SimpleTypeName = string;

export declare namespace TypeResolver {
    export type ResolvedType = "object" | "union" | "primitive" | "container" | "enum" | "void";
}

export class TypeResolver {
    private resolvedTypes: Record<Filepath, Record<SimpleTypeName, TypeResolver.ResolvedType>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        const allTypes: Record<Filepath, Record<SimpleTypeName, Type>> = {};
        for (const otherType of intermediateRepresentation.types) {
            let typesAtFilepath = allTypes[otherType.name.filepath];
            if (typesAtFilepath == null) {
                typesAtFilepath = {};
                allTypes[otherType.name.filepath] = typesAtFilepath;
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

    public resolveType(typeName: TypeName): TypeResolver.ResolvedType {
        const resolvedType = this.resolvedTypes[typeName.filepath]?.[typeName.name];
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
        typeName: TypeName;
        seen?: Record<Filepath, Set<SimpleTypeName>>;
    }): TypeResolver.ResolvedType {
        let seenAtFilepath = seen[typeName.filepath];
        if (seenAtFilepath == null) {
            seenAtFilepath = new Set();
            seen[typeName.filepath] = seenAtFilepath;
        } else if (seenAtFilepath.has(typeName.name)) {
            throw new Error("Detected cycle when resolving type: " + typeNameToString(typeName));
        }
        seenAtFilepath.add(typeName.name);

        const type = allTypes[typeName.filepath]?.[typeName.name];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }

        const resolvedType = Type.visit<TypeResolver.ResolvedType>(type, {
            object: () => "object",
            union: () => "union",
            alias: (alias) =>
                TypeReference.visit<TypeResolver.ResolvedType>(alias.aliasOf, {
                    named: (named) =>
                        this.resolveTypeRecursive({
                            allTypes,
                            typeName: named,
                            seen,
                        }),
                    primitive: () => "primitive",
                    container: () => "container",
                    void: () => "void",
                    unknown: ({ type }) => {
                        throw new Error("Unkonwn Alias type reference: " + type);
                    },
                }),
            enum: () => "enum",
            unknown: ({ type }) => {
                throw new Error("Unkonwn Type: " + type);
            },
        });

        let resolvedTypesAtFilepath = this.resolvedTypes[typeName.filepath];
        if (resolvedTypesAtFilepath == null) {
            resolvedTypesAtFilepath = {};
            this.resolvedTypes[typeName.filepath] = resolvedTypesAtFilepath;
        }
        resolvedTypesAtFilepath[typeName.name] = resolvedType;

        return resolvedType;
    }
}

function typeNameToString(typeName: TypeName) {
    return `${typeName.filepath}.${typeName.name}`;
}
