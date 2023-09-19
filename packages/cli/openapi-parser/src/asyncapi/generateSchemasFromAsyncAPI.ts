import { TaskContext } from "@fern-api/task-context";
import { Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { AsyncAPI } from "../asyncapi";
import { convertSchema } from "../v3/converters/convertSchemas";
import { DummyOpenAPIV3ParserContext } from "../v3/DummyOpenAPIV3ParserContext";

export function generateSchemasFromAsyncAPI(asyncApi: AsyncAPI, taskContext: TaskContext): Record<SchemaId, Schema> {
    const context = new DummyOpenAPIV3ParserContext({
        document: {
            openapi: "3.0.0",
            info: {
                title: "",
                version: "",
            },
            paths: {},
            components: {
                schemas: asyncApi.components?.schemas ?? {},
            },
        },
        taskContext,
    });
    return Object.fromEntries(
        Object.entries(asyncApi.components?.schemas ?? {}).map(([key, schema]) => {
            taskContext.logger.debug(`Converting schema ${key}`);
            return [key, convertSchema(schema, false, context, [key])];
        })
    );
}
