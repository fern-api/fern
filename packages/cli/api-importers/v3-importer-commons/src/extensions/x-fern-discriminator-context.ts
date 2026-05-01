import { AbstractExtension } from "../AbstractExtension.js";

export declare namespace FernDiscriminatorContextExtension {
    export interface Args extends AbstractExtension.Args {
        node: unknown;
    }
}

export class FernDiscriminatorContextExtension extends AbstractExtension<"data" | "protocol"> {
    private readonly node: unknown;
    public readonly key = "x-fern-discriminator-context";

    constructor({ breadcrumbs, node, context }: FernDiscriminatorContextExtension.Args) {
        super({ breadcrumbs, context });
        this.node = node;
    }

    public convert(): "data" | "protocol" | undefined {
        const extensionValue = this.getExtensionValue(this.node);
        if (extensionValue === "data" || extensionValue === "protocol") {
            return extensionValue;
        }
        return undefined;
    }
}
