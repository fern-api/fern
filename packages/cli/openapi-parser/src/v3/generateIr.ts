import { TaskContext } from "@fern-api/task-context";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir/_types";
import { OpenAPIV3 } from "openapi-types";
import { convertPathItem } from "./converters/convertPathItem";
import { convertSchema } from "./converters/convertSchemas";
import { convertSecurityScheme } from "./converters/convertSecurityScheme";
import { convertServer } from "./converters/convertServer";

export function generateIr(openApi: OpenAPIV3.Document, taskContext: TaskContext): OpenAPIIntermediateRepresentation {
    return {
        title: openApi.info.title,
        description: openApi.info.description,
        servers: (openApi.servers ?? []).map((server) => convertServer(server)),
        tags: [],
        endpoints: Object.entries(openApi.paths).flatMap(([path, pathItem]) => {
            if (pathItem == null) {
                return [];
            }
            taskContext.logger.debug(`Converting path ${path}`);
            return convertPathItem(path, pathItem, openApi);
        }),
        schemas: Object.fromEntries(
            Object.entries(openApi.components?.schemas ?? {}).map(([key, schema]) => {
                taskContext.logger.debug(`Converting component key=${key}`);
                return [key, convertSchema(schema, false)];
            })
        ),
        securitySchemes: Object.fromEntries(
            Object.entries(openApi.components?.securitySchemes ?? {}).map(([key, securityScheme]) => [
                key,
                convertSecurityScheme(securityScheme),
            ])
        ),
    };
}
