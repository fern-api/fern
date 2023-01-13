import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import {
    DeclaredTypeName,
    ResolvedTypeReference,
    ShapeType,
    Type,
    TypeDeclaration,
    TypeReference,
} from "@fern-fern/ir-model/types";
import path from "path";
import { stringifyFernFilepath } from "./stringify-fern-filepath";

type Filepath = string;
type SimpleTypeName = string;

/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private allTypes: Record<Filepath, Record<SimpleTypeName, TypeDeclaration>> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const type of intermediateRepresentation.types) {
            const typesAtFilepath = (this.allTypes[stringifyFernFilepath(type.name.fernFilepath)] ??= {});
            typesAtFilepath[getSimpleTypeName(type.name)] = type;
        }
    }

    public getTypeDeclarationFromName(typeName: DeclaredTypeName): TypeDeclaration {
        const type = this.allTypes[stringifyFernFilepath(typeName.fernFilepath)]?.[getSimpleTypeName(typeName)];
        if (type == null) {
            throw new Error("Type not found: " + typeNameToString(typeName));
        }
        return type;
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        const declaration = this.getTypeDeclarationFromName(typeName);
        return this.resolveTypeDeclaration(typeName, declaration.shape);
    }

    public resolveTypeReference(type: TypeReference): ResolvedTypeReference {
        return TypeReference._visit<ResolvedTypeReference>(type, {
            named: (typeName) => this.resolveTypeName(typeName),
            container: ResolvedTypeReference.container,
            primitive: ResolvedTypeReference.primitive,
            unknown: ResolvedTypeReference.unknown,
            _unknown: () => {
                throw new Error("Unknown type reference type: " + type._type);
            },
        });
    }

    public resolveTypeDeclaration(typeName: DeclaredTypeName, declaration: Type): ResolvedTypeReference {
        return Type._visit<ResolvedTypeReference>(declaration, {
            alias: ({ resolvedType }) => resolvedType,
            enum: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Enum,
                }),
            object: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Object,
                }),
            union: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Union,
                }),
            _unknown: () => {
                throw new Error("Unknown type declaration type: " + declaration._type);
            },
        });
    }

    public doesTypeExist(typeName: DeclaredTypeName): boolean {
        return this.allTypes[stringifyFernFilepath(typeName.fernFilepath)]?.[getSimpleTypeName(typeName)] != null;
    }
}

function typeNameToString(typeName: DeclaredTypeName) {
    return path.join(...typeName.fernFilepath.map((part) => part.originalName), typeName.name.originalName);
}

function getSimpleTypeName(typeName: DeclaredErrorName): SimpleTypeName {
    return typeName.name.originalName;
}
