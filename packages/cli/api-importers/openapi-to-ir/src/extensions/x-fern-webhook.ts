import { AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

export declare namespace FernWebhookExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernWebhookExtension extends AbstractExtension<boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-webhook";

    constructor({ breadcrumbs, operation }: FernWebhookExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({ errorCollector }: { errorCollector: ErrorCollector }): boolean | undefined {
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
