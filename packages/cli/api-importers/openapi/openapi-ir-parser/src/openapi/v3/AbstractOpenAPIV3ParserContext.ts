import { Logger } from "@fern-api/logger";
import { Namespace, SchemaId, SdkGroup, SdkGroupName, Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";

import { ParseOpenAPIOptions } from "../../options";
import { SchemaParserContext } from "../../schema/SchemaParserContext";
import { getReferenceOccurrences } from "../../schema/utils/getReferenceOccurrences";
import { isReferenceObject } from "../../schema/utils/isReferenceObject";
import { ExternalDocumentResolver } from "./ExternalDocumentResolver";
import { OpenAPIFilter } from "./OpenAPIFilter";

export const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";
export const RESPONSE_REFERENCE_PREFIX = "#/components/responses/";
export const EXAMPLES_REFERENCE_PREFIX = "#/components/examples/";
export const REQUEST_BODY_REFERENCE_PREFIX = "#/components/requestBodies/";
export const SECURITY_SCHEME_REFERENCE_PREFIX = "#/components/securitySchemes/";

export interface DiscriminatedUnionReference {
    discriminants: Set<string>;
    numReferences: number;
}

export interface DiscriminatedUnionMetadata {
    // Map of the field name to the field value
    discriminants: Map<string, string>;
}

export abstract class AbstractOpenAPIV3ParserContext implements SchemaParserContext {
    public readonly logger: Logger;
    public readonly document: OpenAPIV3.Document;
    public readonly taskContext: TaskContext;
    public readonly authHeaders: Set<string>;
    public readonly refOccurrences: Record<string, number>;
    public readonly DUMMY: SchemaParserContext;
    public readonly options: ParseOpenAPIOptions;
    public readonly source: Source;
    public readonly filter: OpenAPIFilter;
    public readonly namespace: string | undefined;
    private readonly resolutionStack = new Set<string>(); // Track circular references
    public readonly externalResolver?: ExternalDocumentResolver;
    constructor({
        document,
        taskContext,
        authHeaders,
        options,
        source,
        namespace,
        externalResolver
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        authHeaders: Set<string>;
        options: ParseOpenAPIOptions;
        source: Source;
        namespace: string | undefined;
        externalResolver?: ExternalDocumentResolver;
    }) {
        this.document = document;
        this.logger = taskContext.logger;
        this.taskContext = taskContext;
        this.authHeaders = authHeaders;
        this.refOccurrences = getReferenceOccurrences(document);
        this.options = options;
        this.source = source;
        this.filter = new OpenAPIFilter({ context: taskContext, options });
        this.DUMMY = this.getDummy();

        this.namespace = namespace;
    }

    public getNumberOfOccurrencesForRef(schema: OpenAPIV3.ReferenceObject): number {
        return this.refOccurrences[schema.$ref] ?? 0;
    }

    public resolveTagsToTagIds(operationTags: string[] | undefined): string[] {
        const tags: string[] = [];
        if (this.namespace != null) {
            tags.push(this.namespace);
        }
        return tags.concat(operationTags ?? []);
    }

    public resolveTags(operationTags: string[] | undefined): SdkGroup[] {
        const tags: SdkGroup[] = [];
        if (this.namespace != null) {
            const namespaceSegment: Namespace = {
                type: "namespace",
                name: this.namespace
            };

            tags.push(namespaceSegment);
        }
        return tags.concat(operationTags ?? []);
    }

    public resolveGroupName(groupName: SdkGroupName): SdkGroupName {
        if (this.namespace != null) {
            return [{ type: "namespace", name: this.namespace }, ...groupName];
        }

        return groupName;
    }

    public resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject {
        // Check for circular references
        if (this.resolutionStack.has(schema.$ref)) {
            this.logger.warn(
                `Circular reference detected in schema resolution: ${schema.$ref}. Chain: ${Array.from(this.resolutionStack).join(" -> ")} -> ${schema.$ref}`
            );
            return {
                "x-fern-type": "unknown",
                description: `Circular reference: ${schema.$ref}`
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any as OpenAPIV3.SchemaObject;
        }

        // Add current reference to stack
        this.resolutionStack.add(schema.$ref);

        try {
            // Step 1: Get keys
            const keys = schema.$ref
                .substring(2)
                .split("/")
                .map((key) => key.replace(/~1/g, "/"));

            // Step 2: Index recursively into the document with all the keys
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            let resolvedSchema: any = this.document;
            for (const key of keys) {
                if (typeof resolvedSchema !== "object" || resolvedSchema == null) {
                    return {
                        "x-fern-type": "unknown"
                        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                    } as any as OpenAPIV3.SchemaObject;
                }

                // Handle both objects and arrays
                if (Array.isArray(resolvedSchema)) {
                    const index = parseInt(key, 10);
                    if (isNaN(index) || index < 0 || index >= resolvedSchema.length) {
                        return {
                            "x-fern-type": "unknown"
                            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                        } as any as OpenAPIV3.SchemaObject;
                    }
                    resolvedSchema = resolvedSchema[index];
                } else {
                    resolvedSchema = resolvedSchema[key];
                }
            }
            if (resolvedSchema == null) {
                this.logger.warn(`Encountered undefined reference: ${schema.$ref}`);
                return {
                    "x-fern-type": "unknown"
                    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                } as any as OpenAPIV3.SchemaObject;
            }

            // Step 3: If the result is another reference object, make a recursive call
            if (isReferenceObject(resolvedSchema)) {
                resolvedSchema = this.resolveSchemaReference(resolvedSchema);
            }

            // Step 4: If the result is a schema object, return it
            return resolvedSchema;
        } finally {
            // Remove current reference from stack
            this.resolutionStack.delete(schema.$ref);
        }
    }

    public resolveParameterReference(parameter: OpenAPIV3.ReferenceObject): OpenAPIV3.ParameterObject {
        // Check for circular references
        if (this.resolutionStack.has(parameter.$ref)) {
            this.logger.warn(
                `Circular reference detected in parameter resolution: ${parameter.$ref}. Chain: ${Array.from(this.resolutionStack).join(" -> ")} -> ${parameter.$ref}`
            );
            return {
                name: "unknown",
                in: "query",
                description: `Circular reference: ${parameter.$ref}`
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any as OpenAPIV3.ParameterObject;
        }

        // Add current reference to stack
        this.resolutionStack.add(parameter.$ref);

        try {
            if (
                this.document.components == null ||
                this.document.components.parameters == null ||
                !parameter.$ref.startsWith(PARAMETER_REFERENCE_PREFIX)
            ) {
                throw new Error(`Failed to resolve ${parameter.$ref}`);
            }
            const parameterKey = parameter.$ref.substring(PARAMETER_REFERENCE_PREFIX.length);
            const resolvedParameter = this.document.components.parameters[parameterKey];
            if (resolvedParameter == null) {
                throw new Error(`${parameter.$ref} is undefined`);
            }
            if (isReferenceObject(resolvedParameter)) {
                return this.resolveParameterReference(resolvedParameter);
            }
            return resolvedParameter;
        } finally {
            // Remove current reference from stack
            this.resolutionStack.delete(parameter.$ref);
        }
    }

    public resolveRequestBodyReference(requestBody: OpenAPIV3.ReferenceObject): OpenAPIV3.RequestBodyObject {
        // Check for circular references
        if (this.resolutionStack.has(requestBody.$ref)) {
            this.logger.warn(
                `Circular reference detected in request body resolution: ${requestBody.$ref}. Chain: ${Array.from(this.resolutionStack).join(" -> ")} -> ${requestBody.$ref}`
            );
            return {
                content: {},
                description: `Circular reference: ${requestBody.$ref}`
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any as OpenAPIV3.RequestBodyObject;
        }

        // Add current reference to stack
        this.resolutionStack.add(requestBody.$ref);

        try {
            if (
                this.document.components == null ||
                this.document.components.requestBodies == null ||
                !requestBody.$ref.startsWith(REQUEST_BODY_REFERENCE_PREFIX)
            ) {
                throw new Error(`Failed to resolve ${requestBody.$ref}`);
            }
            const requestBodyKey = requestBody.$ref.substring(REQUEST_BODY_REFERENCE_PREFIX.length);
            const resolvedRequestBody = this.document.components.requestBodies[requestBodyKey];
            if (resolvedRequestBody == null) {
                throw new Error(`${requestBody.$ref} is undefined`);
            }
            if (isReferenceObject(resolvedRequestBody)) {
                return this.resolveRequestBodyReference(resolvedRequestBody);
            }
            return resolvedRequestBody;
        } finally {
            // Remove current reference from stack
            this.resolutionStack.delete(requestBody.$ref);
        }
    }

    public resolveResponseReference(response: OpenAPIV3.ReferenceObject): OpenAPIV3.ResponseObject {
        // Check for circular references
        if (this.resolutionStack.has(response.$ref)) {
            this.logger.warn(
                `Circular reference detected in response resolution: ${response.$ref}. Chain: ${Array.from(this.resolutionStack).join(" -> ")} -> ${response.$ref}`
            );
            return {
                description: `Circular reference: ${response.$ref}`
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any as OpenAPIV3.ResponseObject;
        }

        // Add current reference to stack
        this.resolutionStack.add(response.$ref);

        try {
            if (
                this.document.components == null ||
                this.document.components.responses == null ||
                !response.$ref.startsWith(RESPONSE_REFERENCE_PREFIX)
            ) {
                throw new Error(`Failed to resolve ${response.$ref}`);
            }
            const parameterKey = response.$ref.substring(RESPONSE_REFERENCE_PREFIX.length);
            const resolvedResponse = this.document.components.responses[parameterKey];
            if (resolvedResponse == null) {
                throw new Error(`${response.$ref} is undefined`);
            }
            if (isReferenceObject(resolvedResponse)) {
                return this.resolveResponseReference(resolvedResponse);
            }
            return resolvedResponse;
        } finally {
            // Remove current reference from stack
            this.resolutionStack.delete(response.$ref);
        }
    }

    public resolveExampleReference(example: OpenAPIV3.ReferenceObject): OpenAPIV3.ExampleObject {
        // Check for circular references
        if (this.resolutionStack.has(example.$ref)) {
            this.logger.warn(
                `Circular reference detected in example resolution: ${example.$ref}. Chain: ${Array.from(this.resolutionStack).join(" -> ")} -> ${example.$ref}`
            );
            return {
                summary: `Circular reference: ${example.$ref}`
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any as OpenAPIV3.ExampleObject;
        }

        // Add current reference to stack
        this.resolutionStack.add(example.$ref);

        try {
            if (
                this.document.components == null ||
                this.document.components.examples == null ||
                !example.$ref.startsWith(EXAMPLES_REFERENCE_PREFIX)
            ) {
                throw new Error(`Failed to resolve ${example.$ref}`);
            }
            const parameterKey = example.$ref.substring(EXAMPLES_REFERENCE_PREFIX.length);
            const resolvedExample = this.document.components.examples[parameterKey];
            if (resolvedExample == null) {
                throw new Error(`${example.$ref} is undefined`);
            }
            if (isReferenceObject(resolvedExample)) {
                return this.resolveExampleReference(resolvedExample);
            }
            return resolvedExample;
        } finally {
            // Remove current reference from stack
            this.resolutionStack.delete(example.$ref);
        }
    }

    public resolveSecuritySchemeReference(securityScheme: OpenAPIV3.ReferenceObject): OpenAPIV3.SecuritySchemeObject {
        // Check for circular references
        if (this.resolutionStack.has(securityScheme.$ref)) {
            this.logger.warn(
                `Circular reference detected in security scheme resolution: ${securityScheme.$ref}. Chain: ${Array.from(this.resolutionStack).join(" -> ")} -> ${securityScheme.$ref}`
            );
            return {
                type: "http",
                scheme: "bearer",
                description: `Circular reference: ${securityScheme.$ref}`
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any as OpenAPIV3.SecuritySchemeObject;
        }

        // Add current reference to stack
        this.resolutionStack.add(securityScheme.$ref);

        try {
            if (
                this.document.components == null ||
                this.document.components.securitySchemes == null ||
                !securityScheme.$ref.startsWith(SECURITY_SCHEME_REFERENCE_PREFIX)
            ) {
                throw new Error(`Failed to resolve ${securityScheme.$ref}`);
            }
            const securitySchemeKey = securityScheme.$ref.substring(SECURITY_SCHEME_REFERENCE_PREFIX.length);
            const resolvedSecurityScheme = this.document.components.securitySchemes[securitySchemeKey];
            if (resolvedSecurityScheme == null) {
                throw new Error(`${securityScheme.$ref} is undefined`);
            }
            if (isReferenceObject(resolvedSecurityScheme)) {
                return this.resolveSecuritySchemeReference(resolvedSecurityScheme);
            }
            return resolvedSecurityScheme;
        } finally {
            // Remove current reference from stack
            this.resolutionStack.delete(securityScheme.$ref);
        }
    }

    public referenceExists(ref: string): boolean {
        // Step 1: Get keys
        const keys = ref
            .substring(2)
            .split("/")
            .map((key) => key.replace(/~1/g, "/"));

        // Step 2: Index recursively into the document with all the keys
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        let resolvedSchema: any = this.document;
        for (const key of keys) {
            if (typeof resolvedSchema !== "object" || resolvedSchema == null) {
                return false;
            }
            resolvedSchema = resolvedSchema[key];
        }
        return true;
    }

    public abstract markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void;

    public abstract markSchemaAsReferencedByRequest(schemaId: SchemaId): void;

    public abstract getReferencedSchemas(): Set<SchemaId>;

    public abstract getDummy(): SchemaParserContext;

    public abstract markReferencedByDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject,
        discriminant: string,
        times: number
    ): void;

    public abstract markSchemaWithDiscriminantValue(
        schema: OpenAPIV3.ReferenceObject,
        discriminant: string,
        discriminantValue: string
    ): void;

    public abstract getDiscriminatedUnionMetadata(
        schema: OpenAPIV3.ReferenceObject
    ): DiscriminatedUnionMetadata | undefined;

    public abstract getReferencesFromDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject
    ): DiscriminatedUnionReference | undefined;

    public abstract excludeSchema(schemaId: SchemaId): void;

    public abstract isSchemaExcluded(schemaId: SchemaId): boolean;
}
