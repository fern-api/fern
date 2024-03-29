import { Logger } from "@fern-api/logger";
import { OpenApiIntermediateRepresentation, Schema, SchemaId } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernDefinitionBuilder, FernDefinitionBuilderImpl } from "./FernDefnitionBuilder";

export class OpenApiIrConverterContext {
    public logger: Logger;
    public taskContext: TaskContext;
    public ir: OpenApiIntermediateRepresentation;
    public builder: FernDefinitionBuilder;
    private defaultServerName: string | undefined = undefined;

    constructor({ taskContext, ir }: { taskContext: TaskContext; ir: OpenApiIntermediateRepresentation }) {
        this.logger = taskContext.logger;
        this.taskContext = taskContext;
        this.ir = ir;
        this.builder = new FernDefinitionBuilderImpl(ir, false);
    }

    public getSchema(id: SchemaId): Schema {
        const schema = this.ir.schemas[id];
        if (schema == null) {
            return this.taskContext.failAndThrow(`Unexpected error. Failed to find schema ${id}`);
        }
        return schema;
    }

    /**
     * Returns the default server URL. This URL should only be set for multi-url cases.
     */
    public getOrThrowDefaultServerName(): string {
        if (this.defaultServerName == null) {
            return this.taskContext.failAndThrow(
                "Please provide a server URL in the servers block or add a server to every operation"
            );
        }
        return this.defaultServerName;
    }

    /**
     * Sets the default server URL. This URL should only be set for multi-url cases.
     */
    public setDefaultServerName(name: string): void {
        this.defaultServerName = name;
    }
}
