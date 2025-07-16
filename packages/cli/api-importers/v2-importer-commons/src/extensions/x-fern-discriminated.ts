import { AbstractExtension } from "../AbstractExtension"

export declare namespace FernDiscriminatedExtension {
    export interface Args extends AbstractExtension.Args {
        node: unknown
    }
}

export class FernDiscriminatedExtension extends AbstractExtension<boolean | undefined> {
    private readonly node: unknown
    public readonly key = "x-fern-discriminated"

    constructor({ breadcrumbs, node, context }: FernDiscriminatedExtension.Args) {
        super({ breadcrumbs, context })
        this.node = node
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.node)
        if (extensionValue == null) {
            return undefined
        }

        if (typeof extensionValue !== "boolean") {
            return undefined
        }

        return extensionValue
    }
}
