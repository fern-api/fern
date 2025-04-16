import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";

export declare namespace FernExamplesExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }

    export type Output = RawSchemas.ExampleEndpointCallArraySchema;
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-examples";

    constructor({ breadcrumbs, operation }: FernExamplesExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): FernExamplesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const exampleArray = Array.isArray(extensionValue) ? extensionValue : [];

        const validatedExampleEndpointCalls: RawSchemas.ExampleEndpointCallArraySchema = exampleArray.filter(
            (example) => {
                const maybeFernExample = RawSchemas.serialization.ExampleEndpointCallSchema.parse(example);
                if (!maybeFernExample.ok) {
                    context.logger.error(`Failed to parse x-fern-example in ${this.breadcrumbs.join(".")}`);
                }
                return maybeFernExample.ok;
            }
        );

        return validatedExampleEndpointCalls;
    }
}
