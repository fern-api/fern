import { DeclaredTypeName, IntermediateRepresentation, Type, TypeReference } from "@fern-fern/ir-model";
import path from "path";
import { StringifiedFernFilepath, stringifyFernFilepath } from "../utils/stringifyFernFilepath";
import { ResolvedType } from "./ResolvedType";

type Filepath = string;
type SimpleTypeName = string;

/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private allTypes: Record<Filepath, Record<SimpleTypeName, Type>> = {};
    private resolvedTypes: Record<StringifiedFernFilepath, Record<SimpleTypeName, ResolvedType>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const type of intermediateRepresentation.types) {
            const typesAtFilepath = (this.allTypes[stringifyFernFilepath(type.name.fernFilepath)] ??= {});
            typesAtFilepath[type.name.name] = type.shape;
        }
        for (const type of intermediateRepresentation.types) {
            this.resolveTypeRecursive({
                typeName: type.name,
            });
        }
    }

    public getTypeDeclarationFromName(typeName: DeclaredTypeName): Type {
        const type = this.allTypes[stringifyFernFilepath(typeName.fernFilepath)]?.[typeName.name];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }
        return type;
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedType {
        const resolvedType = this.resolvedTypes[stringifyFernFilepath(typeName.fernFilepath)]?.[typeName.name];
        if (resolvedType == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }
        return resolvedType;
    }

    public resolveTypeReference(type: TypeReference): ResolvedType {
        return this.resolveTypeDeclaration(Type.alias({ aliasOf: type }));
    }

    public resolveTypeDeclaration(type: Type): ResolvedType {
        return this.resolveTypeDeclarationWithContinuation(type, (typeName) => this.resolveTypeName(typeName));
    }

    public doesTypeExist(typeName: DeclaredTypeName): boolean {
        return this.allTypes[stringifyFernFilepath(typeName.fernFilepath)]?.[typeName.name] != null;
    }

    private resolveTypeRecursive({
        typeName,
        seen = {},
    }: {
        typeName: DeclaredTypeName;
        seen?: Record<Filepath, Set<SimpleTypeName>>;
    }): ResolvedType {
        const seenAtFilepath = seen[stringifyFernFilepath(typeName.fernFilepath)] ?? new Set();
        if (seenAtFilepath.has(typeName.name)) {
            throw new Error("Detected cycle when resolving type: " + typeNameToString(typeName));
        }
        seenAtFilepath.add(typeName.name);

        const type = this.allTypes[stringifyFernFilepath(typeName.fernFilepath)]?.[typeName.name];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }

        const resolvedType = this.resolveTypeDeclarationWithContinuation(type, (typeName) =>
            this.resolveTypeRecursive({
                typeName,
                seen,
            })
        );

        const resolvedTypesAtFilepath = (this.resolvedTypes[stringifyFernFilepath(typeName.fernFilepath)] ??= {});
        resolvedTypesAtFilepath[typeName.name] = resolvedType;

        return resolvedType;
    }

    private resolveTypeDeclarationWithContinuation(
        type: Type,
        resolveNamedType: (typeName: DeclaredTypeName) => ResolvedType
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

function typeNameToString(typeName: DeclaredTypeName) {
    return path.join(stringifyFernFilepath(typeName.fernFilepath), typeName.name);
}
