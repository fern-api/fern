import { IntermediateRepresentation, TypeDeclaration } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

export class JsonSchemaConverterContext {
    constructor(private readonly context: TaskContext, private readonly ir: IntermediateRepresentation) {}

    public getTypeDeclarationForId({
        typeName,
        typeId
    }: {
        ir: IntermediateRepresentation;
        typeName?: string;
    }): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            if (typeName != null) {
                this.context.logger.error(`Type ${typeName} not found`);
            } else {
                // context.logger.error(`Type declaration not found for ${typeName}`);
            }
            return this.context.failAndThrow();
        }
        return typeDeclaration;
    }
}
