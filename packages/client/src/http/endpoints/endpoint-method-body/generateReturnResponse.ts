import { DependencyManager, getReferenceToFernServiceUtilsValue } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { ServiceTypesConstants } from "@fern-typescript/service-types";
import { SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";

export async function generateReturnResponse({
    serviceFile,
    endpointTypes,
    modelContext,
    dependencyManager,
}: {
    serviceFile: SourceFile;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
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
                endpointTypes,
                modelContext,
            })
        ),
        ts.factory.createBlock(
            await generateReturnErrorResponse({
                serviceFile,
                endpointTypes,
                modelContext,
            })
        )
    );
}

async function generateReturnSuccessResponse({
    serviceFile,
    endpointTypes,
    modelContext,
}: {
    serviceFile: SourceFile;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
}): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];

    const properties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: true });

    if (endpointTypes.response.successBodyReference != null) {
        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(
                    ServiceTypesConstants.Commons.Response.Success.Properties.Body.PROPERTY_NAME
                ),
                ts.factory.createAsExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE),
                        ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Response.BODY)
                    ),
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
    endpointTypes,
    serviceFile,
    modelContext,
}: {
    serviceFile: SourceFile;
    endpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
}): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];
    const returnStatementProperties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: false });

    returnStatementProperties.push(
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME),
            ts.factory.createAsExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE),
                    ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Response.BODY)
                ),
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
