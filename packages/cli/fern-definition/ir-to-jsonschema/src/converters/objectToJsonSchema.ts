import { ObjectTypeDeclaration } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { JSONSchema4 } from "json-schema";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export declare namespace convertObjectToJsonSchema {
    interface Args {
        object: ObjectTypeDeclaration;
        context: TaskContext;
    }
}

export function convertObjectToJsonSchema({ object, context }: convertObjectToJsonSchema.Args): JSONSchema4 {
    const properties = object.properties.map((property) => {
        convertTypeReferenceToJsonSchema({ ir, typeId: property.typeId, context });
    });
}
