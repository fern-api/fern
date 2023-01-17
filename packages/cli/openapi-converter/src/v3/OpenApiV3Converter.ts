import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { RawSchemas, ServiceFileSchema } from "@fern-api/yaml-schema";
import { camelCase, size, upperFirst } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { FernDefinition } from "../convertOpenApi";
import { EndpointConverter } from "./EndpointConverter";
import { GlobalHeaderScanner } from "./GlobalHeaderScanner";
import { InlinedTypeNamer } from "./InlinedTypeNamer";
import { OpenApiV3Context, OpenAPIV3Endpoint, OpenAPIV3Schema } from "./OpenApiV3Context";
import { SchemaConverter } from "./SchemaConverter";
import { COMMONS_SERVICE_FILE_NAME } from "./utils";

const SCHEMAS_BREADCRUMBS = ["components", "schemas"];
const ENDPOINT_BREADCRUMBS = ["paths"];

export class OpenAPIConverter {
    private context: OpenApiV3Context;
    private taskContext: TaskContext;
    private inlinedTypeNamer: InlinedTypeNamer;

    constructor(document: OpenAPIV3.Document, taskContext: TaskContext) {
        this.taskContext = taskContext;
        this.context = new OpenApiV3Context(document);
        this.inlinedTypeNamer = new InlinedTypeNamer();
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
    public async convert(): Promise<FernDefinition> {
        const globalHeaderScanner = new GlobalHeaderScanner(this.context, this.taskContext);
        const globalHeaders = globalHeaderScanner.getGlobalHeaders();
        const serviceFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
        const tags = this.context.getTags();

        for (const tag of tags) {
            const endpoints = this.context.getEndpointsForTag(tag);
            const schemas = this.context.getSchemasForTag(tag);
            const convertedServiceFile = this.convertToServiceFile(tag, endpoints, schemas);
            serviceFiles[RelativeFilePath.of(convertedServiceFile.filename)] = convertedServiceFile.serviceFile;
        }

        const untaggedEndpoints = this.context.getUntaggedEndpoints();
        const untaggedSchemas = this.context.getUntaggedSchemas();
        const multiTaggedSchemas = this.context.getMultitaggedSchemas();
        const commonsServiceFile = this.convertToServiceFile(COMMONS_SERVICE_FILE_NAME, untaggedEndpoints, [
            ...multiTaggedSchemas,
            ...untaggedSchemas,
        ]);
        serviceFiles[RelativeFilePath.of(commonsServiceFile.filename)] = commonsServiceFile.serviceFile;

        return {
            rootApiFile: {
                name: "api",
                headers: globalHeaders,
            },
            serviceFiles,
        };
    }

    private convertToServiceFile(
        tag: string,
        endpoints: OpenAPIV3Endpoint[],
        schemas: OpenAPIV3Schema[]
    ): { serviceFile: ServiceFileSchema; filename: string } {
        const camelCasedTag = camelCase(tag);
        const pascalCasedTag = upperFirst(camelCasedTag);
        let types: Record<string, RawSchemas.TypeDeclarationSchema> = {};
        const convertedEndpoints: Record<string, RawSchemas.HttpEndpointSchema> = {};
        schemas.forEach((schema) => {
            const schemaConverter = new SchemaConverter({
                schema: schema.schemaObject,
                taskContext: this.taskContext,
                inlinedTypeNamer: this.inlinedTypeNamer,
                context: this.context,
                breadcrumbs: SCHEMAS_BREADCRUMBS,
            });
            const convertedSchema = schemaConverter.convert();
            if (convertedSchema != null) {
                types = {
                    ...types,
                    [schema.name]: convertedSchema.typeDeclaration,
                    ...convertedSchema.additionalTypeDeclarations,
                };
            } else {
                this.taskContext.logger.debug();
            }
        });
        endpoints.forEach((endpoint) => {
            const endpointConverter = new EndpointConverter(
                endpoint,
                this.context,
                this.taskContext,
                this.inlinedTypeNamer,
                ENDPOINT_BREADCRUMBS
            );
            const convertedEndpoint = endpointConverter.convert();
            if (convertedEndpoint != null) {
                let operationId = endpoint.definition.operationId ?? endpoint.httpMethod;
                if (operationId in convertedEndpoints) {
                    operationId = this.inlinedTypeNamer.getName();
                }
                convertedEndpoints[operationId] = convertedEndpoint.endpoint;
                types = {
                    ...types,
                    ...convertedEndpoint.additionalTypeDeclarations,
                };
            }
        });

        const serviceFile: ServiceFileSchema = { types };
        if (size(convertedEndpoints) > 0) {
            serviceFile.services = {
                http: {
                    [`${pascalCasedTag}Service`]: {
                        auth: false,
                        "base-path": "",
                        endpoints: convertedEndpoints,
                    },
                },
            };
        }

        return {
            filename: `${camelCasedTag}.yml`,
            serviceFile,
        };
    }
}
