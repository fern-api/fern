import { AbstractConverter } from "@fern-api/v2-importer-commons";
import { AbstractExtension } from "@fern-api/v2-importer-commons";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";

export declare namespace FernWebhookExtension {
    export interface Args extends AbstractConverter.Args {
        operation: object;
    }
}

export class FernWebhookExtension extends AbstractExtension<OpenAPIConverterContext3_1, boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-webhook";

    constructor({ breadcrumbs, operation }: FernWebhookExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-webhook",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
