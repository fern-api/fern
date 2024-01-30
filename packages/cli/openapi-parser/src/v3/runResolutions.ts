import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { DummyOpenAPIV3ParserContext } from "./DummyOpenAPIV3ParserContext";
import { getFernResolutions } from "./extensions/getFernResolutions";

export function runResolutions({
    openapi,
    taskContext
}: {
    openapi: OpenAPIV3.Document;
    taskContext: TaskContext;
}): OpenAPIV3.Document {
    const dummyContext = new DummyOpenAPIV3ParserContext({ document: openapi, taskContext });
    const resolutions = getFernResolutions(openapi);
    if (resolutions == null) {
        return openapi;
    }
    for (const resolution of resolutions) {
        for (const resolutionPath of resolution.resolutions) {
            const resolvedSchema = dummyContext.resolveSchema(resolutionPath);
            if (resolvedSchema == null) {
                throw new Error(`Could not find schema for resolution path ${resolutionPath}`);
            }
            openapi.components.schemas[resolution.name] = resolvedSchema;
        }
    }
}

function resolve(ref: string): OpenAPIV3.SchemaObject {
    const keys = ref.split("/");
    const schema = this.openapi;
    for (const key of keys) {
        if (schema[key] == null) {
            throw new Error(`Could not resolve ${ref}`);
        }
        schema = schema[key];
    }
}
