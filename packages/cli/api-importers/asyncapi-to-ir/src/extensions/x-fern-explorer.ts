import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernExplorerExtension {
    export interface Args extends AbstractExtension.Args {
        node: object;
    }
}

/**
 * Reads the `x-fern-explorer` extension, which controls whether a channel is
 * shown in the API playground. It can be set globally (at the document root)
 * or per channel, with the per-channel value taking precedence.
 */
export class FernExplorerExtension extends AbstractExtension<boolean> {
    private readonly node: object;
    public readonly key = "x-fern-explorer";

    constructor({ breadcrumbs, node, context }: FernExplorerExtension.Args) {
        super({ breadcrumbs, context });
        this.node = node;
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.node);
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
