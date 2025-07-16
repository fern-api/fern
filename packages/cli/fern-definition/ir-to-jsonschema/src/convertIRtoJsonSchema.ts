import { JSONSchema4 } from "json-schema";

import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-api/ir-sdk/";
import { TaskContext } from "@fern-api/task-context";

import { JsonSchemaConverterContext } from "./JsonSchemaConverterContext";
import { convertTypeDeclarationToJsonSchema } from "./converters/convertTypeDeclarationToJsonSchema";

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
