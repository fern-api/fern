import { HttpEndpoint, TypeName } from "@fern-api/api";
import { getTextOfTsNode, ModelContext } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, SourceFile } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../commons/generate-request/generateRequest";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { getMetadataForHttpServiceType } from "./getMetadataForHttpServiceType";

export declare namespace generateRequestTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        serviceName: TypeName;
        modelContext: ModelContext;
    }
}

export function generateRequestTypes({
    endpoint,
    serviceName,
    modelContext,
}: generateRequestTypes.Args): GeneratedRequest {
    const getAdditionalProperties = [
        ...[...endpoint.pathParameters, ...endpoint.queryParameters].map(
            (parameter) =>
                (requestFile: SourceFile): OptionalKind<PropertySignatureStructure> => ({
                    name: parameter.key,
                    type: getTextOfTsNode(
                        modelContext.getReferenceToType({
                            reference: parameter.valueType,
                            referencedIn: requestFile,
                        })
                    ),
                })
        ),
    ];

    return generateRequest({
        modelContext,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                reference,
                referencedIn,
                modelContext,
            }),
        body: {
            type: endpoint.request.type,
            docs: endpoint.request.docs,
        },
        additionalProperties: getAdditionalProperties,
        requestMetadata: getMetadataForHttpServiceType({
            serviceName,
            endpointId: endpoint.endpointId,
            type: ServiceTypesConstants.Commons.Request.TYPE_NAME,
        }),
        requestBodyMetadata: getMetadataForHttpServiceType({
            serviceName,
            endpointId: endpoint.endpointId,
            type: ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME,
        }),
    });
}
