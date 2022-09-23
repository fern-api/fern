import { getTextOfTsNode } from "@fern-typescript/commons";
import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { StatementStructures, StructureKind, ts, VariableDeclarationKind } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ClientEndpointRequest, ParsedClientEndpoint } from "../parse-endpoint/ParsedClientEndpoint";
import { convertPathToTemplateString } from "./convertPathToTemplateString";

export function generateFetcherCall({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: SdkFile;
}): StatementStructures {
    const fetcherArgs: ts.ObjectLiteralElementLike[] = [
        createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.URL),
            file.externalDependencies.urlJoin.invoke([
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ClientConstants.HttpService.PrivateMembers.OPTIONS
                    ),
                    ClientConstants.HttpService.ServiceNamespace.Options.Properties.BASE_PATH
                ),
                convertPathToTemplateString(endpoint),
            ])
        ),
        createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.METHOD),
            ts.factory.createStringLiteral(endpoint.method)
        ),
        createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.HEADERS),
            ts.factory.createObjectLiteralExpression(
                [
                    ...getHeadersFromRequest(endpoint.request),
                    ...file.authSchemes.getHeaders(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            ClientConstants.HttpService.PrivateMembers.OPTIONS
                        )
                    ),
                ],
                true
            )
        ),
    ];

    if (endpoint.request != null && endpoint.request.isWrapped && endpoint.request.queryParameters.length > 0) {
        fetcherArgs.push(
            createPropertyAssignment(
                ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.QUERY_PARAMS),
                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS)
            )
        );
    }

    const referenceToBody =
        endpoint.request != null
            ? endpoint.request.isWrapped
                ? endpoint.request.body != null
                    ? ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                          endpoint.request.body.key
                      )
                    : undefined
                : ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER)
            : undefined;

    if (referenceToBody != null) {
        fetcherArgs.push(
            createPropertyAssignment(
                ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.BODY),
                referenceToBody
            )
        );
    }

    return {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: ClientConstants.HttpService.Endpoint.Variables.RESPONSE,
                initializer: getTextOfTsNode(
                    ts.factory.createAwaitExpression(
                        file.externalDependencies.serviceUtils.defaultFetcher(
                            ts.factory.createObjectLiteralExpression(fetcherArgs, true)
                        )
                    )
                ),
            },
        ],
    };
}

function getHeadersFromRequest(request: ClientEndpointRequest | undefined): ts.ObjectLiteralElementLike[] {
    if (request == null || !request.isWrapped) {
        return [];
    }
    return request.headers.map((header) =>
        createPropertyAssignment(
            ts.factory.createStringLiteral(header.originalData.name.wireValue),
            ts.factory.createElementAccessExpression(
                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                ts.factory.createStringLiteral(header.key)
            )
        )
    );
}
