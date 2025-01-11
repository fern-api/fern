import { OpenAPIV3 } from "openapi-types";

import { SchemaId, Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";

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
        options,
        source,
        namespace
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        options: ParseOpenAPIOptions;
        source: Source;
        namespace: string | undefined;
    }) {
        super({
            document,
            taskContext,
            authHeaders: new Set(),
            options,
            source,
            namespace
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
