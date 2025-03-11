import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";

export declare namespace FernIgnoreExtension {
    export interface Args extends AbstractConverter.Args {
        operation: object;
    }
}

export class FernIgnoreExtension extends AbstractExtension<AsyncAPIConverterContext, boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-ignore";

    constructor({ breadcrumbs, operation }: FernIgnoreExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-ignore",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
