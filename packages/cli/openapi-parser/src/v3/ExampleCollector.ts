import { PartialExample, SchemaId } from "@fern-fern/openapi-ir-model/ir";

export class ExampleCollector {
    private examples: Record<SchemaId, PartialExample> = {};

    // TODO: If useful, we could expose other APIs to collect
    //       differnet formats and map them into PartialExamples
    //       implicitly.
    public collect(schemaId: SchemaId, example: PartialExample): void {
        this.examples[schemaId] = example;
    }

    public get(schemaId: SchemaId): PartialExample | undefined {
        return this.examples[schemaId];
    }
}
