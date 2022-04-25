import { NamedType, SingleUnionType, TypeReference } from "@fern-api/api";
import { capitalizeFirstLetter, generateTypeNameReference, generateTypeReference } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { TypeResolver } from "../../utils/TypeResolver";

export function getKeyForUnion({ discriminantValue }: SingleUnionType): string {
    return capitalizeFirstLetter(discriminantValue);
}

export function getBaseTypeForSingleUnionType({
    singleUnionType,
    typeResolver,
    file,
    modelDirectory,
}: {
    singleUnionType: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): ts.TypeNode | undefined {
    return visitResolvedTypeReference(singleUnionType.valueType, typeResolver, {
        namedObject: (named) => {
            return generateTypeNameReference({
                typeName: named,
                referencedIn: file,
                modelDirectory,
            });
        },
        nonObject: () => {
            return generateTypeReference({
                reference: singleUnionType.valueType,
                referencedIn: file,
                modelDirectory,
            });
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
            const resolved = typeResolver.resolveType(named);
            switch (resolved) {
                case "object": {
                    return visitor.namedObject(named);
                }
                case "container":
                case "primitive":
                case "enum":
                case "union":
                    return visitor.nonObject();
                case "void":
                    return visitor.void();
            }
        },
        primitive: () => visitor.nonObject(),
        container: () => visitor.nonObject(),
        void: () => visitor.void(),
        unknown: () => {
            throw new Error("Unexpected type reference: " + typeReference._type);
        },
    });
}

export interface TypeReferenceVisitor<R> {
    namedObject: (typeName: NamedType) => R;
    nonObject: () => R;
    void: () => R;
}
