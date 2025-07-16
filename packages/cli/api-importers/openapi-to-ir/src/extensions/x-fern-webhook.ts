import { AbstractExtension } from "@fern-api/v2-importer-commons";

export declare namespace FernWebhookExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernWebhookExtension extends AbstractExtension<boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-webhook";

    constructor({ breadcrumbs, operation, context }: FernWebhookExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            this.context.errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-webhook",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
