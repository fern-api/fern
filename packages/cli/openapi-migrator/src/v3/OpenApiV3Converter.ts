import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { RawSchemas, ServiceFileSchema } from "@fern-api/yaml-schema";
import { camelCase, size, upperFirst } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { OpenApiConvertedFernDefinition } from "../convertOpenApi";
import { EndpointConverter } from "./EndpointConverter";
import { EndpointNamer } from "./EndpointNamer";
import { GlobalHeaderScanner } from "./GlobalHeaderScanner";
import { InlinedTypeNamer } from "./InlinedTypeNamer";
import { OpenApiV3Context, OpenAPIV3Endpoint, OpenAPIV3Schema } from "./OpenApiV3Context";
import { SchemaConverter } from "./SchemaConverter";
import {
    COMMONS_SERVICE_FILE_NAME,
    convertParameterSchema,
    diff,
    isReferenceObject,
    UNTAGGED_FILE_NAME,
} from "./utils";

const SCHEMAS_BREADCRUMBS = ["components", "schemas"];
const ENDPOINT_BREADCRUMBS = ["paths"];

export class OpenAPIConverter {
    private context: OpenApiV3Context;
    private taskContext: TaskContext;
    private inlinedTypeNamer: InlinedTypeNamer;
    private endpointNamer: EndpointNamer;
    private document: OpenAPIV3.Document;

    constructor(document: OpenAPIV3.Document, taskContext: TaskContext) {
        this.taskContext = taskContext;
        this.document = document;
        this.context = new OpenApiV3Context(document);
        this.inlinedTypeNamer = new InlinedTypeNamer();
        this.endpointNamer = new EndpointNamer();
    }

    /**
     * Steps to convert an OpenAPI V3 into a Fern Definition.
     *
     * 1. Convert global API metadata.
     *    1a. Scan all endpoints and any headers used on every endpoint should become global headers.
     *    1b. Convert security schemes.
     *    1c. Convert server hostnames.
     * 2. Scan all endpoints and group them by tag. Untagged endpoints will show up in `commons.yml`.
     *    If an endpoint has multiple tags we will choose the first one.
     * 3. Similarly, all schemas will be grouped by tags as well. If the schema is only referred to by
     *    endpoints with a single tag then the schema will default to that tag. If it is referred to
     *    by none or there are multiple tags, then it will default to `commons`.
     * 4. Convert each tag into a `service file`.
     *    4a. Add all relevant endpoints and types to the service file.
     *        - We will add any inlined schemas as new types. We will use `_UnnamedType<num>` as
     *          the names for the inlined schemas.
     *          Users will be forced to rename upon running fern check.
     *        - If an endpoint does not have an operation id, we will default to the http method as
     *          the name.
     */
    public async convert(): Promise<OpenApiConvertedFernDefinition> {
        const maybeAuthScheme = this.maybeGetAuthScheme(this.document);
        const hasAuth = maybeAuthScheme != null;
        const globalHeaderScanner = new GlobalHeaderScanner(this.context, this.taskContext);
        const globalHeaders = globalHeaderScanner.getGlobalHeaders();
        const serviceFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
        const tags = this.context.getTags();

        for (const tag of tags) {
            const endpoints = this.context.getEndpointsForTag(tag);
            const schemas = this.context.getSchemasForTag(tag);
            const convertedServiceFile = this.convertToServiceFile(tag, endpoints, schemas, hasAuth);
            serviceFiles[RelativeFilePath.of(convertedServiceFile.filename)] = convertedServiceFile.serviceFile;
        }

        const untaggedEndpoints = this.context.getUntaggedEndpoints();
        const untaggedSchemas = this.context.getUntaggedSchemas();

        const untaggedServiceFile = this.convertToServiceFile(
            UNTAGGED_FILE_NAME,
            untaggedEndpoints,
            untaggedSchemas,
            hasAuth
        );
        serviceFiles[RelativeFilePath.of(untaggedServiceFile.filename)] = untaggedServiceFile.serviceFile;

        const multiTaggedSchemas = this.context.getMultitaggedSchemas();
        const commonsServiceFile = this.convertToServiceFile(
            COMMONS_SERVICE_FILE_NAME,
            [],
            multiTaggedSchemas,
            hasAuth
        );
        serviceFiles[RelativeFilePath.of(commonsServiceFile.filename)] = commonsServiceFile.serviceFile;

        const rootApiFile: RawSchemas.RootApiFileSchema = {
            name: "api",
            "display-name": this.document.info.title,
            headers: globalHeaders,
            auth:
                maybeAuthScheme != null
                    ? typeof maybeAuthScheme === "string"
                        ? maybeAuthScheme
                        : Object.keys(maybeAuthScheme)[0]
                    : undefined,
            "auth-schemes": typeof maybeAuthScheme === "string" ? undefined : maybeAuthScheme,
        };

        const environments = this.maybeGetEnvironments(this.document);
        if (environments != null) {
            rootApiFile.environments = environments;
            rootApiFile["default-environment"] = null;
        }

        return {
            rootApiFile,
            serviceFiles,
        };
    }

