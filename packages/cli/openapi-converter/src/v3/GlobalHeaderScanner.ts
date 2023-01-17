import { TaskContext } from "@fern-api/task-context";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { OpenApiV3Context } from "./OpenApiV3Context";
import { isReferenceObject, maybeConvertSchemaToPrimitive } from "./utils";

export class GlobalHeaderScanner {
    private openApiV3Context: OpenApiV3Context;
    private taskContext: TaskContext;

    constructor(openApiV3Context: OpenApiV3Context, taskContext: TaskContext) {
        this.openApiV3Context = openApiV3Context;
        this.taskContext = taskContext;
    }

    public getGlobalHeaders(): Record<string, RawSchemas.HttpHeaderSchema> {
        // Authorization is treated as a global header by default
        const globalHeaders: Record<string, RawSchemas.HttpHeaderSchema> = {};
        let visitedFirstEndpoint = false;
        for (const endpoint of this.openApiV3Context.getEndpoints()) {
            if (endpoint.definition.parameters == null) {
                return {};
            }
            const endpointHeaders = this.getheadersFromParameters(endpoint.definition.parameters);
            if (visitedFirstEndpoint) {
                for (const headerName of Object.keys(globalHeaders)) {
                    if (!(headerName in endpointHeaders)) {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete globalHeaders[headerName];
                    }
                }
            } else {
                Object.entries(endpointHeaders).forEach(([headerName, httpHeader]) => {
                    if (headerName === "Authorization") {
                        // Authorization header will already be configured based on security schemes
                    } else {
                        globalHeaders[headerName] = httpHeader;
                    }
                });
                visitedFirstEndpoint = true;
            }
        }
        return globalHeaders;
    }

    private getheadersFromParameters(
        parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
    ): Record<string, RawSchemas.HttpHeaderSchema> {
        const convertedHeaders: Record<string, RawSchemas.HttpHeaderSchema> = {};
        for (const parameter of parameters) {
            const isParamterReference = isReferenceObject(parameter);
            const resolvedParameter = isParamterReference
                ? this.openApiV3Context.maybeResolveParameterReference(parameter)
                : parameter;
            if (resolvedParameter == null) {
                if (isParamterReference) {
                    this.taskContext.logger.debug(`Bad parameter reference: ${parameter.$ref}`);
                }
                continue;
            }
            const parameterSchema = resolvedParameter.schema;

            if (resolvedParameter.in !== "header") {
                continue;
            } else if (parameterSchema == null) {
                continue;
            }

            const isSchemaReference = isReferenceObject(parameterSchema);
            const resolvedSchema = isSchemaReference
                ? this.openApiV3Context.maybeResolveSchemaReference(parameterSchema)?.schemaObject
                : parameterSchema;
            if (resolvedSchema == null) {
                continue;
            }
            const convertedPrimitive = maybeConvertSchemaToPrimitive(resolvedSchema);
            if (convertedPrimitive == null) {
                if (isSchemaReference) {
                    this.taskContext.logger.debug(
                        `${parameterSchema.$ref} has non primitive schema: ${JSON.stringify(
                            resolvedSchema,
                            undefined,
                            2
                        )}`
                    );
                }
                continue;
            }

            const headerType =
                resolvedParameter.required != null && resolvedParameter.required
                    ? convertedPrimitive
                    : `optional<${convertedPrimitive}>`;
            convertedHeaders[resolvedParameter.name] = {
                docs: resolvedParameter.description,
                type: headerType,
            };
        }
        return convertedHeaders;
    }
}
