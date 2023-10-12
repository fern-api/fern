import { FullExample, SchemaInstanceId } from "@fern-fern/openapi-ir-model/example";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext";

export class ExampleTypeFactory {
    private context: AbstractOpenAPIV3ParserContext;
    private examples: Record<SchemaInstanceId, FullExample> = {};

    constructor(context: AbstractOpenAPIV3ParserContext) {
        this.context = context;
    }

    public buildExample(_schemaInstanceId: SchemaInstanceId): FullExample {
        throw new Error("Unimplemented");
    }
}
