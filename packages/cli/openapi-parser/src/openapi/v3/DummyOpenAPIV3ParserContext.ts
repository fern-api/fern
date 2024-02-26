import { HttpError, SchemaId, StatusCode } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { SchemaParserContext } from "../../schema/SchemaParserContext";
import { AbstractOpenAPIV3ParserContext, DiscriminatedUnionReference } from "./AbstractOpenAPIV3ParserContext";

export class DummyOpenAPIV3ParserContext extends AbstractOpenAPIV3ParserContext {
    constructor({ document, taskContext }: { document: OpenAPIV3.Document; taskContext: TaskContext }) {
        super({ document, taskContext, authHeaders: new Set() });
    }

    public getDummy(): SchemaParserContext {
        return this;
    }

    public markSchemaAsReferencedByNonRequest(_schemaId: SchemaId): void {
        return;
    }

    public markSchemaAsReferencedByRequest(_schemaId: SchemaId): void {
        return;
    }

    public getReferencedSchemas(): Set<SchemaId> {
        return new Set();
    }

    public markSchemaForStatusCode(
        _statusCode: number,
        _schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
    ): void {
        return;
    }

    public markReferencedByDiscriminatedUnion(
        _schema: OpenAPIV3.ReferenceObject,
        _discrminant: string,
        _times: number
    ): void {
        return;
    }

    public getReferencesFromDiscriminatedUnion(
        _schema: OpenAPIV3.ReferenceObject
    ): DiscriminatedUnionReference | undefined {
        return undefined;
    }

    public getErrors(): Record<StatusCode, HttpError> {
        return {};
    }
}
