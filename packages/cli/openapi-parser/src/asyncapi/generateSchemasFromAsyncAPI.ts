import { TaskContext } from "@fern-api/task-context";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";
import { AsyncAPI } from "../asyncapi";
import { generateIr } from "../v3/generateIr";
import { isReferenceObject } from "../v3/utils/isReferenceObject";

export function generateSchemasFromAsyncAPI(asyncApi: AsyncAPI, taskContext: TaskContext): Record<SchemaId, Schema> {
    const openApiV3: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: {
            title: "",
            version: "",
        },
        paths: {},
        components: {
            schemas: {
                ...Object.fromEntries(
                    Object.entries(asyncApi.components?.messages ?? {}).map(([messageId, message]) => {
                        if (isReferenceObject(message.payload)) {
                            return [];
                        }
                        return [messageId, message.payload];
                    })
                ),
                ...asyncApi.components?.schemas,
            },
        },
    };
    const openApiIr = generateIr(openApiV3, taskContext);
    return openApiIr.schemas;
}
