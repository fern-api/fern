import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
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
    FETCHER_REQUEST_BODY_CONTENT_PROPERTY_NAME,
    FETCHER_REQUEST_BODY_CONTENT_TYPE_PROPERTY_NAME,
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

const ENCODED_RESPONSE_VARIABLE_NAME = "encodedResponse";

export async function generateFetcherCall({
    serviceFile,
    endpoint,
    endpointTypes,
    includeQueryParams,
    helperManager,
}: {
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedEndpointTypes;
    includeQueryParams: boolean;
    helperManager: HelperManager;
}): Promise<StatementStructures[]> {
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
        const requestBodyReference =
            endpointTypes.requestBody.reference.propertyName != null
                ? ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier(ENDPOINT_PARAMETER_NAME),
                      endpointTypes.requestBody.reference.propertyName
                  )
                : ts.factory.createIdentifier(ENDPOINT_PARAMETER_NAME);

        const encodingHelper = await helperManager.getHandlersForEncoding(endpointTypes.requestBody.encoding);
        const encodedRequestBody = encodingHelper.generateEncode({
            referenceToDecoded: requestBodyReference,
        });

        fetcherArgs.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(FETCHER_REQUEST_BODY_PROPERTY_NAME),
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(FETCHER_REQUEST_BODY_CONTENT_PROPERTY_NAME),
                            encodedRequestBody
                        ),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(FETCHER_REQUEST_BODY_CONTENT_TYPE_PROPERTY_NAME),
                            ts.factory.createStringLiteral(encodingHelper.contentType)
                        ),
                    ],
                    true
                )
            )
        );
    }

    const fetcherCall: StatementStructures = {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: ENCODED_RESPONSE_VARIABLE_NAME,
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

    const decodingHelper = await helperManager.getHandlersForEncoding(endpointTypes.response.encoding);
    const decodedResponse = decodingHelper.generateDecode({
        referenceToEncodedBuffer: ts.factory.createIdentifier(ENCODED_RESPONSE_VARIABLE_NAME),
    });
    const decoderCall: StatementStructures = {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: RESPONSE_VARIABLE_NAME,
                initializer: getTextOfTsNode(decodedResponse),
            },
        ],
    };

    return [fetcherCall, decoderCall];
}
