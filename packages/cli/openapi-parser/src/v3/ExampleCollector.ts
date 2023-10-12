import { Example, SchemaInstanceId } from "@fern-fern/openapi-ir-model/example";

export class ExampleCollector {
    private examples: Record<SchemaInstanceId, Example> = {};

    public collect(schemaId: SchemaInstanceId, example: Example): void {
        this.examples[schemaId] = example;
    }

    public get(schemaId: SchemaInstanceId): Example | undefined {
        return this.examples[schemaId];
    }
}
