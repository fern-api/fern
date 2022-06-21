import { HttpEndpoint, TypeName } from "@fern-api/api";
import { DependencyManager, ErrorResolver, getTextOfTsKeyword, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateResponse } from "../commons/generate-response/generateResponse";
import { getServiceTypeReference } from "../commons/service-type-reference/get-service-type-reference/getServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { getMetadataForHttpServiceType } from "./getMetadataForHttpServiceType";
import { GeneratedHttpEndpointTypes } from "./types";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: TypeName;
        endpoint: HttpEndpoint;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
        dependencyManager: DependencyManager;
    }

    export type Return = GeneratedHttpEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    modelDirectory,
    typeResolver,
    errorResolver,
    dependencyManager,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const { reference, successBodyReference, errorBodyReference } = generateResponse({
        modelDirectory,
        typeResolver,
        errorResolver,
        dependencyManager,
        successResponse: {
            type: endpoint.response.ok.type,
            docs: endpoint.response.ok.docs,
        },
        failedResponse: endpoint.response.failed,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            getServiceTypeReference({
                reference,
                referencedIn,
                modelDirectory,
            }),
        additionalProperties: [
            {
                name: ServiceTypesConstants.HttpEndpint.Response.Properties.STATUS_CODE,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
        ],
        responseMetadata: getMetadataForHttpServiceType({
            modelDirectory,
            serviceName,
            endpointId: endpoint.endpointId,
            type: ServiceTypesConstants.Commons.Response.TYPE_NAME,
        }),
        successBodyMetadata: getMetadataForHttpServiceType({
            modelDirectory,
            serviceName,
            endpointId: endpoint.endpointId,
            type: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
        }),
        errorBodyMetadata: getMetadataForHttpServiceType({
            modelDirectory,
            serviceName,
            endpointId: endpoint.endpointId,
            type: ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
        }),
    });

    return { reference, successBodyReference, errorBodyReference };
}
