import { TaskContext } from "@fern-api/task-context";
import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpPathParameterSchema, HttpQueryParameterSchema } from "@fern-api/yaml-schema/src/schemas";
import { OpenAPIV3 } from "openapi-types";
import { OpenApiV3Context, OpenAPIV3Endpoint } from "./OpenApiV3Context";
import { isReferenceObject, maybeConvertSchemaToPrimitive } from "./utils";


export class EndpointConverter {

    private endpoint: OpenAPIV3Endpoint;
    private context: OpenApiV3Context;
    private resolvedParameters: OpenAPIV3.ParameterObject[] = [];
    private globalHeaders = 
    private taskContext: TaskContext;

    constructor(endpoint: OpenAPIV3Endpoint, context: OpenApiV3Context, taskContext: TaskContext) {
        this.endpoint = endpoint;
        this.context = context;
        this.taskContext = taskContext;
        (this.endpoint.definition.parameters ?? []).forEach((parameter) => {
            const resolvedParameter = isReferenceObject(parameter) 
                ? this.context.maybeResolveParameterReference(parameter)
                : parameter;
            if (resolvedParameter != null) {
                this.resolvedParameters.push(resolvedParameter);
            }
        });
    }

    public convert(): RawSchemas.HttpEndpointSchema | undefined {
        const convertedHttpMethod = convertHttpMethod(this.endpoint.httpMethod);
        if (convertedHttpMethod == null) {
            return undefined;
        }
        const pathParameters = this.getPathParameters();
        const queryParameters = this.getQueryParameters();
        return {
            path: this.endpoint.path,
            method: convertedHttpMethod,
            docs: this.endpoint.definition.description,
            "display-name": this.endpoint.definition.summary,
            "path-parameters": pathParameters,
            "request": {
                "query-parameters": Object.keys(queryParameters).length === 0 ? queryParameters : undefined,
                "headers": 
            }
        };
    }

    private getPathParameters(): Record<string, HttpPathParameterSchema> {
        const pathParameters: Record<string, HttpPathParameterSchema> = {};
        for (const parameter of this.resolvedParameters) {
            if (parameter.in === "path") {
                const parameterType = this.convertParameterSchema(parameter);
                if (parameterType == null) {
                    continue;
                }
                const schema =  parameter.description != null ? 
                  {
                    docs: parameter.description, 
                    type: parameterType
                  }
                  : parameterType;
                pathParameters[parameter.name] = schema;
            }
        }
        return pathParameters;
    }

    private getQueryParameters(): Record<string, HttpQueryParameterSchema> {
        const queryParameters: Record<string, HttpPathParameterSchema> = {};
        for (const parameter of this.resolvedParameters) {
            if (parameter.in === "path") {
                const parameterType = this.convertParameterSchema(parameter);
                if (parameterType == null) {
                    continue;
                }
                const schema =  parameter.description != null ? 
                  {
                    docs: parameter.description, 
                    type: parameterType
                  }
                  : parameterType;
                queryParameters[parameter.name] = schema;
            }
        }
        return queryParameters;
    }

    private convertParameterSchema(parameter: OpenAPIV3.ParameterObject): string | undefined {
        if (parameter.schema == null) {
            return undefined;
        }

        const resolvedSchema = isReferenceObject(parameter.schema)
            ? this.context.maybeResolveSchemaReference(parameter.schema)
            : parameter.schema;
        if (resolvedSchema == null) {
            return undefined;
        }
        
        const convertedPrimitive = maybeConvertSchemaToPrimitive(resolvedSchema);
        if (convertedPrimitive == null) {
            this.taskContext.logger.warn(`${this.endpoint.httpMethod} ${this.endpoint.path} parameter ${parameter.name} has non primitive schema: ${JSON.stringify(
                resolvedSchema,
                undefined,
                2
            )}`);
        }

        const parameterType = parameter.required != null && parameter.required
            ? convertedPrimitive
            : `optional<${convertedPrimitive}>`;
        return parameterType;
    }
}

function convertHttpMethod(httpMethod: OpenAPIV3.HttpMethods): RawSchemas.HttpMethodSchema | undefined {
    switch(httpMethod) {
        case OpenAPIV3.HttpMethods.GET: 
            return "GET";
        case OpenAPIV3.HttpMethods.POST: 
            return "POST";
        case OpenAPIV3.HttpMethods.PUT: 
            return "PUT";
        case OpenAPIV3.HttpMethods.PATCH: 
            return "PATCH";
        case OpenAPIV3.HttpMethods.DELETE: 
            return "DELETE";
        default: 
            return undefined;
    }
}
