import { assertNever } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import {
    FullExample,
    PartialExample,
    PartialObjectExample,
    ReferencedExample,
    SchemaInstanceId,
} from "@fern-fern/openapi-ir-model/example";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { ExampleCollector } from "../../ExampleCollector";

export class ExampleTypeFactory {
    private logger: Logger;
    private exampleCollector: ExampleCollector;

    constructor(context: AbstractOpenAPIV3ParserContext) {
        this.logger = context.logger;
        this.exampleCollector = context.exampleCollector;
    }

    public buildExample(schemaInstanceId: SchemaInstanceId): FullExample | undefined {
        const example = this.exampleCollector.get(schemaInstanceId);
        if (example == null) {
            return undefined;
        }
        switch (example.type) {
            case "full":
                return example.full;
            case "partial":
                return this.buildFromPartialExample(example.partial);
            case "reference":
                return this.buildFromReference(example);
            default:
                assertNever(example);
        }
    }

    private buildFromPartialExample(partialExample: PartialExample): FullExample | undefined {
        switch (partialExample.type) {
            case "object":
                return this.buildFromPartialObjectExample(partialExample);
            case "oneOf":
                this.logger.error("Skipping nested oneOf example");
                return undefined;
            default:
                assertNever(partialExample);
        }
    }

    private buildFromPartialObjectExample(partialObjectExample: PartialObjectExample): FullExample | undefined {
        if (Object.keys(partialObjectExample.includedProperties).length === 0) {
            return undefined;
        }
        const fullExample: Record<PropertyKey, FullExample> = {};
        for (const [propertyKey, propertyExample] of Object.entries(partialObjectExample.includedProperties)) {
            switch (propertyExample.type) {
                case "full":
                    fullExample[propertyKey] = propertyExample.full;
                    break;
                case "partial": {
                    const partialExample = this.buildFromPartialExample(propertyExample.partial);
                    if (partialExample != null) {
                        fullExample[propertyKey] = partialExample;
                    }
                    break;
                }
                case "reference": {
                    const referencedExample = this.buildFromReference(propertyExample);
                    if (referencedExample != null) {
                        fullExample[propertyKey] = referencedExample;
                    }
                    break;
                }
                default:
                    assertNever(propertyExample);
            }
        }
        return FullExample.object({ properties: fullExample });
    }

    private buildFromReference(referenceExample: ReferencedExample): FullExample | undefined {
        return this.buildExample(referenceExample.reference);
    }
}
