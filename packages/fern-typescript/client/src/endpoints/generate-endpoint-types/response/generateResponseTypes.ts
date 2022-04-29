import { HttpEndpoint } from "@fern-api/api";
import { getOrCreateSourceFile, getTextOfTsKeyword, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, ts, Writers } from "ts-morph";
import { generateWireMessageBodyReference } from "../generateWireMessageBodyReference";
import { GeneratedEndpointTypes } from "../types";
import {
    ERROR_BODY_PROPERTY_NAME,
    ERROR_BODY_TYPE_NAME,
    ERROR_RESPONSE_TYPE_NAME,
    RESPONSE_BODY_PROPERTY_NAME,
    RESPONSE_BODY_TYPE_NAME,
    RESPONSE_OK_PROPERTY_NAME,
    RESPONSE_STATUS_CODE_PROPERTY_NAME,
    RESPONSE_TYPE_NAME,
    SUCCESS_RESPONSE_TYPE_NAME,
} from "./constants";
import { generateErrorBodyReference } from "./generateErrorBodyReference";

export declare namespace generateResponseTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        errorsDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = Pick<GeneratedEndpointTypes, "responseBody">;
}

export function generateResponseTypes({
    endpoint,
    endpointDirectory,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const responseBody =
        endpoint.request != null
            ? generateWireMessageBodyReference({
                  typeName: RESPONSE_BODY_TYPE_NAME,
                  wireMessage: endpoint.request,
                  endpointDirectory,
                  modelDirectory,
                  typeResolver,
              })
            : undefined;

    const responseFile = getOrCreateSourceFile(endpointDirectory, `${RESPONSE_TYPE_NAME}.ts`);

    responseFile.addTypeAlias({
        name: RESPONSE_TYPE_NAME,
        type: Writers.unionType(SUCCESS_RESPONSE_TYPE_NAME, ERROR_RESPONSE_TYPE_NAME),
        isExported: true,
    });

    responseFile.addInterface({
        name: SUCCESS_RESPONSE_TYPE_NAME,
        isExported: true,
        properties: generateSuccessResponse({
            responseBodyReference: responseBody != null ? responseBody.generateTypeReference(responseFile) : undefined,
        }),
    });

    const errorBodyFile = getOrCreateSourceFile(endpointDirectory, `${ERROR_BODY_TYPE_NAME}.ts`);
    responseFile.addInterface({
        name: ERROR_RESPONSE_TYPE_NAME,
        isExported: true,
        properties: [
            {
                name: RESPONSE_OK_PROPERTY_NAME,
                type: getTextOfTsNode(ts.factory.createLiteralTypeNode(ts.factory.createFalse())),
            },
            {
                name: RESPONSE_STATUS_CODE_PROPERTY_NAME,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
            {
                name: ERROR_BODY_PROPERTY_NAME,
                type: getTextOfTsNode(
                    generateErrorBodyReference({
                        endpoint,
                        errorBodyFile,
                        referencedIn: responseFile,
                        errorsDirectory,
                    })
                ),
            },
        ],
    });

    return {
        responseBody:
            responseBody != null
                ? {
                      propertyName: RESPONSE_BODY_PROPERTY_NAME,
                      identifier: ts.factory.createIdentifier(RESPONSE_BODY_TYPE_NAME),
                  }
                : undefined,
    };
}

function generateSuccessResponse({
    responseBodyReference,
}: {
    responseBodyReference: ts.TypeNode | undefined;
}): OptionalKind<PropertySignatureStructure>[] {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: RESPONSE_OK_PROPERTY_NAME,
            type: getTextOfTsNode(ts.factory.createLiteralTypeNode(ts.factory.createTrue())),
        },
        {
            name: RESPONSE_STATUS_CODE_PROPERTY_NAME,
            type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
        },
    ];

    if (responseBodyReference) {
        properties.push({
            name: RESPONSE_BODY_PROPERTY_NAME,
            type: getTextOfTsNode(responseBodyReference),
        });
    }

    return properties;
}
