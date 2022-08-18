import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { File } from "@fern-typescript/declaration-handler";
import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ParsedClientEndpoint } from "../parse-endpoint/ParsedClientEndpoint";

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
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Response.OK)
        ),
        ts.factory.createBlock([generateReturnSuccessResponse({ endpoint, file })]),
        ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                    ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Response.DISCRIMINANT)
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                ts.factory.createStringLiteral(
                    file.externalDependencies.serviceUtils.Fetcher.NetworkError.DISCRIMINANT_VALUE
                )
            ),
            ts.factory.createBlock([
                generateReturnNetworkErrorResponse({
                    file,
                    endpoint,
                }),
            ]),
            ts.factory.createBlock([
                generateReturnServerErrorResponse({
                    endpoint,
                    file,
                }),
            ])
        )
    );
}

function generateReturnSuccessResponse({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): ts.Statement {
    return ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(
            [
                ...getBaseResponseProperties({ ok: true, file }),
                createPropertyAssignment(
                    ts.factory.createIdentifier(
                        file.externalDependencies.serviceUtils._Response.Success.BODY_PROPERTY_NAME
                    ),
                    endpoint.referenceToResponse != null
                        ? ts.factory.createAsExpression(
                              ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                                  file.externalDependencies.serviceUtils.Fetcher.Response.BODY
                              ),
                              endpoint.referenceToResponse
                          )
                        : ts.factory.createIdentifier("undefined")
                ),
            ],
            true
        )
    );
}

function generateReturnNetworkErrorResponse({
    file,
    endpoint,
}: {
    file: File;
    endpoint: ParsedClientEndpoint;
}): ts.Statement {
    return ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(
            [
                ...getBaseResponseProperties({ ok: false, file }),
                createPropertyAssignment(
                    file.externalDependencies.serviceUtils._Response.Failure.BODY_PROPERTY_NAME,
                    endpoint.error.generateConstructNetworkErrorBody()
                ),
            ],
            true
        )
    );
}

function generateReturnServerErrorResponse({
    file,
    endpoint,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): ts.Statement {
    return ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(
            [
                ...getBaseResponseProperties({ ok: false, file }),
                createPropertyAssignment(
                    file.externalDependencies.serviceUtils._Response.Failure.BODY_PROPERTY_NAME,
                    endpoint.error.generateConstructServerErrorBody()
                ),
            ],
            true
        )
    );
}

function getBaseResponseProperties({ ok, file }: { ok: boolean; file: File }): ts.ObjectLiteralElementLike[] {
    return [
        createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils._Response.OK_DISCRIMINANT),
            ok ? ts.factory.createTrue() : ts.factory.createFalse()
        ),
    ];
}
