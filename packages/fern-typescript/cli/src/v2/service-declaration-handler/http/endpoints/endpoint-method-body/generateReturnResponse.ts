import { ts } from "ts-morph";
import { File } from "../../../../client/types";
import { ClientConstants } from "../../../constants";
import { ParsedClientEndpoint } from "../parse-endpoint/parseEndpointAndGenerateEndpointModule";

export function generateReturnResponse({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): ts.Statement {
    return ts.factory.createIfStatement(
        file.serviceUtils.isResponseOk(
            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE)
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
                ts.factory.createIdentifier(file.serviceUtils.Response.Success.BODY_PROPERTY_NAME),
                ts.factory.createAsExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                    endpoint.referenceToResponse
                )
            )
        );
    }

    return ts.factory.createReturnStatement(ts.factory.createObjectLiteralExpression(properties, true));
}

function generateReturnErrorResponse({ file }: { endpoint: ParsedClientEndpoint; file: File }): ts.Statement {
    const properties: ts.ObjectLiteralElementLike[] = getBaseResponseProperties({ ok: false, file });

    properties.push(
        ts.factory.createPropertyAssignment(
            file.serviceUtils.Response.Failure.BODY_PROPERTY_NAME,
            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.ERROR)
        )
    );

    return ts.factory.createReturnStatement(ts.factory.createObjectLiteralExpression(properties, true));
}

function getBaseResponseProperties({ ok, file }: { ok: boolean; file: File }): ts.ObjectLiteralElementLike[] {
    return [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(file.serviceUtils.Response.OK_DISCRIMINANT),
            ok ? ts.factory.createTrue() : ts.factory.createFalse()
        ),
    ];
}
