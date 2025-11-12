import { assertNever } from "@fern-api/core-utils";
import { ast, is, WithGeneration } from "@fern-api/csharp-codegen";
import { ExampleGenerator } from "@fern-api/fern-csharp-model";
import { ExampleEndpointCall, ExampleRequestBody, HttpEndpoint, PathParameter, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WrappedRequestGenerator } from "../wrapped-request/WrappedRequestGenerator";
import { EndpointSignatureInfo } from "./EndpointSignatureInfo";
import { getEndpointRequest } from "./utils/getEndpointRequest";
import { getEndpointReturnType } from "./utils/getEndpointReturnType";

type PagingEndpoint = HttpEndpoint & { pagination: NonNullable<HttpEndpoint["pagination"]> };

export abstract class AbstractEndpointGenerator extends WithGeneration {
    private exampleGenerator: ExampleGenerator;
    protected readonly context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        super(context.generation);
        this.context = context;
        this.exampleGenerator = new ExampleGenerator(context);
    }

    public getEndpointSignatureInfo({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
    }): EndpointSignatureInfo {
        return this.hasPagination(endpoint)
            ? this.getPagerEndpointSignatureInfo({ serviceId, endpoint })
            : this.getUnpagedEndpointSignatureInfo({ serviceId, endpoint });
    }

    protected getUnpagedEndpointSignatureInfo({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
    }): EndpointSignatureInfo {
        return this.getEndpointSignatureInfoFor({
            serviceId,
            endpoint,
            endpointType: "unpaged"
        });
    }

    protected getPagerEndpointSignatureInfo({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
    }): EndpointSignatureInfo {
        return this.getEndpointSignatureInfoFor({
            serviceId,
            endpoint,
            endpointType: "paged"
        });
    }

    protected getEndpointSignatureInfoFor({
        serviceId,
        endpoint,
        endpointType
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
        endpointType: "unpaged" | "paged";
    }): EndpointSignatureInfo {
        const request = getEndpointRequest({ context: this.context, endpoint, serviceId });
        const requestParameter =
            request != null
                ? this.csharp.parameter({ type: request.getParameterType(), name: request.getParameterName() })
                : undefined;
        const { pathParameters, pathParameterReferences } = this.getAllPathParameters({
            endpoint,
            requestParameter
        });
        let returnType: ast.Type | undefined;
        switch (endpointType) {
            case "unpaged":
                returnType = getEndpointReturnType({ context: this.context, endpoint });
                break;
            case "paged":
                returnType = this.getPagerReturnType(endpoint);
                break;
            default:
                assertNever(endpointType);
        }
        return {
            baseParameters: [...pathParameters, requestParameter].filter((p): p is ast.Parameter => p != null),
            pathParameters,
            pathParameterReferences,
            request,
            requestParameter,
            returnType
        };
    }

    protected getPagerReturnType(endpoint: HttpEndpoint): ast.Type {
        const itemType = this.getPaginationItemType(endpoint);
        if (endpoint.pagination?.type === "custom") {
            return this.Types.CustomPagerClass(itemType);
        }
        return this.Types.Pager(itemType);
    }

    protected getPaginationItemType(endpoint: HttpEndpoint): ast.Type {
        this.assertHasPagination(endpoint);
        const listItemType = this.context.csharpTypeMapper.convert({
            reference: (() => {
                switch (endpoint.pagination.type) {
                    case "offset":
                        return endpoint.pagination.results.property.valueType;
                    case "cursor":
                        return endpoint.pagination.results.property.valueType;
                    case "custom":
                        return endpoint.pagination.results.property.valueType;
                    default:
                        assertNever(endpoint.pagination);
                }
            })(),
            unboxOptionals: true
        });

        if (is.Collection.list(listItemType)) {
            return listItemType.getCollectionItemType();
        }
        throw new Error(
            `Pagination result type for endpoint ${endpoint.name.originalName} must be a list, but is ${listItemType.fullyQualifiedName}.`
        );
    }

    protected getAllPathParameters({
        endpoint,
        requestParameter
    }: {
        endpoint: HttpEndpoint;
        requestParameter: ast.Parameter | undefined;
    }): Pick<EndpointSignatureInfo, "pathParameters" | "pathParameterReferences"> {
        const pathParameters: ast.Parameter[] = [];
        const pathParameterReferences: Record<string, string> = {};
        const includePathParametersInEndpointSignature = this.includePathParametersInEndpointSignature({ endpoint });
        for (const pathParam of endpoint.allPathParameters) {
            const parameterName = this.getPathParameterName({
                pathParameter: pathParam,
                includePathParametersInEndpointSignature,
                requestParameter
            });
            if (includePathParametersInEndpointSignature) {
                pathParameters.push(
                    this.csharp.parameter({
                        docs: pathParam.docs,
                        name: parameterName,
                        type: this.context.csharpTypeMapper.convert({ reference: pathParam.valueType })
                    })
                );
            }
            pathParameterReferences[pathParam.name.originalName] = parameterName;
        }
        return {
            pathParameters,
            pathParameterReferences
        };
    }

    protected hasPagination(endpoint: HttpEndpoint): endpoint is PagingEndpoint {
        if (!this.context.config.generatePaginatedClients) {
            return false;
        }
        return endpoint.pagination !== undefined;
    }

    protected assertHasPagination(endpoint: HttpEndpoint): asserts endpoint is PagingEndpoint {
        if (this.hasPagination(endpoint)) {
            return;
        }
        throw new Error(`Endpoint ${endpoint.name.originalName} is not a paginated endpoint`);
    }

    protected generateEndpointSnippet({
        example,
        endpoint,
        clientVariableName,
        parseDatetimes,
        serviceId,
        additionalEndParameters
    }: {
        example: ExampleEndpointCall;
        endpoint: HttpEndpoint;
        clientVariableName: string;
        serviceId: ServiceId;
        parseDatetimes: boolean;
        additionalEndParameters?: ast.CodeBlock[];
        getResult?: boolean;
    }): ast.MethodInvocation | undefined {
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Unexpected no service with id ${serviceId}`);
        }
        const serviceFilePath = service.name.fernFilepath;

        const args = this.getNonEndpointArguments({
            endpoint,
            example,
            parseDatetimes
        });
        const endpointRequestSnippet = this.getEndpointRequestSnippet(example, endpoint, serviceId, parseDatetimes);
        if (endpointRequestSnippet != null) {
            args.push(endpointRequestSnippet);
        }
        const on = this.csharp.codeblock((writer) => {
            writer.write(`${clientVariableName}`);
            for (const path of serviceFilePath.allParts) {
                writer.write(`.${path.pascalCase.safeName}`);
            }
        });
        for (const endParameter of additionalEndParameters ?? []) {
            args.push(endParameter);
        }
        return this.csharp.invokeMethod({
            method: this.context.getEndpointMethodName(endpoint),
            arguments_: args,
            on,
            async: true,
            configureAwait: true,
            isAsyncEnumerable: getEndpointReturnType({ context: this.context, endpoint })?.isAsyncEnumerable,
            generics: []
        });
    }

    protected getEndpointRequestSnippet(
        exampleEndpointCall: ExampleEndpointCall,
        endpoint: HttpEndpoint,
        serviceId: ServiceId,
        parseDatetimes: boolean
    ): ast.CodeBlock | ast.ClassInstantiation | undefined {
        switch (endpoint.sdkRequest?.shape.type) {
            case "wrapper":
                return new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context: this.context,
                    serviceId,
                    endpoint
                }).doGenerateSnippet({ example: exampleEndpointCall, parseDatetimes });
            case "justRequestBody": {
                if (endpoint.requestBody?.type === "bytes") {
                    return this.System.IO.MemoryStream.new({
                        arguments_: [
                            this.csharp.invokeMethod({
                                on: this.System.Text.Encoding_UTF8,
                                method: "GetBytes",
                                arguments_: [this.csharp.Literal.string("[bytes]")]
                            })
                        ]
                    });
                }
                if (exampleEndpointCall.request == null) {
                    // skip - no example request for just request body
                    return undefined;
                }
                return this.getJustRequestBodySnippet(exampleEndpointCall.request, parseDatetimes);
            }
        }
        return undefined;
    }

    protected wrapWithExceptionHandler({
        body,
        returnType
    }: {
        body: ast.CodeBlock;
        returnType: ast.Type | undefined;
    }): ast.CodeBlock {
        if (!this.settings.includeExceptionHandler) {
            return body;
        }
        return this.csharp.codeblock((writer) => {
            if (this.settings.includeExceptionHandler) {
                if (returnType != null) {
                    writer.write("return ");
                }
                writer.writeLine("await _client.Options.ExceptionHandler.TryCatchAsync(async () =>");
                writer.pushScope();
            }
            body.write(writer);
            if (this.settings.includeExceptionHandler) {
                writer.popScope();
                writer.writeLine(").ConfigureAwait(false);");
            }
        });
    }

    protected getNonEndpointArguments({
        endpoint,
        example,
        parseDatetimes
    }: {
        endpoint: HttpEndpoint;
        example: ExampleEndpointCall;
        parseDatetimes: boolean;
    }): (ast.CodeBlock | ast.ClassInstantiation)[] {
        if (!this.includePathParametersInEndpointSignature({ endpoint })) {
            return [];
        }
        const pathParameters = [
            ...example.rootPathParameters,
            ...example.servicePathParameters,
            ...example.endpointPathParameters
        ];
        return pathParameters.map((pathParameter) =>
            this.exampleGenerator.getSnippetForTypeReference({
                exampleTypeReference: pathParameter.value,
                parseDatetimes
            })
        );
    }

    private getJustRequestBodySnippet(exampleRequestBody: ExampleRequestBody, parseDatetimes: boolean): ast.CodeBlock {
        if (exampleRequestBody.type === "inlinedRequestBody") {
            throw new Error("Unexpected inlinedRequestBody"); // should be a wrapped request and already handled
        }
        return this.exampleGenerator.getSnippetForTypeReference({
            exampleTypeReference: exampleRequestBody,
            parseDatetimes
        });
    }

    private includePathParametersInEndpointSignature({ endpoint }: { endpoint: HttpEndpoint }): boolean {
        if (endpoint.sdkRequest?.shape.type !== "wrapper") {
            return true;
        }
        return !this.context.includePathParametersInWrappedRequest({
            endpoint,
            wrapper: endpoint.sdkRequest.shape
        });
    }

    private getPathParameterName({
        pathParameter,
        includePathParametersInEndpointSignature,
        requestParameter
    }: {
        pathParameter: PathParameter;
        includePathParametersInEndpointSignature: boolean;
        requestParameter?: ast.Parameter;
    }): string {
        if (!includePathParametersInEndpointSignature && requestParameter != null) {
            return `${requestParameter?.name}.${pathParameter.name.pascalCase.safeName}`;
        }
        return pathParameter.name.camelCase.safeName;
    }
}
