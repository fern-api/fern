import { getTextOfTsNode } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { StatementStructures, StructureKind, ts, VariableDeclarationKind } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ClientEndpointRequest, ParsedClientEndpoint } from "../parse-endpoint/ParsedClientEndpoint";
import { convertPathToTemplateString } from "./convertPathToTemplateString";

export function generateFetcherCall({
    endpoint,
    file,
}: {
    endpoint: ParsedClientEndpoint;
    file: File;
}): StatementStructures {
    const fetcherArgs: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.URL),
            file.externalDependencies.urlJoin.invoke([
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    ts.factory.createIdentifier(ClientConstants.HttpService.PrivateMembers.BASE_URL)
                ),
                convertPathToTemplateString(endpoint.path),
            ])
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.METHOD),
            ts.factory.createStringLiteral(endpoint.method)
        ),
    ];

    if (endpoint.request != null && endpoint.request.isWrapped && endpoint.request.headers.length > 0) {
        fetcherArgs.push(getHeadersPropertyAssignment({ request: endpoint.request, file }));
    }

    if (endpoint.request != null && endpoint.request.isWrapped && endpoint.request.queryParameters.length > 0) {
        fetcherArgs.push(
            ts.factory.createPropertyAssignment(
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
            ts.factory.createPropertyAssignment(
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

function getHeadersPropertyAssignment({
    request,
    file,
}: {
    request: ClientEndpointRequest.Wrapped;
    file: File;
}): ts.ObjectLiteralElementLike {
    return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(file.externalDependencies.serviceUtils.Fetcher.Parameters.HEADERS),
        getHeadersPropertyValue(request)
    );
}

function getHeadersPropertyValue(request: ClientEndpointRequest.Wrapped): ts.Expression {
    const properties = request.headers.map((header) =>
        ts.factory.createPropertyAssignment(
            ts.factory.createStringLiteral(header.originalData.name.wireValue),
            ts.factory.createElementAccessExpression(
                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                ts.factory.createStringLiteral(header.key)
            )
        )
    );
    return ts.factory.createObjectLiteralExpression(properties, true);
}
