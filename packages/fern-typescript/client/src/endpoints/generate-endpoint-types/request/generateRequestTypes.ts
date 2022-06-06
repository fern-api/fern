import { HttpEndpoint, HttpRequest, NamedType } from "@fern-api/api";
import { getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateWireMessageBodyReference } from "../generateWireMessageBodyReference";
import { GeneratedEndpointTypes, LocalEndpointParameterReference } from "../types";
import { generateRequest } from "./generateRequest";

export declare namespace generateRequestTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        serviceName: NamedType;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = Pick<GeneratedEndpointTypes, "endpointParameter" | "requestBody">;
}

export function generateRequestTypes({
    endpoint,
    serviceName,
    endpointDirectory,
    modelDirectory,
    servicesDirectory,
    typeResolver,
}: generateRequestTypes.Args): generateRequestTypes.Return {
    const numParameters = endpoint.parameters.length + endpoint.queryParameters.length;

    const requestBodyReference = getRequestBody({
        request: endpoint.request,
        endpointDirectory,
        modelDirectory,
        typeResolver,
    });

    // if there's no request body or parameters, then there's no endpoint parameter
    // and no request body
    if (requestBodyReference == null && numParameters === 0) {
        return {
            endpointParameter: undefined,
            requestBody: undefined,
        };
    }

    // if there's a request body and no parameters, then we just reference
    // RequestBody directly in the endpoint.
    if (requestBodyReference != null && numParameters === 0) {
        return {
            endpointParameter: requestBodyReference.isLocal
                ? {
                      isLocal: true,
                      typeName: ClientConstants.Service.Endpoint.Types.Request.Properties.Body.TYPE_NAME,
                  }
                : {
                      isLocal: false,
                      typeReference: requestBodyReference.typeReference,
                  },
            requestBody: {
                encoding: endpoint.request.encoding,
                reference: requestBodyReference,
                propertyName: undefined,
            },
        };
    }

    // since there are some parameters, then we need a Request type that includes those parameters
    const requestFile = getOrCreateSourceFile(
        endpointDirectory,
        `${ClientConstants.Service.Endpoint.Types.Request.TYPE_NAME}.ts`
    );
    const endpointParameter: LocalEndpointParameterReference = {
        isLocal: true,
        typeName: ClientConstants.Service.Endpoint.Types.Request.TYPE_NAME,
    };

    // generate the Request type (in the request file). The request type will contain
    // the request body, if there is one
    generateRequest({
        requestFile,
        endpoint,
        serviceName,
        modelDirectory,
        servicesDirectory,
        requestBodyReference,
    });

    return {
        endpointParameter,
        requestBody:
            requestBodyReference != null
                ? {
                      encoding: endpoint.request.encoding,
                      reference: requestBodyReference,
                      propertyName: ClientConstants.Service.Endpoint.Types.Request.Properties.Body.PROPERTY_NAME,
                  }
                : undefined,
    };
}

function getRequestBody({
    request,
    endpointDirectory,
    modelDirectory,
    typeResolver,
}: {
    request: HttpRequest;
    endpointDirectory: Directory;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}) {
    return generateWireMessageBodyReference({
        typeName: ClientConstants.Service.Endpoint.Types.Request.Properties.Body.TYPE_NAME,
        type: request.type,
        docs: request.docs,
        endpointDirectory,
        modelDirectory,
        typeResolver,
    });
}
