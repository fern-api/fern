import { RawSchemas, recursivelyVisitRawTypeReference } from "@fern-api/fern-definition-schema";
import { ContainerType, TypeReference } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { parseTypeName } from "./parseTypeName";

export declare namespace parseInlineType {
    export interface Args {
        type: string;
        file: FernFileContext;
        _default: unknown | undefined;
        validation: RawSchemas.ValidationSchema | undefined;
    }
}

export function parseInlineType({ type, file, _default, validation }: parseInlineType.Args): TypeReference {
    return recursivelyVisitRawTypeReference<TypeReference>({
        type,
        _default,
        validation,
        visitor: {
            primitive: TypeReference.primitive,
            unknown: TypeReference.unknown,
            map: ({ keyType, valueType }) => TypeReference.container(ContainerType.map({ keyType, valueType })),
            list: (valueType) => TypeReference.container(ContainerType.list(valueType)),
            set: (valueType) => TypeReference.container(ContainerType.set(valueType)),
            optional: (valueType) => TypeReference.container(ContainerType.optional(valueType)),
            literal: (literal) => TypeReference.container(ContainerType.literal(literal)),
            named: (namedType) =>
                TypeReference.named({
                    ...parseTypeName({
                        typeName: namedType,
                        file
                    }),
                    default: undefined,
                    inline: undefined
                })
        }
    });
}

export type TypeReferenceParser = (type: RawSchemas.TypeReferenceSchema) => TypeReference;

export function createTypeReferenceParser(file: FernFileContext): TypeReferenceParser {
    return (type) => {
        if (typeof type === "string") {
            return parseInlineType({ type, _default: undefined, validation: undefined, file });
        }
        return parseInlineType({
            type: type.type,
            _default: type.default,
            validation: type.validation,
            file
        });
    };
}
