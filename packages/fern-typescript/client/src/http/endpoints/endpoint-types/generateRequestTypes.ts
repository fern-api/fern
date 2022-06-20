import { HttpEndpoint, NamedType } from "@fern-api/api";
import { getTextOfTsNode, getTypeReference, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../../../commons/generate-request/generateRequest";
import { getServiceTypeReference } from "../../../commons/service-types/get-service-type-reference/getServiceTypeReference";

export declare namespace generateRequestTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        serviceName: NamedType;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
    }
}

export function generateRequestTypes({
    endpoint,
    serviceName,
    endpointDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
}: generateRequestTypes.Args): GeneratedRequest {
    const getAdditionalProperties = [
        ...[...endpoint.pathParameters, ...endpoint.queryParameters].map(
            (parameter) =>
                (requestFile: SourceFile): OptionalKind<PropertySignatureStructure> => ({
                    name: parameter.key,
                    type: getTextOfTsNode(
                        getTypeReference({
                            reference: parameter.valueType,
                            referencedIn: requestFile,
                            modelDirectory,
                        })
                    ),
                })
        ),
    ];

    return generateRequest({
        directory: endpointDirectory,
        modelDirectory,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                serviceOrChannelName: serviceName,
                endpointOrOperationId: endpoint.endpointId,
                reference,
                referencedIn,
                servicesDirectory,
                modelDirectory,
            }),
        body: {
            type: endpoint.request.type,
            docs: endpoint.request.docs,
        },
        typeResolver,
        additionalProperties: getAdditionalProperties,
    });
}
