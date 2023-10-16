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
        if (example?.type === "full") {
            return example.full;
        } else if (example?.type === "partial") {
            if (example.partial.type === "object") {
                const fullExample: Record<PropertyKey, FullExample> = {};
                for (const [propertyKey, propertyExample] of Object.entries(example.partial.includedProperties)) {
                    if (propertyExample.type === "full") {
                        fullExample[propertyKey] = propertyExample.full;
                    } else if (propertyExample.type === "reference") {
                        const referencedExample = this.buildExample(propertyExample.reference);
                        if (referencedExample != null) {
                            fullExample[propertyKey] = referencedExample;
                        }
                    }
                }
                return FullExample.object({ properties: fullExample });
            }
        }
        return undefined;
    }
}
