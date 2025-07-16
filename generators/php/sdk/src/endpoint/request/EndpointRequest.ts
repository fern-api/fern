import { assertNever } from '@fern-api/core-utils'
import { php } from '@fern-api/php-codegen'

import { FileUploadRequest, HttpEndpoint, HttpService, InlinedRequestBody, SdkRequest } from '@fern-fern/ir-sdk/api'

import { SdkGeneratorContext } from '../../SdkGeneratorContext'

export interface QueryParameterCodeBlock {
    code: php.CodeBlock
    queryParameterBagReference: string
}

export interface HeaderParameterCodeBlock {
    code: php.CodeBlock
    headerParameterBagReference: string
}

export interface RequestBodyCodeBlock {
    code?: php.CodeBlock
    requestBodyReference: php.CodeBlock
}

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: SdkRequest,
        protected readonly service: HttpService,
        protected readonly endpoint: HttpEndpoint
    ) {}

    public getRequestParameterName(): string {
        return `$${this.context.getParameterName(this.sdkRequest.requestParameterName)}`
    }

    public shouldIncludeDefaultInitializer(): boolean {
        if (this.sdkRequest.shape.type === 'wrapper') {
            if (
                this.context.includePathParametersInWrappedRequest({
                    endpoint: this.endpoint,
                    wrapper: this.sdkRequest.shape
                })
            ) {
                return false
            }
        }
        for (const queryParameter of this.endpoint.queryParameters) {
            if (!this.context.isOptional(queryParameter.valueType)) {
                return false
            }
        }
        for (const headerParameter of [...this.service.headers, ...this.endpoint.headers]) {
            if (!this.context.isOptional(headerParameter.valueType)) {
                return false
            }
        }
        const requestBody = this.endpoint.requestBody
        if (requestBody != null) {
            switch (requestBody.type) {
                case 'inlinedRequestBody':
                    return this.inlinedRequestBodyHasRequiredProperties(requestBody)
                case 'fileUpload':
                    return this.fileUploadRequestBodyHasRequiredProperties(requestBody)
                case 'reference':
                    return false
                case 'bytes':
                    return false
                default:
                    assertNever(requestBody)
            }
        }
        return true
    }

    public abstract getRequestParameterType(): php.Type

    public abstract getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined

    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined

    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined

    protected serializeJsonRequest({ bodyArgument }: { bodyArgument: php.CodeBlock }): php.CodeBlock {
        const requestParameterType = this.getRequestParameterType()
        return this.serializeJsonType({
            type: requestParameterType,
            bodyArgument,
            isOptional: requestParameterType.isOptional()
        })
    }

    protected serializeJsonType({
        type,
        bodyArgument,
        isOptional
    }: {
        type: php.Type
        bodyArgument: php.CodeBlock
        isOptional: boolean
    }): php.CodeBlock {
        const underlyingType = type.underlyingType()
        const internalType = underlyingType.internalType
        switch (internalType.type) {
            case 'array':
            case 'map':
                return this.serializeJsonRequestForArray({
                    bodyArgument,
                    type: underlyingType,
                    isOptional
                })
            case 'date':
                return this.serializeJsonRequestForDateTime({
                    bodyArgument,
                    variant: 'Date',
                    isOptional
                })
            case 'dateTime':
                return this.serializeJsonRequestForDateTime({
                    bodyArgument,
                    variant: 'DateTime',
                    isOptional
                })
            case 'union':
                return this.serializeJsonForUnion({
                    bodyArgument,
                    types: internalType.types,
                    isOptional
                })
            case 'reference':
            case 'int':
            case 'float':
            case 'string':
            case 'bool':
            case 'mixed':
            case 'object':
            case 'optional':
            case 'null':
            case 'typeDict':
            case 'enumString':
            case 'literal':
                return bodyArgument
        }
    }

    private serializeJsonRequestForArray({
        bodyArgument,
        type,
        isOptional
    }: {
        bodyArgument: php.CodeBlock
        type: php.Type
        isOptional: boolean
    }): php.CodeBlock {
        return this.serializeJsonRequestMethod({
            bodyArgument,
            methodInvocation: php.invokeMethod({
                on: this.context.getJsonSerializerClassReference(),
                method: 'serializeArray',
                arguments_: [bodyArgument, this.context.phpAttributeMapper.getTypeAttributeArgument(type)],
                static_: true
            }),
            isOptional
        })
    }

    protected serializeJsonForUnion({
        bodyArgument,
        types,
        isOptional
    }: {
        bodyArgument: php.CodeBlock
        types: php.Type[]
        isOptional: boolean
    }): php.CodeBlock {
        const unionTypeParameters = this.context.phpAttributeMapper.getUnionTypeParameters({ types, isOptional })
        // if deduping in getUnionTypeParameters results in one type, treat it like just that type
        if (unionTypeParameters.length === 1) {
            if (types[0] == null) {
                throw new Error('Unexpected empty types')
            }
            return this.serializeJsonType({ type: types[0], bodyArgument, isOptional })
        }
        return this.serializeJsonRequestMethod({
            bodyArgument,
            methodInvocation: php.invokeMethod({
                on: this.context.getJsonSerializerClassReference(),
                method: 'serializeUnion',
                arguments_: [
                    bodyArgument,
                    this.context.phpAttributeMapper.getUnionTypeClassRepresentation(unionTypeParameters)
                ],
                static_: true
            }),
            isOptional
        })
    }

    private serializeJsonRequestForDateTime({
        bodyArgument,
        variant,
        isOptional
    }: {
        bodyArgument: php.CodeBlock
        variant: 'Date' | 'DateTime'
        isOptional: boolean
    }): php.CodeBlock {
        return this.serializeJsonRequestMethod({
            bodyArgument,
            methodInvocation: php.invokeMethod({
                on: this.context.getJsonSerializerClassReference(),
                method: `serialize${variant}`,
                arguments_: [bodyArgument],
                static_: true
            }),
            isOptional
        })
    }

    private serializeJsonRequestMethod({
        bodyArgument,
        methodInvocation,
        isOptional
    }: {
        bodyArgument: php.CodeBlock
        methodInvocation: php.MethodInvocation
        isOptional: boolean
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            if (!isOptional) {
                writer.writeNode(methodInvocation)
                return
            }
            writer.writeNode(
                php.ternary({
                    condition: bodyArgument,
                    true_: methodInvocation,
                    false_: php.codeblock('null')
                })
            )
        })
    }

    private inlinedRequestBodyHasRequiredProperties(requestBody: InlinedRequestBody): boolean {
        const properties = requestBody.properties
        for (const property of [...properties, ...(requestBody.extendedProperties ?? [])]) {
            if (!this.context.isOptional(property.valueType)) {
                return false
            }
        }
        return true
    }

    private fileUploadRequestBodyHasRequiredProperties(requestBody: FileUploadRequest): boolean {
        for (const property of requestBody.properties) {
            switch (property.type) {
                case 'file': {
                    if (!property.value.isOptional) {
                        return false
                    }
                    break
                }
                case 'bodyProperty': {
                    if (!this.context.isOptional(property.valueType)) {
                        return false
                    }
                    break
                }
                default:
                    assertNever(property)
            }
        }
        return true
    }
}
