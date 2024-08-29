import { ReferenceConfigBuilder } from "@fern-api/generator-commons";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { EndpointSignatureInfo } from "../endpoint/EndpointSignatureInfo";
import { SingleEndpointSnippet } from "../endpoint/snippets/EndpointSnippetsGenerator";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export function getReferenceConfigBuilder({ context }: { context: SdkGeneratorContext }): ReferenceConfigBuilder {
    const builder = new ReferenceConfigBuilder();
    for (const [serviceId, service] of Object.entries(context.ir.services)) {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ service }) });
        const endpoints = getEndpointReferencesForService({ context, serviceId, service });
        for (const endpoint of endpoints) {
            section.addEndpoint(endpoint);
        }
    }
    return builder;
}

function getEndpointReferencesForService({
    context,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
}): FernGeneratorCli.EndpointReference[] {
    const result: FernGeneratorCli.EndpointReference[] = [];
    for (const endpoint of service.endpoints) {
        const singleEndpointSnippet = context.snippetGenerator.generateSingleEndpointSnippet({
            serviceId,
            endpoint,
            example: context.getExampleEndpointCallOrThrow(endpoint)
        });
        if (singleEndpointSnippet == null) {
            continue;
        }
        const endpointSignatureInfo = context.endpointGenerator.getEndpointSignatureInfo({
            serviceId,
            endpoint
        });
        result.push(getEndpointReference({ context, service, endpoint, endpointSignatureInfo, singleEndpointSnippet }));
    }
    return result;
}

function getEndpointReference({
    context,
    service,
    endpoint,
    endpointSignatureInfo,
    singleEndpointSnippet
}: {
    context: SdkGeneratorContext;
    service: HttpService;
    endpoint: HttpEndpoint;
    endpointSignatureInfo: EndpointSignatureInfo;
    singleEndpointSnippet: SingleEndpointSnippet;
}): FernGeneratorCli.EndpointReference {
    return {
        title: {
            snippetParts: [
                {
                    text: context.getAccessFromRootClient(service.name.fernFilepath) + "."
                },
                {
                    text: context.getEndpointMethodName(endpoint),
                    location: {
                        path: context.getDirectoryForFernFilepath(service.name.fernFilepath)
                    }
                },
                {
                    text: getReferenceEndpointInvocationParameters({ context, endpointSignatureInfo })
                }
            ],
            returnValue:
                endpointSignatureInfo.returnType != null
                    ? {
                          text: context.printType(endpointSignatureInfo.returnType)
                      }
                    : undefined
        },
        description: endpoint.docs,
        snippet: singleEndpointSnippet.endpointCall,
        parameters: endpointSignatureInfo.baseParameters.map((parameter) => {
            return {
                name: parameter.name,
                type: context.printType(parameter.type),
                description: parameter.docs,
                required: !parameter.type.isOptional()
            };
        })
    };
}

function getReferenceEndpointInvocationParameters({
    context,
    endpointSignatureInfo
}: {
    context: SdkGeneratorContext;
    endpointSignatureInfo: EndpointSignatureInfo;
}): string {
    let result = "";
    endpointSignatureInfo.pathParameters.forEach((pathParameter, index) => {
        if (index > 0) {
            result += ", ";
        }
        result += pathParameter.name;
    });
    if (endpointSignatureInfo.requestParameter != null) {
        if (result.length > 0) {
            result += ", ";
        }
        result += `${context.printType(endpointSignatureInfo.requestParameter.type)} { ... }`;
    }
    return `(${result})`;
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
