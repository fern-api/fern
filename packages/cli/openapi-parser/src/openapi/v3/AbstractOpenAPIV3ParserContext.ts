import { Logger } from "@fern-api/logger";
import { HttpError, SchemaId, StatusCode } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { SCHEMA_REFERENCE_PREFIX } from "../../schema/convertSchemas";
import { SchemaParserContext } from "../../schema/SchemaParserContext";
import { getReferenceOccurrences } from "../../schema/utils/getReferenceOccurrences";
import { isReferenceObject } from "../../schema/utils/isReferenceObject";

export const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";
export const RESPONSE_REFERENCE_PREFIX = "#/components/responses/";
export const REQUEST_BODY_REFERENCE_PREFIX = "#/components/requestBodies/";

export interface DiscriminatedUnionReference {
    discriminants: Set<string>;
    numReferences: number;
}

export abstract class AbstractOpenAPIV3ParserContext implements SchemaParserContext {
    public logger: Logger;
    public document: OpenAPIV3.Document;
    public taskContext: TaskContext;
    public authHeaders: Set<string>;
    public refOccurrences: Record<string, number>;
    public DUMMY: SchemaParserContext;

    constructor({
        document,
        taskContext,
        authHeaders
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        authHeaders: Set<string>;
    }) {
        this.document = document;
        this.logger = taskContext.logger;
        this.taskContext = taskContext;
        this.authHeaders = authHeaders;
        this.refOccurrences = getReferenceOccurrences(document);
        this.DUMMY = this.getDummy();
    }

    public getNumberOfOccurrencesForRef(schema: OpenAPIV3.ReferenceObject): number {
        return this.refOccurrences[schema.$ref] ?? 0;
    }

    public resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject {
        const startsWithSchemaReferencePrefix = schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX);
        const endsWithSchemaSuffix = schema.$ref.endsWith("/schema");

        if (
            this.document.components == null ||
            this.document.components.schemas == null ||
            (!startsWithSchemaReferencePrefix && !endsWithSchemaSuffix)
        ) {
            throw new Error(`Failed to resolve ${schema.$ref}`);
        }
        let schemaKey: string;
        let resolvedSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined;

        if (startsWithSchemaReferencePrefix) {
            schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
            const splitSchemaKey = schemaKey.split("/");

            if (splitSchemaKey[0] == null) {
                throw new Error(`${schema.$ref} is undefined`);
            }
            resolvedSchema = this.document.components.schemas[splitSchemaKey[0]];
            if (resolvedSchema == null) {
                throw new Error(`${splitSchemaKey[0]} is undefined`);
            }
            if (isReferenceObject(resolvedSchema)) {
                resolvedSchema = this.resolveSchemaReference(resolvedSchema);
            }

            if (splitSchemaKey[1] === "properties" && splitSchemaKey[2] != null) {
                const resolvedProperty = resolvedSchema.properties?.[splitSchemaKey[2]];
                if (resolvedProperty == null) {
                    throw new Error(`${schema.$ref} is undefiened. Property does not exist on object.`);
                } else if (isReferenceObject(resolvedProperty)) {
                    resolvedSchema = this.resolveSchemaReference(resolvedProperty);
                } else {
                    resolvedSchema = resolvedProperty;
                }
            }

            return resolvedSchema;
        } else {
            schemaKey = schema.$ref.substring(2);
            const parts = schemaKey.split("/");
            let currentObject: any = this.document;

            for (const part of parts) {
                // Replace any escaped characters back to their original form
                const key = part.replace(/~1/g, "/");

                // Access the next nested property
                currentObject = currentObject[key];
            }

            resolvedSchema = currentObject;

            if (resolvedSchema == null) {
                throw new Error(`${schemaKey} is undefined`);
            }

            if (isReferenceObject(resolvedSchema)) {
                resolvedSchema = this.resolveSchemaReference(resolvedSchema);
            }

            if (parts[1] === "properties" && parts[2] != null) {
                const resolvedProperty = resolvedSchema.properties?.[parts[2]];
                if (resolvedProperty == null) {
                    throw new Error(`${schema.$ref} is undefiened. Property does not exist on object.`);
                } else if (isReferenceObject(resolvedProperty)) {
                    resolvedSchema = this.resolveSchemaReference(resolvedProperty);
                } else {
                    resolvedSchema = resolvedProperty;
                }
            }

            const schemaId = schema.$ref;

            this.document.components.schemas[schemaId] = resolvedSchema;

            return resolvedSchema;
        }
    }

    public resolveParameterReference(parameter: OpenAPIV3.ReferenceObject): OpenAPIV3.ParameterObject {
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
    }

    public resolveRequestBodyReference(requestBody: OpenAPIV3.ReferenceObject): OpenAPIV3.RequestBodyObject {
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
    }

    public resolveResponseReference(response: OpenAPIV3.ReferenceObject): OpenAPIV3.ResponseObject {
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
    }

    public abstract markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void;

    public abstract markSchemaAsReferencedByRequest(schemaId: SchemaId): void;

    public abstract getReferencedSchemas(): Set<SchemaId>;

    public abstract getDummy(): SchemaParserContext;

    public abstract markSchemaForStatusCode(
        statusCode: number,
        schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
    ): void;

    public abstract markReferencedByDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject,
        discrminant: string,
        times: number
    ): void;

    public abstract getReferencesFromDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject
    ): DiscriminatedUnionReference | undefined;

    public abstract getErrors(): Record<StatusCode, HttpError>;

    public abstract excludeSchema(schemaId: SchemaId): void;

    public abstract isSchemaExcluded(schemaId: SchemaId): boolean;
}
