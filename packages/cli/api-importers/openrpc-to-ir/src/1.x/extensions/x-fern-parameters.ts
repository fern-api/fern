import { OpenAPIV3 } from 'openapi-types'
import { z } from 'zod'

import { AbstractConverterContext, AbstractExtension } from '@fern-api/v2-importer-commons'

const REQUEST_PREFIX = '$request.'

const ParameterBaseObjectSchema = z.object({
    description: z.string().optional(),
    required: z.boolean().optional(),
    deprecated: z.boolean().optional(),
    allowEmptyValue: z.boolean().optional(),
    style: z.string().optional(),
    explode: z.boolean().optional(),
    allowReserved: z.boolean().optional(),
    schema: z.any().optional(), // ReferenceObject | SchemaObject
    example: z.any().optional(),
    examples: z.record(z.string(), z.any()).optional(), // Record of ReferenceObject | ExampleObject
    content: z.record(z.string(), z.any()).optional() // Record of MediaTypeObject
})

const ParameterObjectSchema = ParameterBaseObjectSchema.extend({
    name: z.string(),
    in: z.string()
})

const FernParametersExtensionSchema = z.array(ParameterObjectSchema)

export declare namespace FernParametersExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object
    }

    export type Output = OpenAPIV3.ParameterObject[]
}

export class FernParametersExtension extends AbstractExtension<FernParametersExtension.Output> {
    private readonly operation: object
    public readonly key = 'x-fern-parameters'

    constructor({ breadcrumbs, operation, context }: FernParametersExtension.Args) {
        super({ breadcrumbs, context })
        this.operation = operation
    }

    public convert(): FernParametersExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation)
        if (extensionValue == null) {
            return undefined
        }
        try {
            const parsedValue = FernParametersExtensionSchema.parse(extensionValue)
            return parsedValue as OpenAPIV3.ParameterObject[]
        } catch (error) {
            this.context.errorCollector.collect({
                message: `Failed to parse x-fern-parameters extension: ${error instanceof Error ? error.message : String(error)}`,
                path: this.breadcrumbs
            })
            return undefined
        }
    }
}
