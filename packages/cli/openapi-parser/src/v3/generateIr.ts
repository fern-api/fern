import { TaskContext } from "@fern-api/task-context";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir/_types";
import { OpenAPIV3 } from "openapi-types";
import { convertPathItem } from "./converters/convertPathItem";
import { convertSchema } from "./converters/convertSchemas";
import { convertSecurityScheme } from "./converters/convertSecurityScheme";
import { convertServer } from "./converters/convertServer";
import { getVariableDefinitions } from "./extensions/getVariableDefinitions";
import { OpenAPIV3ParserContext } from "./OpenAPIV3ParserContext";

export function generateIr(openApi: OpenAPIV3.Document, taskContext: TaskContext): OpenAPIFile {
    const context = new OpenAPIV3ParserContext({ document: openApi, taskContext });
    const variables = getVariableDefinitions(openApi);
    const endpoints = Object.entries(openApi.paths).flatMap(([path, pathItem]) => {
        if (pathItem == null) {
            return [];
        }
        taskContext.logger.debug(`Converting path ${path}`);
        const pathWithoutTrailingSlash = path.replace(/\/$/, "");
        return convertPathItem(pathWithoutTrailingSlash, pathItem, openApi, context);
    });
    return {
        title: openApi.info.title,
        description: openApi.info.description,
        servers: (openApi.servers ?? []).map((server) => convertServer(server)),
        tags: [],
        endpoints,
        schemas: Object.fromEntries(
            Object.entries(openApi.components?.schemas ?? {}).map(([key, schema]) => {
                taskContext.logger.debug(`Converting schema ${key}`);
                return [key, convertSchema(schema, false, context, [key])];
            })
        ),
        securitySchemes: Object.fromEntries(
            Object.entries(openApi.components?.securitySchemes ?? {}).map(([key, securityScheme]) => {
                const convertedSecurityScheme = convertSecurityScheme(securityScheme);
                if (convertedSecurityScheme == null) {
                    return [];
                }
                return [key, convertSecurityScheme(securityScheme)];
            })
        ),
        hasEndpointsMarkedInternal: endpoints.some((endpoint) => endpoint.internal),
        errors: context.getErrors(),
        nonRequestReferencedSchemas: Array.from(context.getReferencedSchemas()),
        dependencies: [],
        variables,
    };
}
