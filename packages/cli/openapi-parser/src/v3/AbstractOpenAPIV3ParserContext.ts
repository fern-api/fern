import { Logger } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { SchemaId, StatusCode } from "@fern-fern/openapi-ir-model/commons";
import { HttpError } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIV3 } from "openapi-types";
import { SCHEMA_REFERENCE_PREFIX } from "./converters/convertSchemas";
import { getReferenceOccurrences } from "./utils/getReferenceOccurrences";
import { isReferenceObject } from "./utils/isReferenceObject";

export const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";
export const RESPONSE_REFERENCE_PREFIX = "#/components/responses/";
export const REQUEST_BODY_REFERENCE_PREFIX = "#/components/requestBodies/";

export interface DiscriminatedUnionReference {
    discriminants: Set<string>;
    numReferences: number;
}

export abstract class AbstractOpenAPIV3ParserContext {
    public logger: Logger;
    public document: OpenAPIV3.Document;
    public taskContext: TaskContext;
    public authHeaders: Set<string>;
    public refOccurrences: Record<string, number>;

    constructor({
        document,
        taskContext,
        authHeaders,
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
    }

    public getNumberOfOccurrencesForRef(schema: OpenAPIV3.ReferenceObject): number {
        return this.refOccurrences[schema.$ref] ?? 0;
    }

    public resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject {
        if (
            this.document.components == null ||
            this.document.components.schemas == null ||
            !schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)
        ) {
            throw new Error(`Failed to resolve ${schema.$ref}`);
        }
        const schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
        const splitSchemaKey = schemaKey.split("/");
        if (splitSchemaKey[0] == null) {
            throw new Error(`${schema.$ref} is undefined`);
        }
        let resolvedSchema = this.document.components.schemas[splitSchemaKey[0]];
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
}
