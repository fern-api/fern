import { AbstractConverter, AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernRetriesExtension {
    export interface Args extends AbstractConverter.AbstractArgs {
        operation: object;
    }

    export type Output = void;
}

export class FernRetriesExtension extends AbstractExtension<FernRetriesExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-retries";

    constructor({ breadcrumbs, operation, context }: FernRetriesExtension.Args) {
        super({ breadcrumbs: breadcrumbs ?? [], context });
        this.operation = operation;
    }

    public convert(): FernRetriesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        this.context.errorCollector.collect({
            message:
                "x-fern-retries is not supported for AsyncAPI WebSocket channels and will be ignored. " +
                "Retry configuration is only supported for OpenAPI HTTP endpoints. " +
                "For more information, see: https://docs.buildwithfern.com/api-definition/openapi/extensions/retries",
            path: this.breadcrumbs
        });

        return undefined;
    }
}
