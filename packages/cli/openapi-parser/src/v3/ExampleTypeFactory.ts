import {
    Example,
    PartialExample,
    PartialObjectExample,
    ReferencedExample,
    SchemaId,
} from "@fern-fern/openapi-ir-model/ir";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext";

export class ExampleTypeFactory {
    private context: AbstractOpenAPIV3ParserContext;
    private examples: Record<SchemaId, Example> = {};

    constructor(context: AbstractOpenAPIV3ParserContext) {
        this.context = context;
    }

    public get(schemaId: SchemaId): Example {
        if (this.examples[schemaId] !== undefined) {
            return this.examples[schemaId];
        }
        const partialExample: PartialExample | undefined = this.context.exampleCollector.get(schemaId);
        if (partialExample === undefined) {
            // TODO: There isn't an example for this schema, so we need to generate one.
            return {
                type: "unknown",
            };
        }
        return this.buildExample(partialExample);
    }

    private buildExample(partialExample: PartialExample): Example {
        if (partialExample.type === "partialObject") {
            return this.buildExampleFromPartialObject(partialExample);
        }
        if (partialExample.type === "reference") {
            return this.buildExampleFromReference(partialExample);
        }
        // If we don't have a partial object, the Example is
        // prepared as-is.
        return partialExample;
    }

    private buildExampleFromPartialObject(_partialObject: PartialObjectExample): Example {
        // TODO: Implement the PartialObjectExample -> ObjectExample mapper.
        return {
            type: "unknown",
        };
    }

    private buildExampleFromReference(_reference: ReferencedExample): Example {
        const schemaId = this.context.refToSchemaId[_reference.reference];
        if (schemaId === undefined) {
            throw new Error(`Cannot build example for reference that does not exist: ${_reference.reference}`);
        }
        return this.get(schemaId);
    }
}
