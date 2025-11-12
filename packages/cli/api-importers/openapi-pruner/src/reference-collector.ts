import { OpenAPIV3 } from "openapi-types";
import { ComponentReference, SchemaReference } from "./types";

export class ReferenceCollector {
    private schemas = new Set<SchemaReference>();
    private parameters = new Set<ComponentReference>();
    private responses = new Set<ComponentReference>();
    private requestBodies = new Set<ComponentReference>();
    private securitySchemes = new Set<ComponentReference>();
    private headers = new Set<ComponentReference>();
    private examples = new Set<ComponentReference>();
    private links = new Set<ComponentReference>();
    private callbacks = new Set<ComponentReference>();

    constructor(private document: OpenAPIV3.Document) {}

    public collectFromOperation(operation: OpenAPIV3.OperationObject): void {
        if (operation.parameters) {
            for (const param of operation.parameters) {
                this.collectParameter(param);
            }
        }

        if (operation.requestBody) {
            this.collectFromRequestBody(operation.requestBody);
        }

        if (operation.responses) {
            for (const response of Object.values(operation.responses)) {
                this.collectFromResponse(response);
            }
        }

        if (operation.callbacks) {
            for (const [callbackName, callback] of Object.entries(operation.callbacks)) {
                if (this.isReference(callback)) {
                    this.callbacks.add(this.extractComponentName(callback.$ref));
                } else {
                    for (const pathItem of Object.values(callback)) {
                        this.collectFromPathItem(pathItem);
                    }
                }
            }
        }

        if (operation.security) {
            for (const securityRequirement of operation.security) {
                for (const schemeName of Object.keys(securityRequirement)) {
                    this.securitySchemes.add(schemeName);
                }
            }
        }
    }

    public collectFromPathItem(pathItem: OpenAPIV3.PathItemObject): void {
        if (pathItem.parameters) {
            for (const param of pathItem.parameters) {
                this.collectParameter(param);
            }
        }

        const operations = [
            pathItem.get,
            pathItem.put,
            pathItem.post,
            pathItem.delete,
            pathItem.options,
            pathItem.head,
            pathItem.patch,
            pathItem.trace
        ];

        for (const operation of operations) {
            if (operation) {
                this.collectFromOperation(operation);
            }
        }
    }

    public collectParameter(parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject): void {
        if (this.isReference(parameter)) {
            this.parameters.add(this.extractComponentName(parameter.$ref));
            const resolvedParam = this.resolveParameter(parameter.$ref);
            if (resolvedParam) {
                this.collectParameter(resolvedParam);
            }
        } else {
            if (parameter.schema) {
                this.collectFromSchema(parameter.schema);
            }
            if (parameter.content) {
                for (const mediaType of Object.values(parameter.content)) {
                    this.collectFromMediaType(mediaType);
                }
            }
            if (parameter.examples) {
                for (const [exampleName, example] of Object.entries(parameter.examples)) {
                    if (this.isReference(example)) {
                        this.examples.add(this.extractComponentName(example.$ref));
                    }
                }
            }
        }
    }

    private collectFromRequestBody(requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject): void {
        if (this.isReference(requestBody)) {
            this.requestBodies.add(this.extractComponentName(requestBody.$ref));
            const resolvedBody = this.resolveRequestBody(requestBody.$ref);
            if (resolvedBody) {
                this.collectFromRequestBody(resolvedBody);
            }
        } else {
            if (requestBody.content) {
                for (const mediaType of Object.values(requestBody.content)) {
                    this.collectFromMediaType(mediaType);
                }
            }
        }
    }

    private collectFromResponse(response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject): void {
        if (this.isReference(response)) {
            this.responses.add(this.extractComponentName(response.$ref));
            const resolvedResponse = this.resolveResponse(response.$ref);
            if (resolvedResponse) {
                this.collectFromResponse(resolvedResponse);
            }
        } else {
            if (response.headers) {
                for (const [headerName, header] of Object.entries(response.headers)) {
                    if (this.isReference(header)) {
                        this.headers.add(this.extractComponentName(header.$ref));
                    } else {
                        if (header.schema) {
                            this.collectFromSchema(header.schema);
                        }
                    }
                }
            }
            if (response.content) {
                for (const mediaType of Object.values(response.content)) {
                    this.collectFromMediaType(mediaType);
                }
            }
            if (response.links) {
                for (const [linkName, link] of Object.entries(response.links)) {
                    if (this.isReference(link)) {
                        this.links.add(this.extractComponentName(link.$ref));
                    }
                }
            }
        }
    }

