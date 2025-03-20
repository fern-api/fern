import path from "path";

import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { csharp } from "@fern-api/csharp-codegen";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { EndpointSignatureInfo } from "../endpoint/EndpointSignatureInfo";
import { SingleEndpointSnippet } from "../endpoint/snippets/EndpointSnippetsGenerator";

export async function buildReference({ context }: { context: SdkGeneratorContext }): Promise<ReferenceConfigBuilder> {
    const builder = new ReferenceConfigBuilder();
    const serviceEntries = Object.entries(context.ir.services);

    const sectionPromises = serviceEntries.map(async ([serviceId, service]) => {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ service }) });
        const endpoints = await getEndpointReferencesForService({ context, serviceId, service });
        for (const endpoint of endpoints) {
            section.addEndpoint(endpoint);
        }
    });

    await Promise.all(sectionPromises);
    return builder;
}

async function getEndpointReferencesForService({
    context,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
}): Promise<FernGeneratorCli.EndpointReference[]> {
    const endpointPromises = service.endpoints.map(async (endpoint) => {
        const singleEndpointSnippet = await context.snippetGenerator.generateSingleEndpointSnippet({
            serviceId,
            endpoint,
            example: context.getExampleEndpointCallOrThrow(endpoint)
        });
        if (singleEndpointSnippet != null) {
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
        }
        return null;
    });

    const endpoints = await Promise.all(endpointPromises);
    return endpoints.filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => endpoint !== null);
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
                    text: context.getAccessFromRootClient(service.name.fernFilepath) + "."
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
            const required = parameter.type instanceof csharp.Type ? !parameter.type.isOptional() : true;
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
        : context.getRootClientClassReferenceForSnippets();

    return (
        "/" +
        path.join(
            context.project.getProjectDirectory(),
            context.getDirectoryForFernFilepath(service.name.fernFilepath),
            `${clientClassReference.name}.cs`
        )
    );
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
