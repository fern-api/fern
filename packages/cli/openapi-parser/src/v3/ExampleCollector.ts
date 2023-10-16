import { Logger } from "@fern-api/logger";
import { Example, SchemaInstanceId } from "@fern-fern/openapi-ir-model/example";

export class ExampleCollector {
    private logger: Logger;
    private examples: Record<SchemaInstanceId, Example> = {};

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public collect(schemaId: SchemaInstanceId, example: Example): void {
        this.logger.info(`Storing example for ${schemaId}`);
        this.examples[schemaId] = example;
    }

    public get(schemaId: SchemaInstanceId): Example | undefined {
        if (this.examples[schemaId] != null) {
            this.logger.info(`Requesting example for ${schemaId}. Exists!`);
        } else {
            this.logger.info(`Requesting example for ${schemaId}. Does not exist!`);
        }
        return this.examples[schemaId];
    }
}
