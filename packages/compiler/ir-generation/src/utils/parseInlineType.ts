import { ContainerType, FernFilepath, PrimitiveType, TypeReference } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { parseTypeName } from "./parseTypeName";

const MAP_REGEX = /map<\s*(.*)\s*,\s*(.*)\s*>/;
const LIST_REGEX = /list<\s*(.*)\s*>/;
const SET_REGEX = /set<\s*(.*)\s*>/;
const OPTIONAL_REGEX = /optional<\s*(.*)\s*>/;

export declare namespace parseInlineType {
    export interface Args {
        type: string;
        fernFilepath: FernFilepath;
        imports: Record<string, string>;
    }
}

export function parseInlineType({ type, fernFilepath, imports }: parseInlineType.Args): TypeReference {
    function parseInlineTypeRecursive(typeToRecurse: string) {
        return parseInlineType({ type: typeToRecurse, fernFilepath, imports });
    }

    const mapMatch = type.match(MAP_REGEX);
    if (mapMatch != null && mapMatch[1] != null && mapMatch[2] != null) {
        return TypeReference.container(
            ContainerType.map({
                keyType: parseInlineTypeRecursive(mapMatch[1]),
                valueType: parseInlineTypeRecursive(mapMatch[2]),
            })
        );
    }

    const listMatch = type.match(LIST_REGEX);
    if (listMatch != null && listMatch[1] != null) {
        return TypeReference.container(ContainerType.list(parseInlineTypeRecursive(listMatch[1])));
    }

    const setMatch = type.match(SET_REGEX);
    if (setMatch != null && setMatch[1] != null) {
        return TypeReference.container(ContainerType.set(parseInlineTypeRecursive(setMatch[1])));
    }

    const optionalMatch = type.match(OPTIONAL_REGEX);
    if (optionalMatch != null && optionalMatch[1] != null) {
        return TypeReference.container(ContainerType.optional(parseInlineTypeRecursive(optionalMatch[1])));
    }

    switch (type) {
        case "integer":
            return TypeReference.primitive(PrimitiveType.Integer);
        case "double":
            return TypeReference.primitive(PrimitiveType.Double);
        case "long":
            return TypeReference.primitive(PrimitiveType.Long);
        case "string":
            return TypeReference.primitive(PrimitiveType.String);
        case "boolean":
            return TypeReference.primitive(PrimitiveType.Boolean);
    }

    return TypeReference.named(
        parseTypeName({
            typeName: type,
            fernFilepath,
            imports,
        })
    );
}

export function createInlinableTypeParser(
    args: Omit<parseInlineType.Args, "type">
): (type: RawSchemas.SimpleInlinableType) => TypeReference {
    return (type) => {
        const typeAsString = typeof type === "string" ? type : type.type;
        if (typeAsString == null) {
            return TypeReference.void();
        }
        return parseInlineType({ ...args, type: typeAsString });
    };
}
