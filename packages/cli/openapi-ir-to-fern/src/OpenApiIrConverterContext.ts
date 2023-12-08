import { Logger } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { OpenAPIIntermediateRepresentation, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { FernDefinitionBuilder, FernDefinitionBuilderImpl } from "./FernDefnitionBuilder";

export class OpenApiIrConverterContext {
    public logger: Logger;
    public taskContext: TaskContext;
    public ir: OpenAPIIntermediateRepresentation;
    public builder: FernDefinitionBuilder;

    constructor({ taskContext, ir }: { taskContext: TaskContext; ir: OpenAPIIntermediateRepresentation }) {
        this.logger = taskContext.logger;
        this.taskContext = taskContext;
        this.ir = ir;
        this.builder = new FernDefinitionBuilderImpl(ir);
    }

    public getSchema(id: SchemaId): Schema {
        const schema = this.ir.schemas[id];
        if (schema == null) {
            return this.taskContext.failAndThrow(`Unexpected error. Failed to find schema ${id}`);
        }
        return schema;
    }
}
