import { csharp } from "@fern-api/csharp-codegen";
import { ExampleGenerator } from "@fern-api/fern-csharp-model";
import { ExampleEndpointCall, ExampleRequestBody, HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WrappedRequestGenerator } from "../wrapped-request/WrappedRequestGenerator";
import { getEndpointReturnType } from "./utils/getEndpointReturnType";

export abstract class AbstractEndpointGenerator {
    private exampleGenerator: ExampleGenerator;
    protected readonly context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
        this.exampleGenerator = new ExampleGenerator(context);
    }

    protected generateEndpointSnippet({
        example,
        endpoint,
        clientVariableName,
        serviceId,
        additionalEndParameters
    }: {
        example: ExampleEndpointCall;
        endpoint: HttpEndpoint;
        clientVariableName: string;
        serviceId: ServiceId;
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
        const args = this.getNonEndpointArguments(example);
        const endpointRequestSnippet = this.getEndpointRequestSnippet(example, endpoint, serviceId);
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

    private getEndpointRequestSnippet(
        exampleEndpointCall: ExampleEndpointCall,
        endpoint: HttpEndpoint,
        serviceId: ServiceId
    ): csharp.CodeBlock | undefined {
        switch (endpoint.sdkRequest?.shape.type) {
            case "wrapper":
                return new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context: this.context,
                    serviceId,
                    endpoint
                }).doGenerateSnippet(exampleEndpointCall);
            case "justRequestBody": {
                if (exampleEndpointCall.request == null) {
                    throw new Error("Unexpected no example request for just request body");
                }
                return this.getJustRequestBodySnippet(exampleEndpointCall.request);
            }
        }
        return undefined;
    }

    private getJustRequestBodySnippet(exampleRequestBody: ExampleRequestBody): csharp.CodeBlock {
        if (exampleRequestBody.type === "inlinedRequestBody") {
            throw new Error("Unexpected inlinedRequestBody"); // should be a wrapped request and already handled
        }
        return this.exampleGenerator.getSnippetForTypeReference(exampleRequestBody);
    }

    private getNonEndpointArguments(example: ExampleEndpointCall): csharp.CodeBlock[] {
        const pathParameters = [
            ...example.rootPathParameters,
            ...example.servicePathParameters,
            ...example.endpointPathParameters
        ];
        return pathParameters.map((pathParameter) =>
            this.exampleGenerator.getSnippetForTypeReference(pathParameter.value)
        );
    }
}
