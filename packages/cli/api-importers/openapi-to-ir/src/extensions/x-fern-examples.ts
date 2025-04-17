import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbstractConverter, AbstractConverterContext, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";


export declare namespace FernExamplesExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
        context: AbstractConverterContext<object>
    }

    export type Output = RawSchemas.ExampleEndpointCallArraySchema;
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly operation: object;
    private readonly context: AbstractConverterContext<object>;

    public readonly key = "x-fern-examples";

    constructor({ context, breadcrumbs, operation }: FernExamplesExtension.Args) {
        super({ breadcrumbs });
        this.context = context;
        this.operation = operation;
    }

    public convert({
        errorCollector
    }: {
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
                    this.context.logger.error(`Failed to parse x-fern-example in ${this.breadcrumbs.join(".")}`);
                }
                return maybeFernExample.ok;
            }
        );

        return validatedExampleEndpointCalls;
    }
}
