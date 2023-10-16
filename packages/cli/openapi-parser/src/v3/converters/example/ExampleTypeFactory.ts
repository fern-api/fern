import { FullExample, SchemaInstanceId } from "@fern-fern/openapi-ir-model/example";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { ExampleCollector } from "../../ExampleCollector";

export class ExampleTypeFactory {
    private exampleCollector: ExampleCollector;

    constructor(context: AbstractOpenAPIV3ParserContext) {
        this.exampleCollector = context.exampleCollector;
    }

    public buildExample(schemaInstanceId: SchemaInstanceId): FullExample | undefined {
        const example = this.exampleCollector.get(schemaInstanceId);
        if (example != null && example.type === "full") {
            return example.full;
        }
        return undefined;
    }
}
