import { RawSchemas, visitRawTypeReference } from "@fern-api/yaml-schema";
import { ContainerType, TypeReference } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../FernFileContext";
import { parseTypeName } from "./parseTypeName";

export declare namespace parseInlineType {
    export interface Args {
        type: string;
        file: FernFileContext;
    }
}

export function parseInlineType({ type, file }: parseInlineType.Args): TypeReference {
    return visitRawTypeReference<TypeReference>(type, {
        primitive: TypeReference.primitive,
        unknown: TypeReference.unknown,
        void: TypeReference.void,
        map: ({ keyType, valueType }) => TypeReference.container(ContainerType.map({ keyType, valueType })),
        list: (valueType) => TypeReference.container(ContainerType.list(valueType)),
        set: (valueType) => TypeReference.container(ContainerType.set(valueType)),
        optional: (valueType) => TypeReference.container(ContainerType.optional(valueType)),
        named: (namedType) =>
            TypeReference.named(
                parseTypeName({
                    typeName: namedType,
                    file,
                })
            ),
    });
}

export type TypeReferenceParser = (type: RawSchemas.TypeReferenceSchema) => TypeReference;

export function createTypeReferenceParser(file: FernFileContext): TypeReferenceParser {
    return (type) => {
        const typeAsString = typeof type === "string" ? type : type.type;
        return parseInlineType({ type: typeAsString, file });
    };
}
