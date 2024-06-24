import { SchemaId } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { ParseOpenAPIOptions } from "../../options";
import { SchemaParserContext } from "../../schema/SchemaParserContext";
import {
    AbstractOpenAPIV3ParserContext,
    DiscriminatedUnionMetadata,
    DiscriminatedUnionReference
} from "./AbstractOpenAPIV3ParserContext";

export class DummyOpenAPIV3ParserContext extends AbstractOpenAPIV3ParserContext {
    constructor({
        document,
        taskContext,
        options
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        options: ParseOpenAPIOptions;
    }) {
        super({
            document,
            taskContext,
            authHeaders: new Set(),
            options
        });
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

    public excludeSchema(_schemaId: SchemaId): void {
        // noop
    }

    public isSchemaExcluded(_schemaId: SchemaId): boolean {
        return false;
    }

    public markSchemaWithDiscriminantValue(
        _schema: OpenAPIV3.ReferenceObject,
        _discrminant: string,
        _discriminantValue: string
    ): void {
        return;
    }

    public getDiscriminatedUnionMetadata(_schema: OpenAPIV3.ReferenceObject): DiscriminatedUnionMetadata | undefined {
        return;
    }
}
