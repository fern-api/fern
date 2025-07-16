import { assertNever } from '@fern-api/core-utils'
import { csharp } from '@fern-api/csharp-codegen'

import { HttpHeader, Literal } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../SdkGeneratorContext'

export const BASE_URL_FIELD_NAME = 'BaseUrl'
export const BASE_URL_SUMMARY = 'The Base URL for the API.'
const BASE_URL_FIELD = csharp.field({
    access: csharp.Access.Public,
    name: BASE_URL_FIELD_NAME,
    get: true,
    init: true,
    type: csharp.Type.optional(csharp.Type.string()),
    summary: BASE_URL_SUMMARY
})

export interface OptionArgs {
    optional: boolean
    includeInitializer: boolean
}
export interface HttpHeadersFieldOptionArgs {
    optional: boolean
    includeInitializer: boolean
    interfaceReference?: csharp.ClassReference
}

export class BaseOptionsGenerator {
    private context: SdkGeneratorContext

    constructor(context: SdkGeneratorContext) {
        this.context = context
    }

    public getHttpClientField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Type.reference(
            csharp.classReference({
                name: 'HttpClient',
                namespace: 'System.Net.Http'
            })
        )
        return csharp.field({
            access: csharp.Access.Public,
            name: 'HttpClient',
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock('new HttpClient()') : undefined,
            summary: 'The http client used to make requests.'
        })
    }

    public getHttpHeadersField({
        optional,
        includeInitializer,
        interfaceReference
    }: HttpHeadersFieldOptionArgs): csharp.Field {
        const headersReference = csharp.Type.reference(this.context.getHeadersClassReference())
        return csharp.field({
            // Classes implementing internal interface field cannot have an access modifier
            access: !interfaceReference ? csharp.Access.Internal : undefined,
            name: 'Headers',
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(headersReference) : headersReference,
            initializer: includeInitializer ? csharp.codeblock('new()') : undefined,
            summary: 'The http headers sent with the request.',
            interfaceReference
        })
    }

    public getMaxRetriesField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Type.integer()
        return csharp.field({
            access: csharp.Access.Public,
            name: 'MaxRetries',
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock('2') : undefined,
            summary: 'The http client used to make requests.'
        })
    }

    public getTimeoutField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Types.reference(
            csharp.classReference({
                name: 'TimeSpan',
                namespace: 'System'
            })
        )
        return csharp.field({
            access: csharp.Access.Public,
            name: 'Timeout',
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock('TimeSpan.FromSeconds(30)') : undefined,
            summary: 'The timeout for the request.'
        })
    }

    public getAdditionalHeadersField({
        summary,
        includeInitializer
    }: {
        summary: string
        includeInitializer: boolean
    }): csharp.Field {
        const type = csharp.Type.reference(
            csharp.classReference({
                name: 'IEnumerable',
                namespace: 'System.Collections.Generic',
                generics: [
                    csharp.Type.reference(
                        this.context.getKeyValuePairsClassReference({
                            key: csharp.Type.string(),
                            value: csharp.Type.string().toOptionalIfNotAlready()
                        })
                    )
                ]
            })
        )
        return csharp.field({
            access: csharp.Access.Public,
            name: 'AdditionalHeaders',
            get: true,
            init: true,
            type,
            initializer: includeInitializer ? csharp.codeblock('[]') : undefined,
            summary
        })
    }

    public maybeGetLiteralHeaderField({
        header,
        options
    }: {
        header: HttpHeader
        options: OptionArgs
    }): csharp.Field | undefined {
        if (header.valueType.type !== 'container' || header.valueType.container.type !== 'literal') {
            return undefined
        }
        return csharp.field({
            access: csharp.Access.Public,
            name: header.name.name.pascalCase.safeName,
            get: true,
            init: true,
            type: this.getLiteralRootClientParameterType({ literal: header.valueType.container.literal }),
            summary: header.docs,
            initializer: options.includeInitializer ? csharp.codeblock('null') : undefined
        })
    }

    public getRequestOptionFields(): csharp.Field[] {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        }
        return [
            BASE_URL_FIELD,
            this.getHttpClientField(optionArgs),
            this.getHttpHeadersField({
                optional: false,
                includeInitializer: true,
                interfaceReference: this.context.getRequestOptionsInterfaceReference()
            }),
            this.getAdditionalHeadersField({
                summary:
                    'Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.',
                includeInitializer: true
            }),
            this.getMaxRetriesField(optionArgs),
            this.getTimeoutField(optionArgs),
            this.getQueryParametersField({
                optional: false,
                includeInitializer: true
            }),
            this.getBodyPropertiesField(optionArgs),
            ...this.getLiteralHeaderOptions(optionArgs)
        ]
    }

    public getRequestOptionInterfaceFields(): csharp.Field[] {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        }
        return [
            BASE_URL_FIELD,
            this.getHttpClientField(optionArgs),
            this.getHttpHeadersField({ optional: false, includeInitializer: false, interfaceReference: undefined }),
            this.getAdditionalHeadersField({
                summary:
                    'Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.',
                includeInitializer: false
            }),
            this.getMaxRetriesField(optionArgs),
            this.getTimeoutField(optionArgs),
            this.getQueryParametersField({ optional: false, includeInitializer: false }),
            this.getBodyPropertiesField(optionArgs)
        ]
    }

    public getIdempotentRequestOptionFields(): csharp.Field[] {
        return this.context.getIdempotencyHeaders().map((header) =>
            csharp.field({
                access: csharp.Access.Public,
                name: header.name.name.pascalCase.safeName,
                get: true,
                init: true,
                type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
                summary: header.docs
            })
        )
    }

    public getLiteralHeaderOptions(optionArgs: OptionArgs): csharp.Field[] {
        const fields: csharp.Field[] = []
        for (const header of this.context.ir.headers) {
            const field = this.maybeGetLiteralHeaderField({ header, options: optionArgs })
            if (field != null) {
                fields.push(field)
            }
        }
        return fields
    }

    private getLiteralRootClientParameterType({ literal }: { literal: Literal }): csharp.Type {
        switch (literal.type) {
            case 'string':
                return csharp.Type.optional(csharp.Type.string())
            case 'boolean':
                return csharp.Type.optional(csharp.Type.boolean())
            default:
                assertNever(literal)
        }
    }

    private getQueryParametersField({ includeInitializer }: OptionArgs): csharp.Field {
        return csharp.field({
            access: csharp.Access.Public,
            name: 'AdditionalQueryParameters',
            type: this.context.getAdditionalQueryParametersType(),
            summary: 'Additional query parameters sent with the request.',
            get: true,
            init: true,
            skipDefaultInitializer: true,
            initializer: includeInitializer
                ? csharp.codeblock((writer) => {
                      writer.writeNode(this.context.getEnumerableEmptyKeyValuePairsInitializer())
                  })
                : undefined
        })
    }

    private getBodyPropertiesField({ includeInitializer }: OptionArgs): csharp.Field {
        return csharp.field({
            access: csharp.Access.Public,
            name: 'AdditionalBodyProperties',
            type: this.context.getAdditionalBodyPropertiesType(),
            summary: 'Additional body properties sent with the request.\nThis is only applied to JSON requests.',
            get: true,
            init: true,
            initializer: includeInitializer ? csharp.codeblock('null') : undefined
        })
    }
}
