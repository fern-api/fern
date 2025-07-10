import path from "path";

import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { php } from "@fern-api/php-codegen";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { EndpointSignatureInfo } from "../endpoint/EndpointSignatureInfo";
/**
 * Gets a safe type representation without calling toString()
 */
function getSafeTypeRepresentation(type: any): string {
    if (type === null || type === undefined) {
        return "mixed";
    }

    // Handle PHP _Type objects with internalType
    if (type.internalType) {
        if (type.internalType.type === 'string') {
            return 'string';
        } else if (type.internalType.type === 'reference' && type.internalType.value) {
            // Handle class references
            const ref = type.internalType.value;
            if (ref.name && ref.namespace) {
                return `\\${ref.namespace}\\${ref.name}`;
            } else if (ref.name) {
                return ref.name;
            }
        } else if (type.internalType.type) {
            // Return the basic type
            return type.internalType.type;
        }
    }

    // Handle Parameter objects
    if (type.type && typeof type.type === 'object') {
        return getSafeTypeRepresentation(type.type);
    }

    // Fallback for other objects
    if (typeof type === 'object') {
        if (type.constructor && type.constructor.name) {
            return type.constructor.name;
        }
        return "object";
    }

    return String(type);
}

/**
 * Gets a snippet for an endpoint from pregenerated snippets or generates a fallback
 */
function getEndpointSnippet({
    context,
    serviceId,
    service,
    endpoint,
    endpointSignatureInfo
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
    endpoint: HttpEndpoint;
    endpointSignatureInfo: EndpointSignatureInfo;
}): string {
    let snippet = "";

    const servicePath = isRootServiceId({ context, serviceId })
        ? ""
        : service.name.fernFilepath.allParts.map(part => part.camelCase.safeName).join("->")+"->";

    // Start building the method call
    snippet += `$client->${servicePath}${context.getEndpointMethodName(endpoint)}(`;
    
    // Check if we have any parameters to add
    const hasParameters = endpointSignatureInfo.pathParameters.length > 0 || endpointSignatureInfo.requestParameter;
    
    if (hasParameters) {
        // Add a newline after the opening parenthesis if we have parameters
        snippet += '\n';
        
        // Add path parameters with proper types
        endpointSignatureInfo.pathParameters.forEach((param) => {
            const paramName = param.name.replace('$', '');
            const paramType = getSafeTypeRepresentation(param.type);
            snippet += `    ${paramName}: $${paramName},\n`;
        });

        if (endpointSignatureInfo.requestParameter) {
            snippet += `    $request,\n`;
        }
        
        // Close the method call with a newline before the closing parenthesis
        snippet += ");\n\n";
    } else {
        // If no parameters, close the parentheses on the same line
        snippet += ");\n\n";
    }

    return snippet;
}

export function buildReference({ context }: { context: SdkGeneratorContext }): ReferenceConfigBuilder {
    const builder = new ReferenceConfigBuilder();
    const serviceEntries = Object.entries(context.ir.services);

    serviceEntries.forEach(([serviceId, service]) => {
        const section = isRootServiceId({ context, serviceId })
            ? builder.addRootSection()
            : builder.addSection({ title: getSectionTitle({ service }) });
        const endpoints = getEndpointReferencesForService({ context, serviceId, service });
        for (const endpoint of endpoints) {
            section.addEndpoint(endpoint);
        }
    });

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
            const endpointSignatureInfo = context.endpointGenerator.getEndpointSignatureInfo({
                serviceId,
                service,
                endpoint
            });
            // Get a PHP code snippet for this endpoint
            const snippet = getEndpointSnippet({
                context,
                serviceId,
                service,
                endpoint,
                endpointSignatureInfo
            });
            return getEndpointReference({
                context,
                serviceId,
                service,
                endpoint,
                endpointSignatureInfo,
                snippet
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
    snippet
}: {
    context: SdkGeneratorContext;
    serviceId: ServiceId;
    service: HttpService;
    endpoint: HttpEndpoint;
    endpointSignatureInfo: EndpointSignatureInfo;
    snippet: string;
}): FernGeneratorCli.EndpointReference {

    return {
        title: {
            snippetParts: [
                {
                    text: "$client->"
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
                          text: getSafeTypeRepresentation(endpointSignatureInfo.returnType)
                      }
                    : undefined
        },
        description: endpoint.docs,
        snippet: snippet.trim(),
        parameters: endpointSignatureInfo.baseParameters.map((parameter) => {
            const required = parameter.type instanceof php.Type ? !parameter.type.isOptional() : true;
            return {
                name: parameter.name,
                type: getSafeTypeRepresentation(parameter.type),
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
        result += "$" + pathParameter.name;
    });
    if (endpointSignatureInfo.requestParameter != null) {
        if (result.length > 0) {
            result += ", ";
        }
        result += `$request`;
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
    try {
        const location = context.getLocationForServiceId(serviceId);
        const serviceName = service.name.fernFilepath.file?.pascalCase.safeName || "Client";

        // Add null checks to prevent TypeError
        if (!location || !location.namespace) {
            return `/${serviceName}Client.php`;
        }

        return `/${location.namespace.replace(/\\/g, '/')}/${serviceName}Client.php`;
    } catch (error) {
        // Fallback to a simple path if there's an error
        const serviceName = service.name.fernFilepath.file?.pascalCase.safeName || "Client";
        return `/${serviceName}Client.php`;
    }
}

function isRootServiceId({ context, serviceId }: { context: SdkGeneratorContext; serviceId: ServiceId }): boolean {
    return context.ir.rootPackage.service === serviceId;
}

function getSectionTitle({ service }: { service: HttpService }): string {
    return service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ");
}
