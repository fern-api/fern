import { OpenAPIV3_1 } from 'openapi-types'

import { AbstractExtension } from '../AbstractExtension'

export declare namespace FernOptionalExtension {
    export interface Args extends AbstractExtension.Args {
        parameter: OpenAPIV3_1.ParameterObject
    }
}

export class FernOptionalExtension extends AbstractExtension<boolean> {
    private readonly parameter: object
    public readonly key = 'x-fern-optional'

    constructor({ breadcrumbs, parameter, context }: FernOptionalExtension.Args) {
        super({ breadcrumbs, context })
        this.parameter = parameter
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.parameter)
        if (extensionValue == null) {
            return undefined
        }

        if (typeof extensionValue !== 'boolean') {
            this.context.errorCollector.collect({
                message: 'Received unexpected non-boolean value for x-fern-optional',
                path: this.breadcrumbs
            })
            return undefined
        }

        return extensionValue
    }
}