    private convertToServiceFile(
        tag: string,
        endpoints: OpenAPIV3Endpoint[],
        schemas: OpenAPIV3Schema[],
        hasAuth: boolean
    ): { serviceFile: ServiceFileSchema; filename: string } {
        const camelCasedTag = tag === UNTAGGED_FILE_NAME ? tag : camelCase(tag);
        const pascalCasedTag = upperFirst(camelCasedTag);
        let types: Record<string, RawSchemas.TypeDeclarationSchema> = {};
        const convertedEndpoints: Record<string, RawSchemas.HttpEndpointSchema> = {};
        const imports: Record<string, string> = {};
        const filename = `${camelCasedTag}.yml`;
        schemas.forEach((schema) => {
            const breadcrumbs = [...SCHEMAS_BREADCRUMBS, schema.name];
            const schemaConverter = new SchemaConverter({
                schema: schema.schemaObject,
                taskContext: this.taskContext,
                inlinedTypeNamer: this.inlinedTypeNamer,
                context: this.context,
                breadcrumbs,
                tag,
            });
            const convertedSchema = schemaConverter.convert();
            if (convertedSchema != null) {
                types = {
                    ...types,
                    [schema.name]: convertedSchema.typeDeclaration,
                    ...convertedSchema.additionalTypeDeclarations,
                };
                Object.assign(imports, convertedSchema.imports);
            } else {
                this.taskContext.logger.warn(breadcrumbs.join(" -> "), " Failed to convert. Skipping.");
            }
        });

        const serviceBasePath = calculateBasePath(endpoints);
        endpoints.forEach((endpoint) => {
            const endpointConverter = new EndpointConverter(
                endpoint,
                this.context,
                this.taskContext,
                this.inlinedTypeNamer,
                ENDPOINT_BREADCRUMBS,
                tag,
                serviceBasePath
            );
            const convertedEndpoint = endpointConverter.convert();
            if (convertedEndpoint != null) {
                let operationId = endpoint.definition.operationId ?? endpoint.httpMethod;
                operationId = camelCase(endpoint.definition.operationId);
                if (operationId in convertedEndpoints) {
                    operationId = this.endpointNamer.getName();
                }
                convertedEndpoints[operationId] = convertedEndpoint.endpoint;
                types = {
                    ...types,
                    ...convertedEndpoint.additionalTypeDeclarations,
                };
                Object.assign(imports, convertedEndpoint.imports);
            }
        });

        const serviceFile: ServiceFileSchema = {};

        if (size(imports) > 0) {
            serviceFile.imports = imports;
        }

        const serviceName = `${pascalCasedTag}Service`;
        if (size(convertedEndpoints) > 0) {
            const partialService: Omit<RawSchemas.HttpServiceSchema, "endpoints"> = {
                auth: hasAuth,
                "base-path": serviceBasePath.parts.join("/"),
            };

            if (size(serviceBasePath.pathParameters) > 0) {
                const endpointToExtractPathParamsFrom = endpoints[0];
                if (endpointToExtractPathParamsFrom != null) {
                    partialService["path-parameters"] = this.getServicePathParameters(
                        endpointToExtractPathParamsFrom,
                        serviceBasePath.pathParameters
                    );
                } else {
                    this.taskContext.logger.warn(`${serviceName}: failed to add service path parameters.`);
                }
            }

            const service: RawSchemas.HttpServiceSchema = {
                auth: partialService.auth,
                "base-path": partialService["base-path"],
                "path-parameters": partialService["path-parameters"],
                endpoints: convertedEndpoints,
            };

            serviceFile.service = service;
        }

        if (size(types) > 0) {
            serviceFile.types = types;
        }

        return {
            filename,
            serviceFile,
        };
    }

