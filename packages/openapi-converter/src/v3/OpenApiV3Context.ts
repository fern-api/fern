import { OpenAPIV3 } from "openapi-types";
import { APPLICATION_JSON_CONTENT, isReferenceObject, SCHEMA_REFERENCE_PREFIX } from "./utils";

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
            if (pathDefinition == null) return;
            Object.values(OpenAPIV3.HttpMethods).forEach((httpMethod) => {
                const httpMethodDefinition = pathDefinition[httpMethod];
                if (httpMethodDefinition == null) return;
                this.endpoints.push({
                    path,
                    httpMethod,
                    definition: httpMethodDefinition,
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
            for (const endpoint of endpoints) {
                const requestBody = endpoint.definition.requestBody;
                if (requestBody != null) {
                    if (isReferenceObject(requestBody)) {
                        this.referenceObjectToTags.add(requestBody, tag);
                        continue;
                    }

                    const schema = requestBody.content[APPLICATION_JSON_CONTENT]?.schema;
                    if (schema == null) {
                        continue;
                    }
                    if (isReferenceObject(schema)) {
                        this.referenceObjectToTags.add(schema, tag);
                        continue;
                    }

                    const referencedSchemas = this.getAllReferencedSchemas(schema);
                    for (const referencedSchema of referencedSchemas) {
                        this.referenceObjectToTags.add(referencedSchema, tag);
                    }
                }

                const successResponse = endpoint.definition.responses[TWO_HUNDRED_RESPONSE];
                if (successResponse != null) {
                    if (isReferenceObject(successResponse)) {
                        this.referenceObjectToTags.add(successResponse, tag);
                        continue;
                    }

                    if (successResponse.content == null) {
                        continue;
                    }
                    const schema = successResponse.content[APPLICATION_JSON_CONTENT]?.schema;
                    if (schema == null) {
                        continue;
                    }
                    if (isReferenceObject(schema)) {
                        this.referenceObjectToTags.add(schema, tag);
                        continue;
                    }

                    const referencedSchemas = this.getAllReferencedSchemas(schema);
                    for (const referencedSchema of referencedSchemas) {
                        this.referenceObjectToTags.add(referencedSchema, tag);
                    }
                }
            }
        });
        const schemaGroups = this.referenceObjectToTags.getGroups();
        // initialize untaggedSchemas
        for (const schemaReference of schemaGroups.untaggedSchemaReferences) {
            const resolvedSchemaReference = this.maybeResolveSchemaReference(schemaReference);
            if (resolvedSchemaReference != null) {
                this.untaggedSchemas.push(resolvedSchemaReference);
            }
        }
        // initialize multiTaggedSchemaReferences
        for (const schemaReference of schemaGroups.multiTaggedSchemaReferences) {
            const resolvedSchemaReference = this.maybeResolveSchemaReference(schemaReference);
            if (resolvedSchemaReference != null) {
                this.multiTaggedSchemas.push(resolvedSchemaReference);
            }
        }
        // initialize schemasGroupedByTag
        Object.entries(schemaGroups.schemaReferencesGroupedByTag).forEach(([tag, schemaReferences]) => {
            const resolvedSchemaReferences: OpenAPIV3Schema[] = [];
            schemaReferences.forEach((schemaReference) => {
                const resolvedSchemaReference = this.maybeResolveSchemaReference(schemaReference);
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

    public getTagForSchema(referenceObject: OpenAPIV3.ReferenceObject): string[] {
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

    public maybeResolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3Schema | undefined {
        if (this.document.components == null || this.document.components.schemas == null) {
            return undefined;
        }
        if (!schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
            return undefined;
        }
        const schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
        const resolvedSchema = this.document.components.schemas[schemaKey];
        if (resolvedSchema == null) {
            return undefined;
        }
        if (isReferenceObject(resolvedSchema)) {
            return this.maybeResolveSchemaReference(resolvedSchema);
        }
        return {
            name: schemaKey,
            schemaObject: resolvedSchema,
        };
    }

    /**
     * Recursively find all reference objects from this schema object
     */
    private getAllReferencedSchemas(schema: OpenAPIV3.SchemaObject): Set<OpenAPIV3.ReferenceObject> {
        const schemaReferences = new Set<OpenAPIV3.ReferenceObject>();
        if (schema.properties != null) {
            for (const [_, propertySchema] of Object.entries(schema.properties)) {
                if (!isReferenceObject(propertySchema)) {
                    continue;
                }
                schemaReferences.add(propertySchema);
                const resolvedSchema = this.maybeResolveSchemaReference(propertySchema);
                if (resolvedSchema != null) {
                    this.getAllReferencedSchemas(resolvedSchema.schemaObject).forEach((referencedSchema) => {
                        schemaReferences.add(referencedSchema);
                    });
                }
            }
        }
        return schemaReferences;
    }
}

class ReferenceObjectsByTag {
    // TODO: read unreferenced schemas from document
    private _document: OpenAPIV3.Document;
    private refToTags: Record<string, string[]> = {};

    constructor(document: OpenAPIV3.Document) {
        this._document = document;
    }

    public add(referenceObject: OpenAPIV3.ReferenceObject, tag: string) {
        if (referenceObject.$ref in this.refToTags) {
            this.refToTags[referenceObject.$ref]?.push(tag);
        } else {
            this.refToTags[referenceObject.$ref] = [tag];
        }
    }

    public getTags(referenceObject: OpenAPIV3.ReferenceObject): string[] {
        return this.refToTags[referenceObject.$ref] ?? [];
    }

    public getGroups(): {
        untaggedSchemaReferences: OpenAPIV3.ReferenceObject[];
        schemaReferencesGroupedByTag: Record<string, OpenAPIV3.ReferenceObject[]>;
        multiTaggedSchemaReferences: OpenAPIV3.ReferenceObject[];
    } {
        const untaggedSchemaReferences: OpenAPIV3.ReferenceObject[] = [];
        const multiTaggedSchemaReferences: OpenAPIV3.ReferenceObject[] = [];
        const schemaReferencesGroupedByTag: Record<string, OpenAPIV3.ReferenceObject[]> = {};
        for (const [ref, tags] of Object.entries(this.refToTags)) {
            const referenceObject: OpenAPIV3.ReferenceObject = {
                $ref: ref,
            };
            if (tags.length <= 0) {
                untaggedSchemaReferences.push(referenceObject);
                continue;
            } else if (tags.length === 1) {
                const tag = tags[0];
                if (tag != null) {
                    schemaReferencesGroupedByTag[tag]?.push(referenceObject);
                }
            } else {
                multiTaggedSchemaReferences.push(referenceObject);
            }
        }
        return { untaggedSchemaReferences, schemaReferencesGroupedByTag, multiTaggedSchemaReferences };
    }
}
