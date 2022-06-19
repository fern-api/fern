import { NamedType, SingleUnionType, TypeReference } from "@fern-api/api";
import { getNamedTypeReference, getTypeReference, ResolvedType, TypeResolver } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { Directory, SourceFile, ts } from "ts-morph";

export const FORCE_USE_MODEL_NAMESPACE_IMPORT = true;

export function getKeyForUnion({ discriminantValue }: SingleUnionType): string {
    return upperFirst(discriminantValue);
}

export interface ResolvedSingleUnionType {
    type: ts.TypeNode;
    isExtendable: boolean;
}

export function getResolvedTypeForSingleUnionType({
    singleUnionType,
    typeResolver,
    file,
    baseDirectory,
    baseDirectoryType,
}: {
    singleUnionType: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
    baseDirectory: Directory;
    baseDirectoryType: getNamedTypeReference.Args["baseDirectoryType"];
}): ResolvedSingleUnionType | undefined {
    return visitResolvedTypeReference<ResolvedSingleUnionType | undefined>(singleUnionType.valueType, typeResolver, {
        namedObject: (named) => {
            return {
                type: getNamedTypeReference({
                    typeName: named,
                    referencedIn: file,
                    baseDirectory,
                    baseDirectoryType,
                    forceUseNamespaceImport: FORCE_USE_MODEL_NAMESPACE_IMPORT,
                }),
                isExtendable: true,
            };
        },
        nonObject: () => {
            return {
                type: getTypeReference({
                    reference: singleUnionType.valueType,
                    referencedIn: file,
                    baseDirectory,
                    baseDirectoryType,
                    forceUseNamespaceImport: FORCE_USE_MODEL_NAMESPACE_IMPORT,
                }),
                isExtendable: false,
            };
        },
        void: () => undefined,
    });
}

export function visitResolvedTypeReference<R>(
    typeReference: TypeReference,
    typeResolver: TypeResolver,
    visitor: TypeReferenceVisitor<R>
): R {
    return TypeReference._visit(typeReference, {
        named: (named) => {
            const resolved = typeResolver.resolveNamedType(named);
            return ResolvedType._visit(resolved, {
                object: () => visitor.namedObject(named),
                union: visitor.nonObject,
                enum: visitor.nonObject,
                container: visitor.nonObject,
                primitive: visitor.nonObject,
                void: visitor.void,
                _unknown: () => {
                    throw new Error("Unexpected resolved type: " + resolved._type);
                },
            });
        },
        primitive: () => visitor.nonObject(),
        container: () => visitor.nonObject(),
        void: () => visitor.void(),
        _unknown: () => {
            throw new Error("Unexpected type reference: " + typeReference._type);
        },
    });
}

export interface TypeReferenceVisitor<R> {
    namedObject: (typeName: NamedType) => R;
    nonObject: () => R;
    void: () => R;
}
