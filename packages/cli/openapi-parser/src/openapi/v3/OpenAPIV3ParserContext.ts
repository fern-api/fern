import { HttpError, SchemaId, StatusCode } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { SchemaParserContext } from "../../schema/SchemaParserContext";
import { AbstractOpenAPIV3ParserContext, DiscriminatedUnionReference } from "./AbstractOpenAPIV3ParserContext";
import { convertToError } from "./converters/convertToHttpError";
import { DummyOpenAPIV3ParserContext } from "./DummyOpenAPIV3ParserContext";
import { ErrorBodyCollector } from "./ErrorBodyCollector";

export class OpenAPIV3ParserContext extends AbstractOpenAPIV3ParserContext {
    private nonRequestReferencedSchemas: Set<SchemaId> = new Set();

    private twoOrMoreRequestsReferencedSchemas: Set<SchemaId> = new Set();
    private singleRequestReferencedSchemas: Set<SchemaId> = new Set();

    private discrminatedUnionReferences: Record<string, DiscriminatedUnionReference> = {};
    private errorBodies: Record<number, ErrorBodyCollector> = {};

    private schemasToExclude: Set<SchemaId> = new Set();

    constructor({
        document,
        taskContext,
        authHeaders
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        authHeaders: Set<string>;
    }) {
        super({ document, taskContext, authHeaders });
    }

    public getDummy(): SchemaParserContext {
        return new DummyOpenAPIV3ParserContext({ document: this.document, taskContext: this.taskContext });
    }

    public markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void {
        this.nonRequestReferencedSchemas.add(schemaId);
    }

    public markSchemaAsReferencedByRequest(schemaId: SchemaId): void {
        if (this.singleRequestReferencedSchemas.has(schemaId)) {
            this.twoOrMoreRequestsReferencedSchemas.add(schemaId);
        } else {
            this.singleRequestReferencedSchemas.add(schemaId);
        }
    }

    public getReferencedSchemas(): Set<SchemaId> {
        return new Set([...this.nonRequestReferencedSchemas, ...this.twoOrMoreRequestsReferencedSchemas]);
    }

    public markSchemaForStatusCode(
        statusCode: number,
        schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
    ): void {
        if (this.errorBodies[statusCode] != null) {
            this.errorBodies[statusCode]?.collect(schema);
        } else {
            const collector = new ErrorBodyCollector(this);
            collector.collect(schema);
            this.errorBodies[statusCode] = collector;
        }
    }

    public markReferencedByDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject,
        discrminant: string,
        times: number
    ): void {
        const existingReference = this.discrminatedUnionReferences[schema.$ref];
        if (existingReference != null) {
            existingReference.discriminants.add(discrminant);
            existingReference.numReferences += times;
        } else {
            this.discrminatedUnionReferences[schema.$ref] = {
                discriminants: new Set([discrminant]),
                numReferences: times
            };
        }
    }

    public getReferencesFromDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject
    ): DiscriminatedUnionReference | undefined {
        return this.discrminatedUnionReferences[schema.$ref];
    }

    public getErrors(): Record<StatusCode, HttpError> {
        const errors: Record<StatusCode, HttpError> = {};
        Object.entries(this.errorBodies).forEach(([statusCode, errorBodyCollector]) => {
            const parsedStatusCode = parseInt(statusCode);
            const convertedError = convertToError({
                statusCode: parsedStatusCode,
                errorBodyCollector,
                context: this
            });
            if (convertedError != null) {
                errors[parsedStatusCode] = convertedError;
            }
        });
        return errors;
    }

    public excludeSchema(schemaId: SchemaId): void {
        this.schemasToExclude.add(schemaId);
    }

    public isSchemaExcluded(schemaId: SchemaId): boolean {
        return this.schemasToExclude.has(schemaId);
    }
}
