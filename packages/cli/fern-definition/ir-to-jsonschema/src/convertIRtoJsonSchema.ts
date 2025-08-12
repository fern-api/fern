import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-api/ir-sdk/";
import { TaskContext } from "@fern-api/task-context";
import { JSONSchema4 } from "json-schema";
import { convertTypeDeclarationToJsonSchema } from "./converters/convertTypeDeclarationToJsonSchema";
import { JsonSchemaConverterContext } from "./JsonSchemaConverterContext";

export declare namespace convertIRToJsonSchema {
    interface Args {
        ir: IntermediateRepresentation;
        typeId: TypeId;
        typeName?: string;
        context: TaskContext;
    }
}

export function convertIRtoJsonSchema(args: convertIRToJsonSchema.Args): JSONSchema4 {
    const context = new JsonSchemaConverterContext(args.context, args.ir);
    const typeDeclaration = context.getTypeDeclarationForId({ typeId: args.typeId, typeName: args.typeName });
    const schema = convertTypeDeclarationToJsonSchema({
        typeDeclaration,
        context
    });
    return {
        ...schema,
        definitions: context.getDefinitions()
    };
}
