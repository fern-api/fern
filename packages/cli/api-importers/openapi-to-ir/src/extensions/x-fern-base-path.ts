import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernBasePathExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }
}

export class FernBasePathExtension extends AbstractExtension<string> {
    private readonly document: object;
    public readonly key = "x-fern-base-path";

    constructor({ breadcrumbs, document, context }: FernBasePathExtension.Args) {
        super({ breadcrumbs, context });
        this.document = document;
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.document);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            this.context.errorCollector.collect({
                message: "Received unexpected non-string value for x-fern-base-path",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
