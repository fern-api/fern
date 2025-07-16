import { upperFirst } from 'lodash-es'
import { camelCase } from 'lodash-es'

import { NamedArgument, Options, Scope, Style } from '@fern-api/browser-compatible-base-generator'
import { Severity } from '@fern-api/browser-compatible-base-generator'
import { assertNever } from '@fern-api/core-utils'
import { csharp } from '@fern-api/csharp-codegen'
import { FernIr } from '@fern-api/dynamic-ir-sdk'

import { Config } from './Config'
import { DynamicSnippetsGeneratorContext } from './context/DynamicSnippetsGeneratorContext'
import { FilePropertyInfo } from './context/FilePropertyMapper'

const SNIPPET_NAMESPACE = 'Usage'
const SNIPPET_CLASS_NAME = 'Example'
const SNIPPET_METHOD_NAME = 'Do'
const CLIENT_VAR_NAME = 'client'
const STRING_TYPE_REFERENCE: FernIr.dynamic.TypeReference = {
    type: 'primitive',
    value: 'STRING'
}

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context
    }

    public async generateSnippet({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint
        request: FernIr.dynamic.EndpointSnippetRequest
        options: Options
    }): Promise<string> {
        const code = this.buildCodeBlock({ endpoint, snippet: request, options })
        return code.toString({
            namespace: SNIPPET_NAMESPACE,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig ?? {},
            allNamespaceSegments: new Set(),
            allTypeClassReferences: new Map()
        })
    }

    public generateSnippetSync({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint
        request: FernIr.dynamic.EndpointSnippetRequest
        options: Options
    }): string {
        const code = this.buildCodeBlock({ endpoint, snippet: request, options })
        return code.toString({
            namespace: SNIPPET_NAMESPACE,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig ?? {},
            allNamespaceSegments: new Set(),
            allTypeClassReferences: new Map()
        })
    }

    private buildCodeBlock({
        endpoint,
        snippet,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint
        snippet: FernIr.dynamic.EndpointSnippetRequest
        options: Options
    }): csharp.AstNode {
        const body = csharp.codeblock((writer) => {
            writer.writeNodeStatement(this.constructClient({ endpoint, snippet }))
            writer.newLine()
            writer.writeNodeStatement(this.callMethod({ endpoint, snippet }))
        })
        const style = this.getStyle(options)
        switch (style) {
            case Style.Concise:
                return body
            case Style.Full:
                return this.buildFullCodeBlock({ body, options })
            default:
                assertNever(style)
        }
    }

    private buildFullCodeBlock({ body, options }: { body: csharp.CodeBlock; options: Options }): csharp.AstNode {
        const config = this.getConfig(options)
        const class_ = csharp.class_({
            name: config.fullStyleClassName ?? SNIPPET_CLASS_NAME,
            namespace: SNIPPET_NAMESPACE,
            access: csharp.Access.Public
        })
        class_.addMethod(
            csharp.method({
                name: SNIPPET_METHOD_NAME,
                access: csharp.Access.Public,
                isAsync: true,
                parameters: [],
                body
            })
        )
        return class_
    }

    private constructClient({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.write(`var ${CLIENT_VAR_NAME} = `)
            writer.writeNode(this.getRootClientConstructorInvocation(this.getConstructorArgs({ endpoint, snippet })))
        })
    }

    private callMethod({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): csharp.MethodInvocation {
        return csharp.invokeMethod({
            on: csharp.codeblock(CLIENT_VAR_NAME),
            method: this.getMethod({ endpoint }),
            arguments_: this.getMethodArgs({ endpoint, snippet }),
            async: true,
            configureAwait: true,
            multiline: true
        })
    }

    private getConstructorArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): NamedArgument[] {
        const authArgs: NamedArgument[] = []
        if (endpoint.auth != null) {
            if (snippet.auth != null) {
                authArgs.push(...this.getConstructorAuthArgs({ auth: endpoint.auth, values: snippet.auth }))
            } else {
                this.context.errors.add({
                    severity: Severity.Warning,
                    message: `Auth with ${endpoint.auth.type} configuration is required for this endpoint`
                })
            }
        }
        const optionArgs: NamedArgument[] = []
        const baseUrlArgs = this.getConstructorBaseUrlArgs({
            baseUrl: snippet.baseURL,
            environment: snippet.environment
        })
        if (baseUrlArgs.length > 0) {
            optionArgs.push(...baseUrlArgs)
        }
        this.context.errors.scope(Scope.Headers)
        const headerArgs: NamedArgument[] = []
        if (this.context.ir.headers != null && snippet.headers != null) {
            headerArgs.push(
                ...this.getConstructorHeaderArgs({ headers: this.context.ir.headers, values: snippet.headers })
            )
        }
        this.context.errors.unscope()

        if (optionArgs.length === 0) {
            return [...authArgs, ...headerArgs]
        }
        return [
            ...authArgs,
            ...headerArgs,
            {
                name: 'clientOptions',
                assignment: csharp.instantiateClass({
                    classReference: this.context.getClientOptionsClassReference(),
                    arguments_: optionArgs.map((arg) => ({
                        name: arg.name,
                        assignment: arg.assignment
                    })),
                    multiline: true
                })
            }
        ]
    }

    private getConstructorBaseUrlArgs({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined
        environment: FernIr.dynamic.EnvironmentValues | undefined
    }): NamedArgument[] {
        const baseUrlArg = this.getBaseUrlArg({ baseUrl, environment })
        if (csharp.TypeLiteral.isNop(baseUrlArg)) {
            return []
        }
        return [
            {
                name: this.getBaseUrlOptionName(),
                assignment: baseUrlArg
            }
        ]
    }

    private getBaseUrlArg({
        baseUrl,
        environment
    }: {
        baseUrl: string | undefined
        environment: FernIr.dynamic.EnvironmentValues | undefined
    }): csharp.TypeLiteral {
        if (baseUrl != null && environment != null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: 'Cannot specify both baseUrl and environment options'
            })
            return csharp.TypeLiteral.nop()
        }
        if (baseUrl != null) {
            if (this.context.ir.environments?.environments.type === 'multipleBaseUrls') {
                this.context.errors.add({
                    severity: Severity.Critical,
                    message: "The C# SDK doesn't support a baseUrl when multiple URL environments are configured"
                })
                return csharp.TypeLiteral.nop()
            }
            return csharp.TypeLiteral.string(baseUrl)
        }
        if (environment != null) {
            if (this.context.isSingleEnvironmentID(environment)) {
                const classReference = this.context.getEnvironmentTypeReferenceFromID(environment)
                if (classReference == null) {
                    this.context.errors.add({
                        severity: Severity.Warning,
                        message: `Environment ${JSON.stringify(environment)} was not found`
                    })
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.reference(classReference)
            }
            if (this.context.isMultiEnvironmentValues(environment)) {
                if (!this.context.validateMultiEnvironmentUrlValues(environment)) {
                    return csharp.TypeLiteral.nop()
                }
                return csharp.TypeLiteral.reference(
                    csharp.instantiateClass({
                        classReference: this.context.getEnvironmentClassReference(),
                        arguments_: Object.entries(environment).map(([key, value]) => ({
                            name: upperFirst(camelCase(key)),
                            assignment: this.context.dynamicTypeLiteralMapper.convert({
                                typeReference: STRING_TYPE_REFERENCE,
                                value
                            })
                        })),
                        multiline: true
                    })
                )
            }
        }
        return csharp.TypeLiteral.nop()
    }

    private getConstructorAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.Auth
        values: FernIr.dynamic.AuthValues
    }): NamedArgument[] {
        switch (auth.type) {
            case 'basic':
                if (values.type !== 'basic') {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    })
                    return []
                }
                return this.getConstructorBasicAuthArg({ auth, values })
            case 'bearer':
                if (values.type !== 'bearer') {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    })
                    return []
                }
                return this.getConstructorBearerAuthArgs({ auth, values })
            case 'header':
                if (values.type !== 'header') {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    })
                    return []
                }
                return this.getConstructorHeaderAuthArgs({ auth, values })
            case 'oauth':
                if (values.type !== 'oauth') {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: this.context.newAuthMismatchError({ auth, values }).message
                    })
                    return []
                }
                return this.getConstructorOAuthArgs({ auth, values })
            default:
                assertNever(auth)
        }
    }

    private getConstructorBasicAuthArg({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BasicAuth
        values: FernIr.dynamic.BasicAuthValues
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.username),
                assignment: csharp.TypeLiteral.string(values.username)
            },
            {
                name: this.context.getParameterName(auth.password),
                assignment: csharp.TypeLiteral.string(values.password)
            }
        ]
    }

    private getConstructorBearerAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.BearerAuth
        values: FernIr.dynamic.BearerAuthValues
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.token),
                assignment: csharp.TypeLiteral.string(values.token)
            }
        ]
    }

    private getConstructorHeaderAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.HeaderAuth
        values: FernIr.dynamic.HeaderAuthValues
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.header.name.name),
                assignment: this.context.dynamicTypeLiteralMapper.convert({
                    typeReference: auth.header.typeReference,
                    value: values.value
                })
            }
        ]
    }

    private getConstructorOAuthArgs({
        auth,
        values
    }: {
        auth: FernIr.dynamic.OAuth
        values: FernIr.dynamic.OAuthValues
    }): NamedArgument[] {
        return [
            {
                name: this.context.getParameterName(auth.clientId),
                assignment: csharp.TypeLiteral.string(values.clientId)
            },
            {
                name: this.context.getParameterName(auth.clientSecret),
                assignment: csharp.TypeLiteral.string(values.clientSecret)
            }
        ]
    }

    private getConstructorHeaderArgs({
        headers,
        values
    }: {
        headers: FernIr.dynamic.NamedParameter[]
        values: FernIr.dynamic.Values
    }): NamedArgument[] {
        const args: NamedArgument[] = []
        for (const header of headers) {
            const arg = this.getConstructorHeaderArg({ header, value: values.value })
            if (arg != null) {
                args.push({
                    name: this.context.getParameterName(header.name.name),
                    assignment: arg
                })
            }
        }
        return args
    }

    private getConstructorHeaderArg({
        header,
        value
    }: {
        header: FernIr.dynamic.NamedParameter
        value: unknown
    }): csharp.TypeLiteral | undefined {
        const typeLiteral = this.context.dynamicTypeLiteralMapper.convert({
            typeReference: header.typeReference,
            value
        })
        if (csharp.TypeLiteral.isNop(typeLiteral)) {
            // Literal header values (e.g. "X-API-Version") should not be included in the
            // client constructor.
            return undefined
        }
        return typeLiteral
    }

    private getMethodArgs({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): csharp.TypeLiteral[] {
        switch (endpoint.request.type) {
            case 'inlined':
                return this.getMethodArgsForInlinedRequest({ request: endpoint.request, snippet })
            case 'body':
                return this.getMethodArgsForBodyRequest({ request: endpoint.request, snippet })
            default:
                assertNever(endpoint.request)
        }
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): csharp.TypeLiteral[] {
        const args: csharp.TypeLiteral[] = []

        const inlinePathParameters = this.context.customConfig?.['inline-path-parameters'] ?? true

        this.context.errors.scope(Scope.PathParameters)
        const pathParameterFields: csharp.ConstructorField[] = []
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])]
        if (pathParameters.length > 0) {
            pathParameterFields.push(...this.getPathParameters({ namedParameters: pathParameters, snippet }))
        }
        this.context.errors.unscope()

        // TODO: Add support for file properties.
        this.context.errors.scope(Scope.RequestBody)
        const filePropertyInfo = this.getFilePropertyInfo({ request, snippet })
        this.context.errors.unscope()

        if (
            !this.context.includePathParametersInWrappedRequest({
                request,
                inlinePathParameters
            })
        ) {
            args.push(...pathParameterFields.map((field) => field.value))
        }
        // For now, the C# SDK always requires the inlined request parameter.
        args.push(
            this.getInlinedRequestArg({
                request,
                snippet,
                pathParameterFields: this.context.includePathParametersInWrappedRequest({
                    request,
                    inlinePathParameters
                })
                    ? pathParameterFields
                    : [],
                filePropertyInfo
            })
        )
        return args
    }

    private getFilePropertyInfo({
        request,
        snippet
    }: {
        request: FernIr.dynamic.InlinedRequest
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): FilePropertyInfo {
        if (request.body == null || !this.context.isFileUploadRequestBody(request.body)) {
            return {
                fileFields: [],
                bodyPropertyFields: []
            }
        }
        return this.context.filePropertyMapper.getFilePropertyInfo({
            body: request.body,
            value: snippet.requestBody
        })
    }

    private getInlinedRequestArg({
        request,
        snippet,
        pathParameterFields,
        filePropertyInfo
    }: {
        request: FernIr.dynamic.InlinedRequest
        snippet: FernIr.dynamic.EndpointSnippetRequest
        pathParameterFields: csharp.ConstructorField[]
        filePropertyInfo: FilePropertyInfo
    }): csharp.TypeLiteral {
        this.context.errors.scope(Scope.QueryParameters)
        const queryParameters = this.context.associateQueryParametersByWireValue({
            parameters: request.queryParameters ?? [],
            values: snippet.queryParameters ?? {}
        })
        const queryParameterFields = queryParameters.map((queryParameter) => ({
            name: this.context.getPropertyName(queryParameter.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert(queryParameter)
        }))
        this.context.errors.unscope()

        this.context.errors.scope(Scope.Headers)
        const headers = this.context.associateByWireValue({
            parameters: request.headers ?? [],
            values: snippet.headers ?? {}
        })
        const headerFields = headers.map((header) => ({
            name: this.context.getPropertyName(header.name.name),
            value: this.context.dynamicTypeLiteralMapper.convert(header)
        }))
        this.context.errors.unscope()

        this.context.errors.scope(Scope.RequestBody)
        const requestBodyFields =
            request.body != null
                ? this.getInlinedRequestBodyConstructorFields({
                      body: request.body,
                      value: snippet.requestBody,
                      filePropertyInfo
                  })
                : []
        this.context.errors.unscope()

        return csharp.TypeLiteral.class_({
            reference: csharp.classReference({
                name: this.context.getClassName(request.declaration.name),
                namespace: this.context.getNamespace(request.declaration.fernFilepath)
            }),
            fields: [...pathParameterFields, ...queryParameterFields, ...headerFields, ...requestBodyFields]
        })
    }

    private getInlinedRequestBodyConstructorFields({
        body,
        value,
        filePropertyInfo
    }: {
        body: FernIr.dynamic.InlinedRequestBody
        value: unknown
        filePropertyInfo: FilePropertyInfo
    }): csharp.ConstructorField[] {
        switch (body.type) {
            case 'properties':
                return this.getInlinedRequestBodyPropertyConstructorFields({ parameters: body.value, value })
            case 'referenced':
                return [this.getReferencedRequestBodyPropertyConstructorField({ body, value })]
            case 'fileUpload':
                return this.getFileUploadRequestBodyConstructorFields({ filePropertyInfo })
            default:
                assertNever(body)
        }
    }

    private getInlinedRequestBodyPropertyConstructorFields({
        parameters,
        value
    }: {
        parameters: FernIr.dynamic.NamedParameter[]
        value: unknown
    }): csharp.ConstructorField[] {
        const fields: csharp.ConstructorField[] = []

        const bodyProperties = this.context.associateByWireValue({
            parameters,
            values: this.context.getRecord(value) ?? {}
        })
        for (const parameter of bodyProperties) {
            fields.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
            })
        }

        return fields
    }

    private getFileUploadRequestBodyConstructorFields({
        filePropertyInfo
    }: {
        filePropertyInfo: FilePropertyInfo
    }): csharp.ConstructorField[] {
        return [...filePropertyInfo.fileFields, ...filePropertyInfo.bodyPropertyFields]
    }

    private getReferencedRequestBodyPropertyConstructorField({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBody
        value: unknown
    }): csharp.ConstructorField {
        return {
            name: this.context.getPropertyName(body.bodyKey),
            value: this.getReferencedRequestBodyPropertyTypeLiteral({ body: body.bodyType, value })
        }
    }

    private getReferencedRequestBodyPropertyTypeLiteral({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType
        value: unknown
    }): csharp.TypeLiteral {
        switch (body.type) {
            case 'bytes':
                return this.getBytesBodyRequestArg({ value })
            case 'typeReference':
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value })
            default:
                assertNever(body)
        }
    }

    private getMethodArgsForBodyRequest({
        request,
        snippet
    }: {
        request: FernIr.dynamic.BodyRequest
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): csharp.TypeLiteral[] {
        const args: csharp.TypeLiteral[] = []

        this.context.errors.scope(Scope.PathParameters)
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(request.pathParameters ?? [])]
        if (pathParameters.length > 0) {
            args.push(
                ...this.getPathParameters({ namedParameters: pathParameters, snippet }).map((field) => field.value)
            )
        }
        this.context.errors.unscope()

        this.context.errors.scope(Scope.RequestBody)
        if (request.body != null) {
            args.push(this.getBodyRequestArg({ body: request.body, value: snippet.requestBody }))
        }
        this.context.errors.unscope()

        return args
    }

    private getBodyRequestArg({
        body,
        value
    }: {
        body: FernIr.dynamic.ReferencedRequestBodyType
        value: unknown
    }): csharp.TypeLiteral {
        switch (body.type) {
            case 'bytes': {
                return this.getBytesBodyRequestArg({ value })
            }
            case 'typeReference':
                return this.context.dynamicTypeLiteralMapper.convert({ typeReference: body.value, value })
            default:
                assertNever(body)
        }
    }

    private getBytesBodyRequestArg({ value }: { value: unknown }): csharp.TypeLiteral {
        const str = this.context.getValueAsString({ value })
        if (str == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: 'The bytes request body must be provided in string format'
            })
            return csharp.TypeLiteral.nop()
        }
        return csharp.TypeLiteral.reference(this.context.getMemoryStreamForString(str))
    }

    private getRootClientConstructorInvocation(arguments_: NamedArgument[]): csharp.ClassInstantiation {
        return csharp.instantiateClass({
            classReference: this.context.getRootClientClassReference(),
            arguments_,
            forceUseConstructor: true,
            multiline: true
        })
    }

    private getPathParameters({
        namedParameters,
        snippet
    }: {
        namedParameters: FernIr.dynamic.NamedParameter[]
        snippet: FernIr.dynamic.EndpointSnippetRequest
    }): csharp.ConstructorField[] {
        const args: csharp.ConstructorField[] = []
        const pathParameters = this.context.associateByWireValue({
            parameters: namedParameters,
            values: snippet.pathParameters ?? {}
        })
        for (const parameter of pathParameters) {
            args.push({
                name: this.context.getPropertyName(parameter.name.name),
                value: this.context.dynamicTypeLiteralMapper.convert(parameter)
            })
        }
        return args
    }

    private getMethod({ endpoint }: { endpoint: FernIr.dynamic.Endpoint }): string {
        if (endpoint.declaration.fernFilepath.allParts.length > 0) {
            return `${endpoint.declaration.fernFilepath.allParts
                .map((val) => this.context.getClassName(val))
                .join('.')}.${this.context.getMethodName(endpoint.declaration.name)}`
        }
        return this.context.getMethodName(endpoint.declaration.name)
    }

    private getBaseUrlOptionName(): string {
        if (this.context.ir.environments?.environments.type === 'multipleBaseUrls') {
            return 'Environment'
        }
        return 'BaseUrl'
    }

    private getStyle(options: Options): Style {
        return options.style ?? this.context.options.style ?? Style.Full
    }

    private getConfig(options: Options): Config {
        return options.config ?? this.context.options.config ?? {}
    }
}
