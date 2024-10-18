import { TypeReference } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { JSONSchema4 } from "json-schema";

export declare namespace convertTypeReferenceToJsonSchema {
    interface Args {
        typeReference: TypeReference;
        context: TaskContext;
    }
}

export function convertTypeReferenceToJsonSchema({
    typeReference,
    context
}: convertTypeReferenceToJsonSchema.Args): JSONSchema4 {
    typeReference._visit({
        named: ({ typeId }) => {
            return convertIRtoJsonSchema({ ir, typeId, context });
        },
        container: () => {
            return {
                type: "object",
                properties: typeReference.properties.map((property) => {
                    return {
                        [property.name]: convertIRtoJsonSchema({ ir, typeId: property.typeId, context })
                    };
                })
            };
        },
        primitive: () => {
            return {
                type: typeReference.primitive
            };
        },
        unknown: () => {
            return {
                type: "object"
            };
        },
        _other: () => {
            context.failAndThrow(`Unsupported type reference: ${typeReference.type}`);
        }
    });
}
