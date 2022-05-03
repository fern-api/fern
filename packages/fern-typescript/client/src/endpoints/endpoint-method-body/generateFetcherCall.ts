import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SourceFile, StatementStructures, StructureKind, ts, VariableDeclarationKind } from "ts-morph";
import {
    BASE_URL_SERVICE_MEMBER,
    ENDPOINT_PARAMETER_NAME,
    FETCHER_SERVICE_MEMBER,
    TOKEN_SERVICE_MEMBER,
} from "../../constants";
import { generateJoinPathsCall } from "../../utils/generateJoinPathsCall";
import { GeneratedEndpointTypes } from "../generate-endpoint-types/types";
import {
    FETCHER_REQUEST_BODY_PROPERTY_NAME,
    FETCHER_REQUEST_HEADER_PARAMETER_NAME,
    FETCHER_REQUEST_METHOD_PARAMETER_NAME,
    FETCHER_REQUEST_QUERY_PARAMS_PARAMETER_NAME,
    FETCHER_REQUEST_TOKEN_PROPERTY_NAME,
    FETCHER_REQUEST_URL_PARAMETER_NAME,
    QUERY_PARAMETERS_VARIABLE_NAME,
    RESPONSE_VARIABLE_NAME,
} from "./constants";
import { convertPathToTemplateString } from "./convertPathToTemplateString";

export function generateFetcherCall({
    serviceFile,
    endpoint,
    endpointTypes,
    includeQueryParams,
}: {
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedEndpointTypes;
    includeQueryParams: boolean;
}): StatementStructures {
    const fetcherArgs: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(FETCHER_REQUEST_URL_PARAMETER_NAME),
            generateJoinPathsCall({
                file: serviceFile,
                paths: [
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier(BASE_URL_SERVICE_MEMBER)
                    ),
                    convertPathToTemplateString(endpoint.path),
                ],
            })
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(FETCHER_REQUEST_METHOD_PARAMETER_NAME),
            ts.factory.createStringLiteral(endpoint.method)
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(FETCHER_REQUEST_HEADER_PARAMETER_NAME),
            ts.factory.createObjectLiteralExpression([])
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(FETCHER_REQUEST_TOKEN_PROPERTY_NAME),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier(TOKEN_SERVICE_MEMBER)
            )
        ),
    ];

    if (includeQueryParams) {
        fetcherArgs.push(
            QUERY_PARAMETERS_VARIABLE_NAME === FETCHER_REQUEST_QUERY_PARAMS_PARAMETER_NAME
                ? ts.factory.createShorthandPropertyAssignment(
                      ts.factory.createIdentifier(QUERY_PARAMETERS_VARIABLE_NAME)
                  )
                : ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier(FETCHER_REQUEST_QUERY_PARAMS_PARAMETER_NAME),
                      ts.factory.createIdentifier(QUERY_PARAMETERS_VARIABLE_NAME)
                  )
        );
    }

    if (endpointTypes.requestBody != null) {
        fetcherArgs.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(FETCHER_REQUEST_BODY_PROPERTY_NAME),
                endpointTypes.requestBody.propertyName != null
                    ? ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier(ENDPOINT_PARAMETER_NAME),
                          endpointTypes.requestBody.propertyName
                      )
                    : ts.factory.createIdentifier(ENDPOINT_PARAMETER_NAME)
            )
        );
    }

    return {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: RESPONSE_VARIABLE_NAME,
                initializer: getTextOfTsNode(
                    ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                ts.factory.createIdentifier(FETCHER_SERVICE_MEMBER)
                            ),
                            undefined,
                            [ts.factory.createObjectLiteralExpression(fetcherArgs, true)]
                        )
                    )
                ),
            },
        ],
    };
}
