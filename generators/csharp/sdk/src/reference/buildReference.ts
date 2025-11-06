import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { ast } from "@fern-api/csharp-codegen";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import path from "path";
import { EndpointSignatureInfo } from "../endpoint/EndpointSignatureInfo";
import { SingleEndpointSnippet } from "../endpoint/snippets/EndpointSnippetsGenerator";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export function buildReference({ context }: { context: SdkGeneratorContext }): ReferenceConfigBuilder {
    const builder = new ReferenceConfigBuilder();
    const serviceEntries = Object.entries(context.ir.services);
    let hasEndpoints = false;
    serviceEntries.forEach(([serviceId, service]) => {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ service }) });
        const endpoints = getEndpointReferencesForService({ context, serviceId, service });
        for (const endpoint of endpoints) {
            hasEndpoints = true;
            section.addEndpoint(endpoint);
        }
    });
    if (!hasEndpoints) {
        throw new Error(`No endpoint references found for any service while building reference.md.`);
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
    return service.endpoints
        .map((endpoint) => {
            const example = context.getExampleEndpointCallIfExists(endpoint);
            if (!example) {
                // skip endpoints that don't have an example
                return undefined;
            }
            const singleEndpointSnippet = context.snippetGenerator.getSingleEndpointSnippet({
                endpoint,
                example
            });

            if (!singleEndpointSnippet) {
                // skip endpoints that don't have a snippet
                return undefined;
            }
            const endpointSignatureInfo = context.endpointGenerator.getEndpointSignatureInfo({
                serviceId,
                endpoint
            });
            return getEndpointReference({
                context,
                serviceId,
                service,
                endpoint,
                endpointSignatureInfo,
                singleEndpointSnippet
            });
        })
        .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => !!endpoint);
}

function getEndpointReference({
    context,
    serviceId,
    service,
    endpoint,
    endpointSignatureInfo,
    singleEndpointSnippet,
    isPager = false
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
    endpoint: HttpEndpoint;
    endpointSignatureInfo: EndpointSignatureInfo;
    singleEndpointSnippet: SingleEndpointSnippet;
    isPager?: boolean;
}): FernGeneratorCli.EndpointReference {
    return {
        title: {
            snippetParts: [
                {
                    text: `${context.getAccessFromRootClient(service.name.fernFilepath)}.`
                },
                {
                    text: context.getEndpointMethodName(endpoint),
                    location: {
                        path: getServiceFilepath({ context, serviceId, service })
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
        snippet: singleEndpointSnippet.endpointCall.trim(),
        parameters: endpointSignatureInfo.baseParameters.map((parameter) => {
            const required = parameter.type instanceof ast.Type ? !parameter.type.isOptional : true;
            return {
                name: parameter.name,
                type: context.printType(parameter.type),
                description: parameter.docs,
                required
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
            result = `${result}, `;
        }
        result = `${result}${pathParameter.name}`;
    });
    if (endpointSignatureInfo.requestParameter != null) {
        if (result.length > 0) {
            result = `${result}, `;
        }
        result = `${result}${context.printType(endpointSignatureInfo.requestParameter.type)} { ... }`;
    }
    return `(${result})`;
}

function getServiceFilepath({
    context,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
}): string {
    const subpackage = context.getSubpackageForServiceId(serviceId);
    const clientClassReference = subpackage
        ? context.getSubpackageClassReference(subpackage)
        : context.types.RootClientForSnippets;

    return `/${path.join(
        context.constants.folders.project,
        context.getDirectoryForFernFilepath(service.name.fernFilepath),
        `${clientClassReference.name}.cs`
    )}`;
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
