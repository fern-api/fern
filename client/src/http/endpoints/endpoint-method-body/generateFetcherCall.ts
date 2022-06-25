import { HttpEndpoint, HttpService } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { GeneratedHttpEndpointTypes } from "@fern-typescript/model-context";
import { SourceFile, StatementStructures, StructureKind, ts, VariableDeclarationKind } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateJoinPathsCall } from "../../../utils/generateJoinPathsCall";
import { convertPathToTemplateString } from "./convertPathToTemplateString";
import { generateEncoderCall } from "./generateEncoderCall";

export async function generateFetcherCall({
    serviceFile,
    serviceDefinition,
    endpoint,
    endpointTypes,
    includeQueryParams,
    helperManager,
}: {
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    includeQueryParams: boolean;
    helperManager: HelperManager;
}): Promise<StatementStructures> {
    const fetcherArgs: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.URL),
            generateJoinPathsCall(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    ts.factory.createIdentifier(ClientConstants.HttpService.PrivateMembers.BASE_URL)
                ),
                convertPathToTemplateString(endpoint.path)
            )
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.METHOD),
            ts.factory.createStringLiteral(endpoint.method)
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.HEADERS),
            ts.factory.createObjectLiteralExpression([])
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.TOKEN),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier(ClientConstants.HttpService.PrivateMembers.TOKEN)
            )
        ),
    ];

    if (includeQueryParams) {
        fetcherArgs.push(
            ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS ===
                ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.QUERY_PARAMS
                ? ts.factory.createShorthandPropertyAssignment(
                      ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS)
                  )
                : ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier(
                          ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.QUERY_PARAMS
                      ),
                      ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.QUERY_PARAMETERS)
                  )
        );
    }

    if (endpointTypes.request?.body != null) {
        const requestBodyReference =
            endpointTypes.request.wrapper != null
                ? ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                      endpointTypes.request.wrapper.propertyName
                  )
                : ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER);

        const encoder = await helperManager.getEncoderForEncoding(endpoint.request.encoding);
        const encodedRequestBody = generateEncoderCall({
            encoder,
            method: "encode",
            variableReference: endpointTypes.request.body.isInlined
                ? {
                      _type: "wireMessage",
                      wireMessageType: "Request",
                      serviceName: serviceDefinition.name.name,
                      endpointId: endpoint.endpointId,
                      variable: requestBodyReference,
                  }
                : {
                      _type: "modelType",
                      typeReference: endpointTypes.request.body.typeReference,
                      variable: requestBodyReference,
                  },
            referencedIn: serviceFile,
        });

        fetcherArgs.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(
                    ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.Body.PROPERTY_NAME
                ),
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(
                                ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.Body.Properties.CONTENT
                            ),
                            encodedRequestBody
                        ),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(
                                ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.Body.Properties.CONTENT_TYPE
                            ),
                            ts.factory.createStringLiteral(encoder.contentType)
                        ),
                    ],
                    true
                )
            )
        );
    }

    return {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: ClientConstants.HttpService.Endpoint.Variables.ENCODED_RESPONSE,
                initializer: getTextOfTsNode(
                    ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                ts.factory.createIdentifier(ClientConstants.HttpService.PrivateMembers.FETCHER)
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
