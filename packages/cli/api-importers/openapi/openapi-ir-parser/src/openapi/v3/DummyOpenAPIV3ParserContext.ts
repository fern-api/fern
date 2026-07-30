import { SchemaId, Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";

import { ParseOpenAPIOptions } from "../../options.js";
import {
    AbstractOpenAPIV3ParserContext,
    DiscriminatedUnionMetadata,
    DiscriminatedUnionReference,
    OpenAPIV3DocumentMetadata
} from "./AbstractOpenAPIV3ParserContext.js";

export class DummyOpenAPIV3ParserContext extends AbstractOpenAPIV3ParserContext {
    constructor({
        document,
        taskContext,
        options,
        source,
        namespace,
        documentMetadata
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        options: ParseOpenAPIOptions;
        source: Source;
        namespace: string | undefined;
        documentMetadata?: OpenAPIV3DocumentMetadata;
    }) {
        super({
            document,
            taskContext,
            authHeaders: new Set(),
            options,
            source,
            namespace,
            documentMetadata
        });
    }

    public getDummy(): AbstractOpenAPIV3ParserContext {
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
        _discriminant: string,
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
        _discriminant: string,
        _discriminantValue: string
    ): void {
        return;
    }

    public getDiscriminatedUnionMetadata(_schema: OpenAPIV3.ReferenceObject): DiscriminatedUnionMetadata | undefined {
        return;
    }
}
