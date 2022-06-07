import { HttpEndpoint, NamedType } from "@fern-api/api";
import { getTextOfTsNode, getTypeReference } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile } from "ts-morph";
import { ClientConstants } from "../../../../constants";
import { ServiceTypeReference } from "../../../../service-types/types";
import { getEndpointTypeReference } from "../../getEndpointTypeReference";
import { EndpointTypeName } from "../../getLocalEndpointTypeReference";

export function generateRequest({
    requestFile,
    endpoint,
    serviceName,
    modelDirectory,
    servicesDirectory,
    requestBodyReference,
}: {
    requestFile: SourceFile;
    endpoint: HttpEndpoint;
    serviceName: NamedType;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    requestBodyReference: ServiceTypeReference<EndpointTypeName> | undefined;
}): void {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        ...endpoint.parameters.map((parameter) => ({
            name: parameter.key,
            docs: parameter.docs != null ? [parameter.docs] : undefined,
            type: getTextOfTsNode(
                getTypeReference({
                    reference: parameter.valueType,
                    referencedIn: requestFile,
                    modelDirectory,
                })
            ),
        })),
        ...endpoint.queryParameters.map((queryParameter) => ({
            name: queryParameter.key,
            docs: queryParameter.docs != null ? [queryParameter.docs] : undefined,
            type: getTextOfTsNode(
                getTypeReference({
                    reference: queryParameter.valueType,
                    referencedIn: requestFile,
                    modelDirectory,
                })
            ),
        })),
    ];

    if (requestBodyReference != null) {
        properties.push({
            name: ClientConstants.HttpService.Endpoint.Types.Request.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(
                getEndpointTypeReference({
                    endpointId: endpoint.endpointId,
                    serviceName,
                    reference: requestBodyReference,
                    referencedIn: requestFile,
                    modelDirectory,
                    servicesDirectory,
                })
            ),
        });
    }

    requestFile.addInterface({
        name: ClientConstants.HttpService.Endpoint.Types.Request.TYPE_NAME,
        properties,
        isExported: true,
    });
}
