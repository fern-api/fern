import { OpenAPIV3 } from "openapi-types";
import {
    APPLICATION_JSON_CONTENT,
    isReferenceObject,
    REQUEST_REFERENCE_PREFIX,
    RESPONSE_REFERENCE_PREFIX,
    SCHEMA_REFERENCE_PREFIX,
} from "./utils";

export interface OpenAPIV3Endpoint {
    path: string;
    httpMethod: OpenAPIV3.HttpMethods;
    definition: OpenAPIV3.OperationObject;
}

export interface OpenAPIV3Schema {
    name: string;
    schemaObject: OpenAPIV3.SchemaObject;
}

const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";

const TWO_HUNDRED_RESPONSE = 200;
const TWO_HUNDRED_AND_ONE_RESPONSE = 201;

/**
 * A class that provides helper methods to access information from an OpenAPI V3 Document.
 */
export class OpenApiV3Context {
    private document: OpenAPIV3.Document;
    private endpoints: OpenAPIV3Endpoint[] = [];
    private endpointsGroupedByTag: Record<string, OpenAPIV3Endpoint[]> = {};
    private untaggedEndpoints: OpenAPIV3Endpoint[] = [];
    private schemasGroupedByTag: Record<string, OpenAPIV3Schema[]> = {};
    private multiTaggedSchemas: OpenAPIV3Schema[] = [];
    private untaggedSchemas: OpenAPIV3Schema[] = [];
    private referenceObjectToTags: ReferenceObjectsByTag;

    constructor(document: OpenAPIV3.Document) {
        this.document = document;
        // initialize this.endpoints with all endpoints
        Object.entries(this.document.paths).forEach(([path, pathDefinition]) => {
            if (pathDefinition == null) {
                return;
            }
            Object.values(OpenAPIV3.HttpMethods).forEach((httpMethod) => {
                const httpMethodDefinition = pathDefinition[httpMethod];
                if (httpMethodDefinition == null) {
                    return;
                }
                this.endpoints.push({
                    path,
                    httpMethod,
                    definition: {
                        ...httpMethodDefinition,
                        parameters: [...(httpMethodDefinition.parameters ?? []), ...(pathDefinition.parameters ?? [])],
                    },
                });
            });
        });
        // initialize endpoint groups based on tags. if not present, add to a "commons" group
        this.endpoints.forEach((endpoint) => {
            if (endpoint.definition.tags != null && endpoint.definition.tags.length > 0) {
                const tag = endpoint.definition.tags[0];
                if (tag != null) {
                    const groupedEndpoints = this.endpointsGroupedByTag[tag];
                    if (groupedEndpoints != null && tag in this.endpointsGroupedByTag) {
                        groupedEndpoints.push(endpoint);
                    } else {
                        this.endpointsGroupedByTag[tag] = [endpoint];
                    }
                    return;
                }
            }
            this.untaggedEndpoints.push(endpoint);
        });

        // group types into tag
        this.referenceObjectToTags = new ReferenceObjectsByTag(this.document);
        Object.entries(this.endpointsGroupedByTag).forEach(([tag, endpoints]) => {
            this.exploreEndpointSchemas(tag, endpoints);
        });
        this.exploreEndpointSchemas(undefined, this.untaggedEndpoints);

        const referenceGroups = this.referenceObjectToTags.getGroups();
        for (const untaggedReference of referenceGroups.untaggedReferences) {
            const resolvedSchemaReference = this.maybeResolveReference(untaggedReference);
            if (resolvedSchemaReference != null) {
                this.untaggedSchemas.push(resolvedSchemaReference);
            }
        }

        for (const multiTaggedReference of referenceGroups.multiTaggedReferences) {
            const resolvedSchemaReference = this.maybeResolveReference(multiTaggedReference);
            if (resolvedSchemaReference != null) {
                this.multiTaggedSchemas.push(resolvedSchemaReference);
            }
        }

        Object.entries(referenceGroups.tagToReferences).forEach(([tag, reference]) => {
            const resolvedSchemaReferences: OpenAPIV3Schema[] = [];
            reference.forEach((schemaReference) => {
                const resolvedSchemaReference = this.maybeResolveReference(schemaReference);
                if (resolvedSchemaReference != null) {
                    resolvedSchemaReferences.push(resolvedSchemaReference);
                }
            });
            this.schemasGroupedByTag[tag] = resolvedSchemaReferences;
        });
    }

    public getEndpoints(): OpenAPIV3Endpoint[] {
        return this.endpoints;
    }

    public getTags(): string[] {
        return Object.keys(this.endpointsGroupedByTag);
    }

    public getUntaggedEndpoints(): OpenAPIV3Endpoint[] {
        return this.untaggedEndpoints;
    }

