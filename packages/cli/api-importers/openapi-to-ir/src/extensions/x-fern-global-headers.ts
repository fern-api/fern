import { AbstractExtension } from '@fern-api/v2-importer-commons'

export declare namespace FernGlobalHeadersExtension {
    export interface Args extends AbstractExtension.Args {
        document: object
    }

    export interface GlobalHeaderExtension {
        header: string
        name: string | undefined
        optional: boolean | undefined
        env: string | undefined
        type: string | undefined
    }
}

export class FernGlobalHeadersExtension extends AbstractExtension<FernGlobalHeadersExtension.GlobalHeaderExtension[]> {
    private readonly document: object
    public readonly key = 'x-fern-global-headers'

    constructor({ breadcrumbs, document, context }: FernGlobalHeadersExtension.Args) {
        super({ breadcrumbs, context })
        this.document = document
    }

    public convert(): FernGlobalHeadersExtension.GlobalHeaderExtension[] | undefined {
        const extensionValue = this.getExtensionValue(this.document)
        if (extensionValue == null) {
            return undefined
        }

        if (!Array.isArray(extensionValue)) {
            this.context.errorCollector.collect({
                message: 'Received unexpected non-array value for x-fern-global-headers',
                path: this.breadcrumbs
            })
            return undefined
        }

        return extensionValue
    }
}
