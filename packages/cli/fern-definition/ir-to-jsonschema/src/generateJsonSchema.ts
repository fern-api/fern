import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-api/ir-sdk/";
import { JSONSchema4 } from "json-schema";
import { TaskContext } from "@fern-api/task-context";
import { JsonSchemaConverterContext } from "./JsonSchemaConverterContext";

export declare namespace convertIRToJsonSchema {
    interface Args {
        ir: IntermediateRepresentation;
        typeId: TypeId;
        context: TaskContext;
    }
}

export function convertIRtoJsonSchema(args: convertIRToJsonSchema.Args): JSONSchema4 {
    const context = new JsonSchemaConverterContext(args.context, args.ir);
    const typeDeclaration = context.getTypeDeclarationForId({ typeId: args.typeId });
    return typeDeclaration.shape._visit<JSONSchema4>({
        object: () => {},
        alias: () => {},
        enum: () => {},
        undiscriminatedUnion: () => {},
        union: () => {}
    });
}
