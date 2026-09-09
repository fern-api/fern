import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernBaseUrlEnvExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }
}

export class FernBaseUrlEnvExtension extends AbstractExtension<string> {
    private readonly document: object;
    public readonly key = "x-fern-base-url-env";

    constructor({ breadcrumbs, document, context }: FernBaseUrlEnvExtension.Args) {
        super({ breadcrumbs, context });
        this.document = document;
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.document);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string" || extensionValue.length === 0) {
            this.context.errorCollector.collect({
                message: "Received unexpected non-string value for x-fern-base-url-env",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