    private collectFromMediaType(mediaType: OpenAPIV3.MediaTypeObject): void {
        if (mediaType.schema) {
            this.collectFromSchema(mediaType.schema);
        }
        if (mediaType.examples) {
            for (const [exampleName, example] of Object.entries(mediaType.examples)) {
                if (this.isReference(example)) {
                    this.examples.add(this.extractComponentName(example.$ref));
                }
            }
        }
    }

    private collectFromSchema(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): void {
        if (this.isReference(schema)) {
            const schemaName = this.extractComponentName(schema.$ref);
            if (!this.schemas.has(schemaName)) {
                this.schemas.add(schemaName);
                const resolvedSchema = this.resolveSchema(schema.$ref);
                if (resolvedSchema) {
                    this.collectFromSchema(resolvedSchema);
                }
            }
        } else {
            if (schema.properties) {
                for (const property of Object.values(schema.properties)) {
                    this.collectFromSchema(property);
                }
            }
            if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
                this.collectFromSchema(schema.additionalProperties);
            }
            if ("items" in schema && schema.items) {
                if (Array.isArray(schema.items)) {
                    for (const item of schema.items) {
                        this.collectFromSchema(item);
                    }
                } else {
                    this.collectFromSchema(schema.items);
                }
            }
            if (schema.allOf) {
                for (const subSchema of schema.allOf) {
                    this.collectFromSchema(subSchema);
                }
            }
            if (schema.oneOf) {
                for (const subSchema of schema.oneOf) {
                    this.collectFromSchema(subSchema);
                }
            }
            if (schema.anyOf) {
                for (const subSchema of schema.anyOf) {
                    this.collectFromSchema(subSchema);
                }
            }
            if (schema.not) {
                this.collectFromSchema(schema.not);
            }
        }
    }

    private resolveSchema(ref: string): OpenAPIV3.SchemaObject | undefined {
        const schemaName = this.extractComponentName(ref);
        return this.document.components?.schemas?.[schemaName] as OpenAPIV3.SchemaObject | undefined;
    }

    private resolveParameter(ref: string): OpenAPIV3.ParameterObject | undefined {
        const paramName = this.extractComponentName(ref);
        return this.document.components?.parameters?.[paramName] as OpenAPIV3.ParameterObject | undefined;
    }

    private resolveResponse(ref: string): OpenAPIV3.ResponseObject | undefined {
        const responseName = this.extractComponentName(ref);
        return this.document.components?.responses?.[responseName] as OpenAPIV3.ResponseObject | undefined;
    }

    private resolveRequestBody(ref: string): OpenAPIV3.RequestBodyObject | undefined {
        const bodyName = this.extractComponentName(ref);
        return this.document.components?.requestBodies?.[bodyName] as OpenAPIV3.RequestBodyObject | undefined;
    }

    private isReference(obj: unknown): obj is OpenAPIV3.ReferenceObject {
        return obj != null && typeof obj === "object" && "$ref" in obj;
    }

    private extractComponentName(ref: string): string {
        const parts = ref.split("/");
        return parts[parts.length - 1] ?? ref;
    }

    public getSchemas(): Set<SchemaReference> {
        return this.schemas;
    }

    public getParameters(): Set<ComponentReference> {
        return this.parameters;
    }

    public getResponses(): Set<ComponentReference> {
        return this.responses;
    }

    public getRequestBodies(): Set<ComponentReference> {
        return this.requestBodies;
    }

    public getSecuritySchemes(): Set<ComponentReference> {
        return this.securitySchemes;
    }

    public getHeaders(): Set<ComponentReference> {
        return this.headers;
    }

    public getExamples(): Set<ComponentReference> {
        return this.examples;
    }

    public getLinks(): Set<ComponentReference> {
        return this.links;
    }

    public getCallbacks(): Set<ComponentReference> {
        return this.callbacks;
    }
}
