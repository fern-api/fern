import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas, visitRawTypeReference } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { ContainerType, TypeReference } from "@fern-fern/ir-model/types";
import { parseTypeName } from "./parseTypeName";

export declare namespace parseInlineType {
    export interface Args {
        type: string;
        fernFilepath: FernFilepath;
        imports: Record<string, RelativeFilePath>;
    }
}

export function parseInlineType({ type, fernFilepath, imports }: parseInlineType.Args): TypeReference {
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
                    fernFilepath,
                    imports,
                })
            ),
    });
}

export type TypeReferenceParser = (type: RawSchemas.TypeReferenceSchema) => TypeReference;

export function createTypeReferenceParser(args: Omit<parseInlineType.Args, "type">): TypeReferenceParser {
    return (type) => {
        const typeAsString = typeof type === "string" ? type : type.type;
        return parseInlineType({ ...args, type: typeAsString });
    };
}
