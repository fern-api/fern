import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { DependencyManager, getReferenceToFernServiceUtilsValue } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { ServiceTypesConstants } from "@fern-typescript/service-types";
import { SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateEncoderCall } from "./generateEncoderCall";

export async function generateReturnResponse({
    serviceFile,
    serviceDefinition,
    endpoint,
    endpointTypes,
    modelContext,
    helperManager,
    dependencyManager,
}: {
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): Promise<ts.Statement> {
    return ts.factory.createIfStatement(
        ts.factory.createCallExpression(
            getReferenceToFernServiceUtilsValue({
                value: "isResponseOk",
                dependencyManager,
                referencedIn: serviceFile,
            }),
            undefined,
            [ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE)]
        ),
        ts.factory.createBlock(
            await generateReturnSuccessResponse({
                serviceFile,
                serviceDefinition,
                endpoint,
                endpointTypes,
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
    modelContext,
    helperManager,
}: {
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
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
        });
        statements.push(decodeResponseStatement);

        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(
                    ServiceTypesConstants.Commons.Response.Success.Properties.Body.PROPERTY_NAME
                ),
                ts.factory.createAsExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.DECODED_RESPONSE),
                    modelContext.getReferenceToHttpServiceType({
                        reference: endpointTypes.response.successBodyReference,
                        referencedIn: serviceFile,
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
    modelContext,
}: {
    serviceDefinition: HttpService;
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    helperManager: HelperManager;
    modelContext: ModelContext;
}): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];
    const returnStatementProperties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: false });

    const decodeErrorStatement = await generateDecodeResponse({
        helperManager,
        endpoint,
        serviceDefinition,
        decodedVariableName: ClientConstants.HttpService.Endpoint.Variables.DECODED_ERROR,
        wireMessageType: "Error",
        serviceFile,
    });
    statements.push(decodeErrorStatement);

    returnStatementProperties.push(
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME),
            ts.factory.createAsExpression(
                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.DECODED_ERROR),
                modelContext.getReferenceToHttpServiceType({
                    reference: endpointTypes.response.errorBodyReference,
                    referencedIn: serviceFile,
                })
            )
        )
    );

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
    ];
}

async function generateDecodeResponse({
    helperManager,
    serviceDefinition,
    serviceFile,
    endpoint,
    decodedVariableName,
    wireMessageType,
}: {
    helperManager: HelperManager;
    serviceDefinition: HttpService;
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
    decodedVariableName: string;
    wireMessageType: "Response" | "Error";
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
