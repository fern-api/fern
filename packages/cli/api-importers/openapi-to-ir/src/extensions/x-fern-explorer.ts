import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernExplorerExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }
}

export class FernExplorerExtension extends AbstractExtension<boolean> {
    private readonly document: object;
    public readonly key = "x-fern-explorer";

    constructor({ breadcrumbs, document, context }: FernExplorerExtension.Args) {
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
                message: "Received unexpected non-boolean value for x-fern-explorer",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
