import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernSubtitleExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernSubtitleExtension extends AbstractExtension<string> {
    private readonly operation: object;
    public readonly key = "x-fern-subtitle";

    constructor({ breadcrumbs, operation, context }: FernSubtitleExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            this.context.errorCollector.collect({
                message: "Received unexpected non-string value for x-fern-subtitle",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
