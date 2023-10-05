import { TaskContext } from "@fern-api/task-context";
import { Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AsyncAPI } from "../asyncapi";
import { generateIr } from "../v3/generateIr";

export function generateSchemasFromAsyncAPI(asyncApi: AsyncAPI, taskContext: TaskContext): Record<SchemaId, Schema> {
    const openApiV3: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: {
            title: "",
            version: "",
        },
        paths: {},
        components: {
            schemas: asyncApi.components?.schemas ?? {},
        },
    };
    const openApiIr = generateIr(openApiV3, taskContext);
    return openApiIr.schemas;
}