    public getEndpointsForTag(tag: string): OpenAPIV3Endpoint[] {
        return this.endpointsGroupedByTag[tag] ?? [];
    }

    public getUntaggedSchemas(): OpenAPIV3Schema[] {
        return this.untaggedSchemas;
    }

    public getMultitaggedSchemas(): OpenAPIV3Schema[] {
        return this.multiTaggedSchemas;
    }

    public getSchemasForTag(tag: string): OpenAPIV3Schema[] {
        return this.schemasGroupedByTag[tag] ?? [];
    }

    public getTagForReference(referenceObject: OpenAPIV3.ReferenceObject): string[] {
        return this.referenceObjectToTags.getTags(referenceObject);
    }

    public maybeResolveParameterReference(parameter: OpenAPIV3.ReferenceObject): OpenAPIV3.ParameterObject | undefined {
        if (this.document.components == null || this.document.components.parameters == null) {
            return undefined;
        }
        if (!parameter.$ref.startsWith(PARAMETER_REFERENCE_PREFIX)) {
            return undefined;
        }
        const parameterKey = parameter.$ref.substring(PARAMETER_REFERENCE_PREFIX.length);
        const resolvedParameter = this.document.components.parameters[parameterKey];
        if (resolvedParameter == null) {
            return undefined;
        }
        if (isReferenceObject(resolvedParameter)) {
            return this.maybeResolveParameterReference(resolvedParameter);
        }
        return resolvedParameter;
    }

    public maybeResolveReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3Schema | undefined {
        if (this.document.components == null) {
            return undefined;
        }
        if (schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
            if (this.document.components.schemas == null) {
                return undefined;
            }
            const schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
            const resolvedSchema = this.document.components.schemas[schemaKey];
            if (resolvedSchema == null) {
                return undefined;
            }
            if (isReferenceObject(resolvedSchema)) {
                return this.maybeResolveReference(resolvedSchema);
            }
            return {
                name: schemaKey,
                schemaObject: resolvedSchema,
            };
        } else if (schema.$ref.startsWith(REQUEST_REFERENCE_PREFIX)) {
            if (this.document.components.requestBodies == null) {
                return undefined;
            }
            const requestKey = schema.$ref.substring(REQUEST_REFERENCE_PREFIX.length);
            const resolvedSchema = this.document.components.requestBodies[requestKey];
            if (resolvedSchema == null) {
                return undefined;
            }
            if (isReferenceObject(resolvedSchema)) {
                return this.maybeResolveReference(resolvedSchema);
            }

            const requestBodySchema = resolvedSchema.content[APPLICATION_JSON_CONTENT]?.schema;
            if (requestBodySchema == null) {
                return undefined;
            }
            if (isReferenceObject(requestBodySchema)) {
                return this.maybeResolveReference(requestBodySchema);
            }
            return {
                name: requestKey,
                schemaObject: requestBodySchema,
            };
        } else if (schema.$ref.startsWith(RESPONSE_REFERENCE_PREFIX)) {
            if (this.document.components.responses == null) {
                return undefined;
            }
            const responseKey = schema.$ref.substring(RESPONSE_REFERENCE_PREFIX.length);
            const resolvedSchema = this.document.components.responses[responseKey];
            if (resolvedSchema == null) {
                return undefined;
            }
            if (isReferenceObject(resolvedSchema)) {
                return this.maybeResolveReference(resolvedSchema);
            }

            if (resolvedSchema.content == null) {
                return undefined;
            }
            const responseBodySchema = resolvedSchema.content[APPLICATION_JSON_CONTENT]?.schema;
            if (responseBodySchema == null) {
                return undefined;
            }
            if (isReferenceObject(responseBodySchema)) {
                return this.maybeResolveReference(responseBodySchema);
            }
            return {
                name: responseKey,
                schemaObject: responseBodySchema,
            };
        } else if (!schema.$ref.startsWith(PARAMETER_REFERENCE_PREFIX)) {
            if (this.document.components.parameters == null) {
                return undefined;
            }
            const parameterKey = schema.$ref.substring(PARAMETER_REFERENCE_PREFIX.length);

            const resolvedParameter = this.document.components.parameters[parameterKey];
            if (resolvedParameter == null) {
                return undefined;
            }
            if (isReferenceObject(resolvedParameter)) {
                return this.maybeResolveReference(resolvedParameter);
            }

            if (resolvedParameter.schema == null) {
                return undefined;
            }
            const parameterSchema = resolvedParameter.schema;
            if (isReferenceObject(parameterSchema)) {
                return this.maybeResolveReference(parameterSchema);
            }
            return {
                name: parameterKey,
                schemaObject: parameterSchema,
            };
        }
        return undefined;
    }

