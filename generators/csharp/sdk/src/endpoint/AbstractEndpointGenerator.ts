import { csharp } from "@fern-api/csharp-codegen";
import { ExampleGenerator } from "@fern-api/fern-csharp-model";
import { ExampleEndpointCall, ExampleRequestBody, HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WrappedRequestGenerator } from "../wrapped-request/WrappedRequestGenerator";
import { getEndpointRequest } from "./utils/getEndpointRequest";
import { getEndpointReturnType } from "./utils/getEndpointReturnType";
import { EndpointSignatureInfo } from "./EndpointSignatureInfo";

export abstract class AbstractEndpointGenerator {
    private exampleGenerator: ExampleGenerator;
    protected readonly context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
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
        const { pathParameters, pathParameterReferences } = this.getAllPathParameters({ serviceId, endpoint });
        const request = getEndpointRequest({ context: this.context, endpoint, serviceId });
        const requestParameter =
            request != null
                ? csharp.parameter({ type: request.getParameterType(), name: request.getParameterName() })
                : undefined;
        return {
            baseParameters: [...pathParameters, requestParameter].filter((p): p is csharp.Parameter => p != null),
            pathParameters,
            pathParameterReferences,
            request,
            requestParameter,
            returnType: getEndpointReturnType({ context: this.context, endpoint })
        };
    }

    public getPagerEndpointSignatureInfo({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
    }): EndpointSignatureInfo {
        const { pathParameters, pathParameterReferences } = this.getAllPathParameters({ serviceId, endpoint });
        const request = getEndpointRequest({ context: this.context, endpoint, serviceId });
        const requestParameter =
            request != null
                ? csharp.parameter({ type: request.getParameterType(), name: request.getParameterName() })
                : undefined;
        return {
            baseParameters: [...pathParameters, requestParameter].filter((p): p is csharp.Parameter => p != null),
            pathParameters,
            pathParameterReferences,
            request,
            requestParameter,
            returnType: this.getPagerReturnType(endpoint)
        };
    }

    protected getPaginationItemType(endpoint: HttpEndpoint) {
        if (!endpoint.pagination) {
            throw new Error(`Endpoint ${endpoint.name.originalName} is not a pager endpoint`);
        }
        let listItemType = this.context.csharpTypeMapper.convert({
            reference: endpoint.pagination._visit({
                offset: (pagination) => pagination.results.property.valueType,
                cursor: (pagination) => pagination.results.property.valueType,
                _other: (pagination) => {
                    throw new Error(`Unsupported pagination type: ${pagination.type}`);
                }
            })
        });
        if (listItemType.internalType.type === "optional") {
            listItemType = listItemType.internalType.value;
        }

        if (listItemType.internalType.type !== "list") {
            throw new Error(
                `Pagination result type for endpoint ${endpoint.name.originalName} must be a list, but is ${listItemType.internalType.type}.`
            );
        }
        const itemType = listItemType.internalType.value;
        return itemType;
    }

    protected getPagerReturnType(endpoint: HttpEndpoint) {
        const itemType = this.getPaginationItemType(endpoint);
        const pager = this.context.getPagerClassReference({
            itemType
        });
        return csharp.Type.reference(pager);
    }

    private getAllPathParameters({
        serviceId,
        endpoint
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
    }): Pick<EndpointSignatureInfo, "pathParameters" | "pathParameterReferences"> {
        const pathParameters: csharp.Parameter[] = [];
        const service = this.context.getHttpServiceOrThrow(serviceId);
        const pathParameterReferences: Record<string, string> = {};
        for (const pathParam of [
            ...this.context.ir.pathParameters,
            ...service.pathParameters,
            ...endpoint.pathParameters
        ]) {
            const parameterName = pathParam.name.camelCase.safeName;
            pathParameterReferences[pathParam.name.originalName] = parameterName;
            pathParameters.push(
                csharp.parameter({
                    docs: pathParam.docs,
                    name: parameterName,
                    type: this.context.csharpTypeMapper.convert({ reference: pathParam.valueType })
                })
            );
        }
        return {
            pathParameters,
            pathParameterReferences
        };
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
        additionalEndParameters?: csharp.CodeBlock[];
        getResult?: boolean;
    }): csharp.MethodInvocation | undefined {
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Unexpected no service with id ${serviceId}`);
        }
        const serviceFilePath = service.name.fernFilepath;
        const requestBodyType = endpoint.requestBody?.type;
        // TODO: implement these
        if (requestBodyType === "fileUpload" || requestBodyType === "bytes") {
            return undefined;
        }
        const args = this.getNonEndpointArguments(example, parseDatetimes);
        const endpointRequestSnippet = this.getEndpointRequestSnippet(example, endpoint, serviceId, parseDatetimes);
        if (endpointRequestSnippet != null) {
            args.push(endpointRequestSnippet);
        }
        const on = csharp.codeblock((writer) => {
            writer.write(`${clientVariableName}`);
            for (const path of serviceFilePath.allParts) {
                writer.write(`.${path.pascalCase.safeName}`);
            }
        });
        for (const endParameter of additionalEndParameters ?? []) {
            args.push(endParameter);
        }

        getEndpointReturnType({ context: this.context, endpoint });
        return new csharp.MethodInvocation({
            method: this.context.getEndpointMethodName(endpoint),
            arguments_: args,
            on,
            async: true,
            generics: []
        });
    }

    protected generatePagerEndpointSnippet({
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
        additionalEndParameters?: csharp.CodeBlock[];
        getResult?: boolean;
    }): csharp.MethodInvocation | undefined {
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Unexpected no service with id ${serviceId}`);
        }
        const serviceFilePath = service.name.fernFilepath;
        const requestBodyType = endpoint.requestBody?.type;
        // TODO: implement these
        if (requestBodyType === "fileUpload" || requestBodyType === "bytes") {
            return undefined;
        }
        const args = this.getNonEndpointArguments(example, parseDatetimes);
        const endpointRequestSnippet = this.getEndpointRequestSnippet(example, endpoint, serviceId, parseDatetimes);
        if (endpointRequestSnippet != null) {
            args.push(endpointRequestSnippet);
        }
        const on = csharp.codeblock((writer) => {
            writer.write(`${clientVariableName}`);
            for (const path of serviceFilePath.allParts) {
                writer.write(`.${path.pascalCase.safeName}`);
            }
        });
        for (const endParameter of additionalEndParameters ?? []) {
            args.push(endParameter);
        }

        getEndpointReturnType({ context: this.context, endpoint });
        return new csharp.MethodInvocation({
            method: this.context.getEndpointPagerMethodName(endpoint),
            arguments_: args,
            on,
            async: false,
            generics: []
        });
    }

    private getEndpointRequestSnippet(
        exampleEndpointCall: ExampleEndpointCall,
        endpoint: HttpEndpoint,
        serviceId: ServiceId,
        parseDatetimes: boolean
    ): csharp.CodeBlock | undefined {
        switch (endpoint.sdkRequest?.shape.type) {
            case "wrapper":
                return new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context: this.context,
                    serviceId,
                    endpoint
                }).doGenerateSnippet({ example: exampleEndpointCall, parseDatetimes });
            case "justRequestBody": {
                if (exampleEndpointCall.request == null) {
                    throw new Error("Unexpected no example request for just request body");
                }
                return this.getJustRequestBodySnippet(exampleEndpointCall.request, parseDatetimes);
            }
        }
        return undefined;
    }

    private getJustRequestBodySnippet(
        exampleRequestBody: ExampleRequestBody,
        parseDatetimes: boolean
    ): csharp.CodeBlock {
        if (exampleRequestBody.type === "inlinedRequestBody") {
            throw new Error("Unexpected inlinedRequestBody"); // should be a wrapped request and already handled
        }
        return this.exampleGenerator.getSnippetForTypeReference({
            exampleTypeReference: exampleRequestBody,
            parseDatetimes
        });
    }

    private getNonEndpointArguments(example: ExampleEndpointCall, parseDatetimes: boolean): csharp.CodeBlock[] {
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
}
