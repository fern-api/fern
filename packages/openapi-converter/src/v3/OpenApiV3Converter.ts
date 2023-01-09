import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { RawSchemas, ServiceFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { FernDefinition } from "../convertOpenApi";
import { GlobalHeaderScanner } from "./GlobalHeaderScanner";
import { OpenApiV3Context, OpenAPIV3Endpoint } from "./OpenApiV3Context";

export class OpenAPIConverter {

    private document: OpenAPIV3.Document;
    private context: OpenApiV3Context;
    private taskContext: TaskContext; 

    constructor(document: OpenAPIV3.Document, taskContext: TaskContext) {
        this.document = document;
        this.taskContext = taskContext;
        this.context = new OpenApiV3Context(document);
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
        const serviceFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
        const tags = this.context.getTags();
        for (const tag of tags) {
            const endpoints = this.context.getEndpointsForTag(tag);
            const schemas = this.context.getSchemasForTag(tag);
        }
        return {
            rootApiFile: {
                name: "api",
                headers: globalHeaderScanner.getGlobalHeaders(),
            },
            serviceFiles,
        };
    }

    private convertToServiceFile(endpoints: OpenAPIV3Endpoint[], schemas: OpenAPIV3.SchemaObject): ServiceFileSchema {

    }
}