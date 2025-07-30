import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace DisplayNameExtension {
    export interface Args extends AbstractExtension.Args {
        tag: object;
    }

    export interface Output {
        displayName: string;
    }
}

export class DisplayNameExtension extends AbstractExtension<DisplayNameExtension.Output> {
    private readonly tag: object;
    public readonly key = "x-displayName";

    constructor({ breadcrumbs, tag, context }: DisplayNameExtension.Args) {
        super({ breadcrumbs, context });
        this.tag = tag;
    }

    public convert(): DisplayNameExtension.Output | undefined {
        if (typeof this.tag !== "object" || this.tag == null) {
            return undefined;
        }

        const extensionValue = (this.tag as Record<string, unknown>)[this.key];

        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            this.context.errorCollector.collect({
                message: "x-displayName extension must be a string",
                path: this.breadcrumbs
            });
            return undefined;
        }

        if (extensionValue.trim().length === 0) {
            return undefined;
        }

        return {
            displayName: extensionValue
        };
    }
}
