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
import { DummyOpenAPIV3ParserContext } from "./DummyOpenAPIV3ParserContext";

export class OpenAPIV3ParserContext extends AbstractOpenAPIV3ParserContext {
    public readonly nonRequestReferencedSchemas: Set<SchemaId> = new Set();

    private twoOrMoreRequestsReferencedSchemas: Set<SchemaId> = new Set();
    private singleRequestReferencedSchemas: Set<SchemaId> = new Set();
    private discrminatedUnionReferences: Record<string, DiscriminatedUnionReference> = {};
    private discrminatedUnionMetadata: Record<string, DiscriminatedUnionMetadata> = {};
    private schemasToExclude: Set<SchemaId> = new Set();

    constructor({
        document,
        taskContext,
        authHeaders,
        options,
        source,
        namespace
    }: {
        document: OpenAPIV3.Document;
        taskContext: TaskContext;
        authHeaders: Set<string>;
        options: ParseOpenAPIOptions;
        source: Source;
        namespace?: string;
    }) {
        super({
            document,
            taskContext,
            authHeaders,
            options,
            source,
            namespace
        });
    }

    public getDummy(): SchemaParserContext {
        return new DummyOpenAPIV3ParserContext({
            document: this.document,
            taskContext: this.taskContext,
            options: this.options,
            source: this.source,
            namespace: this.namespace
        });
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

    public markSchemaWithDiscriminantValue(
        schema: OpenAPIV3.ReferenceObject,
        discrminant: string,
        discriminantValue: string
    ): void {
        const existingMetadata = this.discrminatedUnionMetadata[schema.$ref];
        if (existingMetadata != null) {
            existingMetadata.discriminants.set(discrminant, discriminantValue);
        } else {
            this.discrminatedUnionMetadata[schema.$ref] = {
                discriminants: new Map([[discrminant, discriminantValue]])
            };
        }
    }

    public getDiscriminatedUnionMetadata(schema: OpenAPIV3.ReferenceObject): DiscriminatedUnionMetadata | undefined {
        return this.discrminatedUnionMetadata[schema.$ref];
    }

    public excludeSchema(schemaId: SchemaId): void {
        this.schemasToExclude.add(schemaId);
    }

    public isSchemaExcluded(schemaId: SchemaId): boolean {
        return this.schemasToExclude.has(schemaId);
    }
}
