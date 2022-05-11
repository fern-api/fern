import { HttpEndpoint, HttpRequest } from "@fern-api/api";
import { getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateWireMessageBodyReference } from "../generateWireMessageBodyReference";
import { GeneratedEndpointTypes, LocalEndpointParameterReference } from "../types";
import { REQUEST_BODY_PROPERTY_NAME, REQUEST_BODY_TYPE_NAME, REQUEST_TYPE_NAME } from "./constants";
import { generateRequest } from "./generateRequest";

export declare namespace generateRequestTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = Pick<GeneratedEndpointTypes, "endpointParameter" | "requestBody">;
}

export function generateRequestTypes({
    endpoint,
    endpointDirectory,
    modelDirectory,
    typeResolver,
}: generateRequestTypes.Args): generateRequestTypes.Return {
    const numParameters = endpoint.parameters.length + endpoint.queryParameters.length;

    // if there's no request or parameters, then there's no endpoint parameter
    // and no request body
    if (endpoint.request == null && numParameters === 0) {
        return {
            endpointParameter: undefined,
            requestBody: undefined,
        };
    }

    // if there's a request body and no parameters, then we just reference
    // RequestBody directly in the endpoint.
    if (endpoint.request != null && numParameters === 0) {
        const requestBody = getRequestBody({
            request: endpoint.request,
            endpointDirectory,
            modelDirectory,
            typeResolver,
        });

        return {
            endpointParameter:
                requestBody.file != null
                    ? {
                          isLocal: true,
                          typeName: ts.factory.createIdentifier(REQUEST_BODY_TYPE_NAME),
                      }
                    : {
                          isLocal: false,
                          generateTypeReference: requestBody.generateTypeReference,
                      },
            requestBody: {
                encoding: endpoint.request.encoding,
                reference: {
                    isLocal: true,
                    typeName: ts.factory.createIdentifier(REQUEST_BODY_TYPE_NAME),
                },
            },
        };
    }

    // since there are some parameters, then we need a Request type that includes those parameters
    const requestFile = getOrCreateSourceFile(endpointDirectory, `${REQUEST_TYPE_NAME}.ts`);
    const endpointParameter: LocalEndpointParameterReference = {
        isLocal: true,
        typeName: ts.factory.createIdentifier(REQUEST_TYPE_NAME),
    };

    // if theres's no request body, then we generate a Request object with all the parameters
    if (endpoint.request == null) {
        generateRequest({
            requestFile,
            endpoint,
            modelDirectory,
            generateRequestBodyReference: undefined,
        });
        return { endpointParameter, requestBody: undefined };
    }

    const requestBody = getRequestBody({
        request: endpoint.request,
        endpointDirectory,
        modelDirectory,
        typeResolver,
    });
    generateRequest({
        requestFile,
        endpoint,
        modelDirectory,
        generateRequestBodyReference: requestBody.generateTypeReference,
    });

    return {
        endpointParameter,
        requestBody: {
            encoding: endpoint.request.encoding,
            reference:
                requestBody.file != null
                    ? {
                          isLocal: true,
                          typeName: ts.factory.createIdentifier(REQUEST_BODY_TYPE_NAME),
                          propertyName: REQUEST_BODY_PROPERTY_NAME,
                      }
                    : {
                          isLocal: false,
                          generateTypeReference: requestBody.generateTypeReference,
                          propertyName: REQUEST_BODY_PROPERTY_NAME,
                      },
        },
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
        typeName: REQUEST_BODY_TYPE_NAME,
        type: request.type,
        docs: request.docs,
        endpointDirectory,
        modelDirectory,
        typeResolver,
    });
}