    private getServicePathParameters(
        endpoint: OpenAPIV3Endpoint,
        basePathParameters: string[]
    ): Record<string, RawSchemas.HttpHeaderSchema> {
        const pathParameters: Record<string, RawSchemas.HttpHeaderSchema> = {};
        (endpoint.definition.parameters ?? []).forEach((parameter) => {
            const resolvedParameter = isReferenceObject(parameter)
                ? this.context.maybeResolveParameterReference(parameter)
                : parameter;
            if (
                resolvedParameter != null &&
                resolvedParameter.in === "path" &&
                basePathParameters.includes(resolvedParameter.name)
            ) {
                const parameterType = convertParameterSchema(
                    resolvedParameter,
                    this.context,
                    this.taskContext,
                    endpoint
                );
                if (parameterType == null) {
                    return;
                }
                const schema =
                    resolvedParameter.description != null
                        ? {
                              docs: resolvedParameter.description,
                              type: parameterType,
                          }
                        : parameterType;
                pathParameters[resolvedParameter.name] = schema;
            }
        });
        const excludedPathParameters = diff(basePathParameters, Object.keys(pathParameters));
        excludedPathParameters.forEach((pathParameter) => {
            pathParameters[pathParameter] = "string";
        });
        return pathParameters;
    }

    private maybeGetAuthScheme(
        document: OpenAPIV3.Document
    ): Record<string, RawSchemas.AuthSchemeDeclarationSchema> | string | undefined {
        if (document.components?.securitySchemes != null) {
            for (const [name, securityScheme] of Object.entries(document.components.securitySchemes)) {
                if (isReferenceObject(securityScheme)) {
                    continue;
                }
                if (securityScheme.type === "apiKey") {
                    return {
                        [name]: {
                            header: securityScheme.name,
                            name: "apiKey",
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            prefix: (securityScheme as any)["x-header-prefix"] as string | undefined,
                        },
                    };
                }
                if (securityScheme.type === "http" && securityScheme.scheme === "bearer") {
                    return "bearer";
                }
            }
        }
        return undefined;
    }

    private maybeGetEnvironments(
        document: OpenAPIV3.Document
    ): Record<string, RawSchemas.EnvironmentSchema> | undefined {
        const result: Record<string, RawSchemas.EnvironmentSchema> = {};
        if (document.servers != null) {
            for (const serverObject of document.servers) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const serverName = (serverObject as any)["x-server-name"] as string | undefined;
                if (serverName == null) {
                    continue;
                }
                result[serverName] =
                    serverObject.description == null
                        ? serverObject.url
                        : {
                              url: serverObject.url,
                              docs: serverObject.description,
                          };
            }
        }
        return Object.entries(result).length === 0 ? undefined : result;
    }
}

function calculateBasePath(endpoints: OpenAPIV3Endpoint[]): ServiceBasePath {
    const endpointPaths = endpoints.map((endpoint) => endpoint.path.split("/"));
    const minPathLength = Math.min(...endpointPaths.map((arr) => arr.length));
    const pathParameters: string[] = [];
    const basePath = [];
    for (let i = 0; i < minPathLength; i++) {
        let part: string | undefined;
        let partInitialized = false;
        let partsIdentical = true;
        for (const endpointPath of endpointPaths) {
            if (partInitialized) {
                partsIdentical = partsIdentical && part === endpointPath[i];
            } else {
                part = endpointPath[i];
                partInitialized = true;
            }
        }
        if (part != null && partInitialized && partsIdentical) {
            basePath.push(part);
        } else {
            break;
        }
    }
    for (const part of basePath) {
        if (part.startsWith("{") && part.endsWith("}")) {
            pathParameters.push(part.substring(1, part.length - 1));
        }
    }
    return {
        parts: basePath,
        pathParameters,
    };
}

export interface ServiceBasePath {
    parts: string[];
    pathParameters: string[];
}
