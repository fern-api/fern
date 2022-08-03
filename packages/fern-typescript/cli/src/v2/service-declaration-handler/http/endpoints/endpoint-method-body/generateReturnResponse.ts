import { ts } from "ts-morph";
import { File } from "../../../../client/types";
import { ClientConstants } from "../../../constants";
import { ParsedClientEndpoint } from "../parse-endpoint/parseEndpoint";

export function generateReturnResponse({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): ts.Statement {
    return ts.factory.createIfStatement(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.ReturnValue.OK)
        ),
        ts.factory.createBlock([generateReturnSuccessResponse({ endpoint, file })]),
        ts.factory.createBlock([
            generateReturnErrorResponse({
                endpoint,
                file,
            }),
        ])
    );
}

function generateReturnSuccessResponse({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): ts.Statement {
    const properties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: true, file });
    if (endpoint.referenceToResponse != null) {
        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(
                    file.externalDependencies.serviceUtils._Response.Success.BODY_PROPERTY_NAME
                ),
                ts.factory.createAsExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                        file.externalDependencies.serviceUtils.Fetcher.ReturnValue.BODY
                    ),
                    endpoint.referenceToResponse
                )
            )
        );
    }

    return ts.factory.createReturnStatement(ts.factory.createObjectLiteralExpression(properties, true));
}

function generateReturnErrorResponse({ file, endpoint }: { endpoint: ParsedClientEndpoint; file: File }): ts.Statement {
    return ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(
            [
                ...getBaseResponseProperties({ ok: false, file }),
                ts.factory.createPropertyAssignment(
                    file.externalDependencies.serviceUtils._Response.Failure.BODY_PROPERTY_NAME,
                    ts.factory.createAsExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                            file.externalDependencies.serviceUtils.Fetcher.ReturnValue.BODY
                        ),
                        endpoint.referenceToError
                    )
                ),
            ],
            true
        )
    );
}

function getBaseResponseProperties({ ok, file }: { ok: boolean; file: File }): ts.ObjectLiteralElementLike[] {
    return [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils._Response.OK_DISCRIMINANT),
            ok ? ts.factory.createTrue() : ts.factory.createFalse()
        ),
    ];
}
