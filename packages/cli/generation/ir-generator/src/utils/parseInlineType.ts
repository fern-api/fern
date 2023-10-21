import { RawSchemas, recursivelyVisitRawTypeReference } from "@fern-api/yaml-schema";
import { TypeReference } from "@fern-fern/ir-sdk/api";
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
        primitive: (primitive) => {
            return {
                _type: "primitive",
                primitive,
            };
        },
        unknown: () => {
            return {
                _type: "unknown",
            };
        },
        map: ({ keyType, valueType }) => {
            return {
                _type: "container",
                container: {
                    _type: "map",
                    keyType,
                    valueType,
                },
            };
        },
        list: (valueType) => {
            return {
                _type: "container",
                container: {
                    _type: "list",
                    list: valueType,
                },
            };
        },
        set: (valueType) => {
            return {
                _type: "container",
                container: {
                    _type: "set",
                    set: valueType,
                },
            };
        },
        optional: (valueType) => {
            return {
                _type: "container",
                container: {
                    _type: "optional",
                    optional: valueType,
                },
            };
        },
        literal: (literalValue) => {
            return {
                _type: "container",
                container: {
                    _type: "literal",
                    literal: {
                        type: "string",
                        string: literalValue,
                    },
                },
            };
        },
        named: (namedType) => {
            const parsedTypeName = parseTypeName({
                typeName: namedType,
                file,
            });
            return {
                _type: "named",
                fernFilepath: parsedTypeName.fernFilepath,
                name: parsedTypeName.name,
                typeId: parsedTypeName.typeId,
            };
        },
    });
}

export type TypeReferenceParser = (type: RawSchemas.TypeReferenceSchema) => TypeReference;

export function createTypeReferenceParser(file: FernFileContext): TypeReferenceParser {
    return (type) => {
        const typeAsString = typeof type === "string" ? type : type.type;
        return parseInlineType({ type: typeAsString, file });
    };
}
