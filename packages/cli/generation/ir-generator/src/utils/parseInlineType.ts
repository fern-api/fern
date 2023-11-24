import { RawSchemas, recursivelyVisitRawTypeReference } from "@fern-api/yaml-schema";
import { ContainerType, TypeReference } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../FernFileContext";
import { parseTypeName } from "./parseTypeName";

export declare namespace parseInlineType {
    export interface Args {
        type: string;
        file: FernFileContext;
    }
}

export function parseInlineType({ type, file }: parseInlineType.Args): TypeReference {
    return recursivelyVisitRawTypeReference<TypeReference>(type, {
        primitive: TypeReference.primitive,
        unknown: TypeReference.unknown,
        map: ({ keyType, valueType }) => TypeReference.container(ContainerType.map({ keyType, valueType })),
        list: (valueType) => TypeReference.container(ContainerType.list(valueType)),
        set: (valueType) => TypeReference.container(ContainerType.set(valueType)),
        optional: (valueType) => TypeReference.container(ContainerType.optional(valueType)),
        literal: (literal) => TypeReference.container(ContainerType.literal(literal)),
        named: (namedType) =>
            TypeReference.named(
                parseTypeName({
                    typeName: namedType,
                    file
                })
            )
    });
}

export type TypeReferenceParser = (type: RawSchemas.TypeReferenceSchema) => TypeReference;

export function createTypeReferenceParser(file: FernFileContext): TypeReferenceParser {
    return (type) => {
        const typeAsString = typeof type === "string" ? type : type.type;
        return parseInlineType({ type: typeAsString, file });
    };
}
