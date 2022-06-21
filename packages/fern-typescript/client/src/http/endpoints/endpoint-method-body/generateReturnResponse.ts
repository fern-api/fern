import { HttpEndpoint, HttpService } from "@fern-api/api";
import { ModelContext } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import {
    GeneratedHttpEndpointTypes,
    getServiceTypeReference,
    ServiceTypesConstants,
} from "@fern-typescript/service-types";
import { Directory, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateEncoderCall } from "./generateEncoderCall";

export async function generateReturnResponse({
    serviceFile,
    serviceDefinition,
    endpoint,
    endpointTypes,
    modelDirectory,
    modelContext,
    encodersDirectory,
    helperManager,
}: {
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelDirectory: Directory;
    modelContext: ModelContext;
    encodersDirectory: Directory;
    helperManager: HelperManager;
}): Promise<ts.Statement> {
    return ts.factory.createIfStatement(
        ts.factory.createCallExpression(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Imported.IS_RESPONSE_OK_FUNCTION),
            undefined,
            [ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE)]
        ),
        ts.factory.createBlock(
            await generateReturnSuccessResponse({
                serviceFile,
                serviceDefinition,
                endpoint,
                endpointTypes,
                encodersDirectory,
                modelDirectory,
                helperManager,
                modelContext,
            })
        ),
        ts.factory.createBlock(
            await generateReturnErrorResponse({
                serviceDefinition,
                serviceFile,
                endpoint,
                endpointTypes,
                helperManager,
                encodersDirectory,
                modelDirectory,
                modelContext,
            })
        )
    );
}

async function generateReturnSuccessResponse({
    serviceFile,
    serviceDefinition,
    endpoint,
    endpointTypes,
    modelDirectory,
    modelContext,
    encodersDirectory,
    helperManager,
}: {
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelDirectory: Directory;
    modelContext: ModelContext;
    encodersDirectory: Directory;
    helperManager: HelperManager;
}): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];

    const properties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: true });

    if (endpointTypes.response.successBodyReference != null) {
        const decodeResponseStatement = await generateDecodeResponse({
            helperManager,
            endpoint,
            serviceDefinition,
            serviceFile,
            decodedVariableName: ClientConstants.HttpService.Endpoint.Variables.DECODED_RESPONSE,
            wireMessageType: "Response",
            encodersDirectory,
        });
        statements.push(decodeResponseStatement);

        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(
                    ServiceTypesConstants.Commons.Response.Success.Properties.Body.PROPERTY_NAME
                ),
                ts.factory.createAsExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.DECODED_RESPONSE),
                    getServiceTypeReference({
                        reference: endpointTypes.response.successBodyReference,
                        referencedIn: serviceFile,
                        modelDirectory,
                        modelContext,
                    })
                )
            )
        );
    }

    const returnStatement = ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(properties, true)
    );
    statements.push(returnStatement);

    return statements;
}

async function generateReturnErrorResponse({
    serviceDefinition,
    endpoint,
    endpointTypes,
    helperManager,
    serviceFile,
    encodersDirectory,
    modelDirectory,
    modelContext,
}: {
    serviceDefinition: HttpService;
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    helperManager: HelperManager;
    encodersDirectory: Directory;
    modelDirectory: Directory;
    modelContext: ModelContext;
}): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];
    const returnStatementProperties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: false });

    if (endpointTypes.response.errorBodyReference != null) {
        const decodeErrorStatement = await generateDecodeResponse({
            helperManager,
            endpoint,
            serviceDefinition,
            decodedVariableName: ClientConstants.HttpService.Endpoint.Variables.DECODED_ERROR,
            wireMessageType: "Error",
            serviceFile,
            encodersDirectory,
        });
        statements.push(decodeErrorStatement);

        returnStatementProperties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME),
                ts.factory.createAsExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.DECODED_ERROR),
                    getServiceTypeReference({
                        reference: endpointTypes.response.errorBodyReference,
                        referencedIn: serviceFile,
                        modelDirectory,
                        modelContext,
                    })
                )
            )
        );
    }

    const returnStatement = ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(returnStatementProperties, true)
    );
    statements.push(returnStatement);

    return statements;
}

function getBaseResponseProperties({ ok }: { ok: boolean }): ts.ObjectLiteralElementLike[] {
    return [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Properties.OK),
            ok ? ts.factory.createTrue() : ts.factory.createFalse()
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ServiceTypesConstants.HttpEndpint.Response.Properties.STATUS_CODE),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE),
                ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Response.STATUS_CODE)
            )
        ),
    ];
}

async function generateDecodeResponse({
    helperManager,
    serviceDefinition,
    serviceFile,
    endpoint,
    decodedVariableName,
    wireMessageType,
    encodersDirectory,
}: {
    helperManager: HelperManager;
    serviceDefinition: HttpService;
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
    decodedVariableName: string;
    wireMessageType: "Response" | "Error";
    encodersDirectory: Directory;
}): Promise<ts.Statement> {
    const decoder = await helperManager.getEncoderForEncoding(endpoint.response.encoding);
    const decodedResponse = generateEncoderCall({
        encoder: decoder,
        method: "decode",
        variableReference: {
            _type: "wireMessage",
            wireMessageType,
            serviceName: serviceDefinition.name.name,
            endpointId: endpoint.endpointId,
            variable: ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE),
                ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Response.BODY)
            ),
        },
        referencedIn: serviceFile,
        encodersDirectory,
    });

    return ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
            [
                ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier(decodedVariableName),
                    undefined,
                    undefined,
                    decodedResponse
                ),
            ],
            ts.NodeFlags.Const
        )
    );
}
