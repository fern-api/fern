import { SingleUnionType, TypeName, TypeReference } from "@fern/ir-generation";
import { SourceFile, ts } from "ts-morph";
import { generateTypeNameReference, generateTypeReference } from "../../utils/generateTypeReference";
import { TypeResolver } from "../../utils/TypeResolver";
import { uppercaseFirstLetter } from "../../utils/uppercaseFirstLetter";

export const DISCRIMINANT = "type";

export function getKeyForUnion({ discriminantValue }: SingleUnionType): string {
    return uppercaseFirstLetter(discriminantValue);
}

export function getBaseTypeForSingleUnionType({
    singleUnionType,
    typeResolver,
    file,
}: {
    singleUnionType: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
}): ts.TypeNode | undefined {
    return visitTypeReference(singleUnionType.valueType, typeResolver, {
        namedObject: (named) => {
            return generateTypeNameReference(named, file);
        },
        nonObject: () => {
            return generateTypeReference(singleUnionType.valueType, file);
        },
        void: () => undefined,
    });
}

export function visitTypeReference<R>(
    typeReference: TypeReference,
    typeResolver: TypeResolver,
    visitor: TypeReferenceVisitor<R>
): R {
    return TypeReference.visit(typeReference, {
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
        unknown: ({ type }) => {
            throw new Error("Unexpected type reference: " + type);
        },
    });
}

export interface TypeReferenceVisitor<R> {
    namedObject: (typeName: TypeName) => R;
    nonObject: () => R;
    void: () => R;
}
