import { FernFilepath, IntermediateRepresentation, Type, TypeName, TypeReference } from "@fern-api/api";
import { ResolvedType } from "./ResolvedType";

type Filepath = string;
type SimpleTypeName = string;

/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private allTypes: Record<Filepath, Record<SimpleTypeName, Type>> = {};
    private resolvedTypes: Record<FernFilepath, Record<SimpleTypeName, ResolvedType>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const type of intermediateRepresentation.types) {
            const typesAtFilepath = (this.allTypes[type.name.fernFilepath] ??= {});
            typesAtFilepath[type.name.name] = type.shape;
        }
        for (const type of intermediateRepresentation.types) {
            this.resolveTypeRecursive({
                typeName: type.name,
            });
        }
    }

    public getTypeDefinitionFromName(typeName: TypeName): Type {
        const type = this.allTypes[typeName.fernFilepath]?.[typeName.name];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }
        return type;
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
        typeName,
        seen = {},
    }: {
        typeName: TypeName;
        seen?: Record<Filepath, Set<SimpleTypeName>>;
    }): ResolvedType {
        const seenAtFilepath = seen[typeName.fernFilepath] ?? new Set();
        if (seenAtFilepath.has(typeName.name)) {
            throw new Error("Detected cycle when resolving type: " + typeNameToString(typeName));
        }
        seenAtFilepath.add(typeName.name);

        const type = this.allTypes[typeName.fernFilepath]?.[typeName.name];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }

        const resolvedType = this.resolveTypeDefinitionWithContinuation(type, (typeName) =>
            this.resolveTypeRecursive({
                typeName,
                seen,
            })
        );

        const resolvedTypesAtFilepath = (this.resolvedTypes[typeName.fernFilepath] ??= {});
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