    private exploreEndpointSchemas(tag: string | undefined, endpoints: OpenAPIV3Endpoint[]): void {
        const referencedSchemas = new Set<OpenAPIV3.ReferenceObject>();
        for (const endpoint of endpoints) {
            const requestBody = endpoint.definition.requestBody;
            if (requestBody != null) {
                if (isReferenceObject(requestBody)) {
                    this.referenceObjectToTags.add(requestBody, tag);
                    this.addAllReferencedSchemas(requestBody, referencedSchemas);
                } else {
                    const schema = requestBody.content[APPLICATION_JSON_CONTENT]?.schema;
                    if (schema != null) {
                        if (isReferenceObject(schema)) {
                            this.referenceObjectToTags.add(schema, tag);
                        }
                        this.addAllReferencedSchemas(schema, referencedSchemas);
                    }
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (endpoint.definition.responses != null) {
                const successResponse =
                    endpoint.definition.responses[TWO_HUNDRED_RESPONSE] ??
                    endpoint.definition.responses[TWO_HUNDRED_AND_ONE_RESPONSE];
                if (successResponse != null) {
                    if (isReferenceObject(successResponse)) {
                        this.referenceObjectToTags.add(successResponse, tag);
                        this.addAllReferencedSchemas(successResponse, referencedSchemas);
                    } else if (successResponse.content != null) {
                        const schema = successResponse.content[APPLICATION_JSON_CONTENT]?.schema;
                        if (schema != null) {
                            if (isReferenceObject(schema)) {
                                this.referenceObjectToTags.add(schema, tag);
                            }
                            this.addAllReferencedSchemas(schema, referencedSchemas);
                        }
                    }
                }
            }

            if (endpoint.definition.parameters != null) {
                for (const parameter of endpoint.definition.parameters) {
                    if (isReferenceObject(parameter)) {
                        this.referenceObjectToTags.add(parameter, tag);
                        this.addAllReferencedSchemasFromParameter(parameter, referencedSchemas);
                    } else if (parameter.schema != null && isReferenceObject(parameter.schema)) {
                        this.referenceObjectToTags.add(parameter.schema, tag);
                        this.addAllReferencedSchemas(parameter.schema, referencedSchemas);
                    }
                }
            }

            for (const referencedSchema of referencedSchemas) {
                this.referenceObjectToTags.add(referencedSchema, tag);
            }
        }
    }

    private addAllReferencedSchemasFromParameter(
        schema: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject,
        referencedSchemas: Set<OpenAPIV3.ReferenceObject>
    ) {
        const resolvedParameter = isReferenceObject(schema) ? this.maybeResolveParameterReference(schema) : schema;
        if (resolvedParameter == null || resolvedParameter.schema == null) {
            return;
        }
        if (isReferenceObject(resolvedParameter.schema)) {
            referencedSchemas.add(resolvedParameter.schema);
        }
        this.addAllReferencedSchemas(resolvedParameter.schema, referencedSchemas);
    }

    private addAllReferencedSchemas(
        schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
        referencedSchemas: Set<OpenAPIV3.ReferenceObject>
    ) {
        const resolvedSchema = isReferenceObject(schema) ? this.maybeResolveReference(schema)?.schemaObject : schema;
        if (resolvedSchema == null) {
            return;
        }
        this.getAllReferencedSchemas(resolvedSchema, referencedSchemas);
    }

    /**
     * Recursively find all reference objects from this schema object
     */
    private getAllReferencedSchemas(
        schema: OpenAPIV3.SchemaObject,
        schemaReferences: Set<OpenAPIV3.ReferenceObject>
    ): void {
        if (schema.properties != null && Object.entries(schema.properties).length > 0) {
            for (const [_, propertySchema] of Object.entries(schema.properties)) {
                if (isReferenceObject(propertySchema)) {
                    if (schemaReferences.has(propertySchema)) {
                        continue; // skip because schema reference has already been explored
                    }
                    schemaReferences.add(propertySchema);
                    const resolvedSchema = this.maybeResolveReference(propertySchema);
                    if (resolvedSchema != null) {
                        this.getAllReferencedSchemas(resolvedSchema.schemaObject, schemaReferences);
                    }
                } else {
                    this.getAllReferencedSchemas(propertySchema, schemaReferences);
                }
            }
        }

        if (
            schema.type === "array" &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            schema.items != null &&
            isReferenceObject(schema.items) &&
            !schemaReferences.has(schema.items)
        ) {
            schemaReferences.add(schema.items);
            const resolvedSchema = this.maybeResolveReference(schema.items);
            if (resolvedSchema != null) {
                this.getAllReferencedSchemas(resolvedSchema.schemaObject, schemaReferences);
            }
        }

        if (
            schema.additionalProperties != null &&
            typeof schema.additionalProperties !== "boolean" &&
            isReferenceObject(schema.additionalProperties) &&
            !schemaReferences.has(schema.additionalProperties)
        ) {
            schemaReferences.add(schema.additionalProperties);
            const resolvedSchema = this.maybeResolveReference(schema.additionalProperties);
            if (resolvedSchema != null) {
                this.getAllReferencedSchemas(resolvedSchema.schemaObject, schemaReferences);
            }
        }

        if (schema.allOf != null) {
            for (const allOfElement of schema.allOf) {
                if (isReferenceObject(allOfElement)) {
                    if (schemaReferences.has(allOfElement)) {
                        continue;
                    }
                    schemaReferences.add(allOfElement);
                    const resolvedSchema = this.maybeResolveReference(allOfElement);
                    if (resolvedSchema != null) {
                        this.getAllReferencedSchemas(resolvedSchema.schemaObject, schemaReferences);
                    }
                } else {
                    this.getAllReferencedSchemas(allOfElement, schemaReferences);
                }
            }
        }

        if (schema.oneOf != null) {
            for (const oneOfElement of schema.oneOf) {
                if (isReferenceObject(oneOfElement)) {
                    if (schemaReferences.has(oneOfElement)) {
                        continue;
                    }
                    schemaReferences.add(oneOfElement);
                    const resolvedSchema = this.maybeResolveReference(oneOfElement);
                    if (resolvedSchema != null) {
                        this.getAllReferencedSchemas(resolvedSchema.schemaObject, schemaReferences);
                    }
                }
            }
        }

        if (schema.discriminator?.mapping != null) {
            for (const [_, ref] of Object.entries(schema.discriminator.mapping)) {
                if (ref.startsWith("#/components/schemas")) {
                    const referenceObject = {
                        $ref: ref,
                    };
                    if (schemaReferences.has(referenceObject)) {
                        continue;
                    }
                    schemaReferences.add(referenceObject);
                    const resolvedSchema = this.maybeResolveReference(referenceObject);
                    if (resolvedSchema != null) {
                        this.getAllReferencedSchemas(resolvedSchema.schemaObject, schemaReferences);
                    }
                }
            }
        }
    }
}

class ReferenceObjectsByTag {
    private refToTags: Record<string, Set<string>> = {};

    // TODO: read unreferenced schemas from document
    constructor(_document: OpenAPIV3.Document) {
        this.refToTags = {};
    }

    public add(referenceObject: OpenAPIV3.ReferenceObject, tag: string | undefined) {
        if (tag == null) {
            this.refToTags[referenceObject.$ref] = new Set();
            return;
        }

        if (referenceObject.$ref in this.refToTags) {
            this.refToTags[referenceObject.$ref]?.add(tag);
        } else {
            this.refToTags[referenceObject.$ref] = new Set([tag]);
        }
    }

    public getTags(referenceObject: OpenAPIV3.ReferenceObject): string[] {
        const tags = this.refToTags[referenceObject.$ref];
        return tags != null ? Array.from(tags) : [];
    }

    public getGroups(): {
        untaggedReferences: OpenAPIV3.ReferenceObject[];
        tagToReferences: Record<string, OpenAPIV3.ReferenceObject[]>;
        multiTaggedReferences: OpenAPIV3.ReferenceObject[];
    } {
        const untaggedSchemaReferences: OpenAPIV3.ReferenceObject[] = [];
        const multiTaggedSchemaReferences: OpenAPIV3.ReferenceObject[] = [];
        const schemaReferencesGroupedByTag: Record<string, OpenAPIV3.ReferenceObject[]> = {};
        for (const [ref, tags] of Object.entries(this.refToTags)) {
            const referenceObject: OpenAPIV3.ReferenceObject = {
                $ref: ref,
            };
            if (tags.size <= 0) {
                untaggedSchemaReferences.push(referenceObject);
                continue;
            } else if (tags.size === 1) {
                const tag = Array.from(tags)[0];
                if (tag != null) {
                    if (tag in schemaReferencesGroupedByTag) {
                        schemaReferencesGroupedByTag[tag]?.push(referenceObject);
                    } else {
                        schemaReferencesGroupedByTag[tag] = [referenceObject];
                    }
                }
            } else {
                multiTaggedSchemaReferences.push(referenceObject);
            }
        }
        return {
            untaggedReferences: untaggedSchemaReferences,
            tagToReferences: schemaReferencesGroupedByTag,
            multiTaggedReferences: multiTaggedSchemaReferences,
        };
    }
}
