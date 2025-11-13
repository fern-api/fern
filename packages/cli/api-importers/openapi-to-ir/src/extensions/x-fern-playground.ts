import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernPlaygroundExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }
}

export class FernPlaygroundExtension extends AbstractExtension<boolean> {
    private readonly document: object;
    public readonly key = "x-fern-playground";

    constructor({ breadcrumbs, document, context }: FernPlaygroundExtension.Args) {
        super({ breadcrumbs, context });
        this.document = document;
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.document);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            this.context.errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-playground",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
