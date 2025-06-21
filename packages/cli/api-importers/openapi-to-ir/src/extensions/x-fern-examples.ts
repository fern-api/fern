import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbstractExtension } from "@fern-api/v2-importer-commons";

export declare namespace FernExamplesExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }

    export type Output = RawSchemas.ExampleEndpointCallArraySchema;
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly operation: object;

    public readonly key = "x-fern-examples";

    constructor({ context, breadcrumbs, operation }: FernExamplesExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): FernExamplesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const exampleArray = Array.isArray(extensionValue) ? extensionValue : [];

        const validatedExampleEndpointCalls: RawSchemas.ExampleEndpointCallArraySchema = exampleArray.filter(
            (example) => {
                const maybeFernExample = RawSchemas.serialization.ExampleEndpointCallSchema.parse(example);
                if (!maybeFernExample.ok) {
                    this.context.errorCollector.collect({
                        message: `Failed to parse x-fern-example in ${this.breadcrumbs.join(".")}`,
                        path: this.breadcrumbs
                    });
                }
                return maybeFernExample.ok;
            }
        );

        return validatedExampleEndpointCalls;
    }
}
