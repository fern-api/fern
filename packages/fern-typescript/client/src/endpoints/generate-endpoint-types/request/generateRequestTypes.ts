import { HttpEndpoint, PathParameter, QueryParameter } from "@fern-api/api";
import { getOrCreateSourceFile, TypeResolver } from "@fern-typescript/commons";
import { Directory, ts } from "ts-morph";
import { generateWireMessageBodyReference } from "../generateWireMessageBodyReference";
import { GeneratedEndpointTypes } from "../types";
import {
    REQUEST_BODY_PROPERTY_NAME,
    REQUEST_BODY_TYPE_NAME,
    REQUEST_PARAMETER_NAME,
    REQUEST_TYPE_NAME,
} from "./constants";
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
    if (endpoint.request == null && numParameters === 0) {
        return {
            endpointParameter: undefined,
            requestBody: undefined,
        };
    }

    const requestBody =
        endpoint.request != null
            ? generateWireMessageBodyReference({
                  typeName: REQUEST_BODY_TYPE_NAME,
                  wireMessage: endpoint.request,
                  endpointDirectory,
                  modelDirectory,
                  typeResolver,
              })
            : undefined;

    // if there's no parameters and RequestBody is in its own file, then we just
    // reference RequestBody directly in the endpoint.
    if (requestBody?.file != null && numParameters === 0) {
        return {
            endpointParameter: {
                name: REQUEST_PARAMETER_NAME,
                type: ts.factory.createTypeReferenceNode(REQUEST_BODY_TYPE_NAME),
                identifier: ts.factory.createIdentifier(REQUEST_BODY_TYPE_NAME),
            },
            requestBody: {
                reference: ts.factory.createIdentifier(REQUEST_PARAMETER_NAME),
            },
        };
    }

    // Otherwise, we generate a Request type that contains all parameters and
    // the RequestBody (if it exists)
    const requestFile = getOrCreateSourceFile(endpointDirectory, `${REQUEST_TYPE_NAME}.ts`);
    generateRequest({
        requestFile,
        endpoint,
        modelDirectory,
        requestBodyReference: requestBody != null ? requestBody.generateTypeReference(requestFile) : undefined,
    });

    return {
        endpointParameter: {
            name: REQUEST_PARAMETER_NAME,
            type: ts.factory.createTypeReferenceNode(REQUEST_TYPE_NAME),
            identifier: ts.factory.createIdentifier(REQUEST_TYPE_NAME),
        },
        requestBody:
            requestBody != null
                ? {
                      reference: ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(REQUEST_PARAMETER_NAME),
                          ts.factory.createIdentifier(REQUEST_BODY_PROPERTY_NAME)
                      ),
                  }
                : undefined,
    };
}

export function getQueryParameterReference(queryParameter: QueryParameter): ts.PropertyAccessExpression {
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(REQUEST_PARAMETER_NAME),
        ts.factory.createIdentifier(queryParameter.key)
    );
}

export function getPathParameterReference(pathParameter: PathParameter): ts.PropertyAccessExpression {
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(REQUEST_PARAMETER_NAME),
        ts.factory.createIdentifier(pathParameter.key)
    );
}
