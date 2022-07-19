import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager, getTextOfTsNode, invokeSupplier } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { GeneratedHttpEndpointTypes } from "@fern-typescript/model-context";
import { SourceFile, StatementStructures, StructureKind, ts, VariableDeclarationKind } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateJoinUrlPathsCall } from "../../../utils/generateJoinPathsCall";
import { doesServiceHaveHeaders } from "../../utils";
import { convertPathToTemplateString } from "./convertPathToTemplateString";
import { generateEncoderCall } from "./generateEncoderCall";

export async function generateFetcherCall({
    serviceFile,
    serviceDefinition,
    endpoint,
    endpointTypes,
    includeQueryParams,
    helperManager,
    dependencyManager,
    referenceToAuthHeader,
}: {
    serviceFile: SourceFile;
    serviceDefinition: HttpService;
    endpoint: HttpEndpoint;
    endpointTypes: GeneratedHttpEndpointTypes;
    includeQueryParams: boolean;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
    referenceToAuthHeader: ts.Expression | undefined;
}): Promise<StatementStructures> {
    const fetcherArgs: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.URL),
            generateJoinUrlPathsCall({
                file: serviceFile,
                dependencyManager,
                paths: [
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier(ClientConstants.HttpService.PrivateMembers.BASE_URL)
                    ),
                    convertPathToTemplateString(endpoint.path),
                ],
            })
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.METHOD),
            ts.factory.createStringLiteral(endpoint.method)
        ),
        getHeadersPropertyAssignment({
            service: serviceDefinition,
            endpoint,
            serviceFile,
            dependencyManager,
        }),
    ];

    if (includeQueryParams) {
        fetcherArgs.push(
            // keep this check around in case the constants change
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    if (endpointTypes.request.body != null) {
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

    if (referenceToAuthHeader != null) {
        fetcherArgs.push(
            ts.factory.createPropertyAssignment(
                ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.AUTH_HEADER,
                referenceToAuthHeader
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

function getHeadersPropertyAssignment({
    service,
    endpoint,
    serviceFile,
    dependencyManager,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    serviceFile: SourceFile;
    dependencyManager: DependencyManager;
}): ts.ObjectLiteralElementLike {
    return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(ClientConstants.HttpService.ServiceUtils.Fetcher.Parameters.HEADERS),
        getHeadersPropertyValue({ service, endpoint, serviceFile, dependencyManager })
    );
}

function getHeadersPropertyValue({
    service,
    endpoint,
    serviceFile,
    dependencyManager,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    serviceFile: SourceFile;
    dependencyManager: DependencyManager;
}): ts.Expression {
    if (!doesServiceHaveHeaders(service) && endpoint.headers.length === 0) {
        return ts.factory.createObjectLiteralExpression([]);
    }

    const properties: ts.ObjectLiteralElementLike[] = [];

    for (const header of service.headers) {
        const referenceToHeader = ts.factory.createElementAccessExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier(ClientConstants.HttpService.PrivateMembers.HEADERS)
            ),
            ts.factory.createStringLiteral(header.header)
        );

        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createStringLiteral(header.header),
                invokeSupplier({ supplier: referenceToHeader, dependencyManager, referencedIn: serviceFile })
            )
        );
    }

    for (const header of endpoint.headers) {
        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createStringLiteral(header.header),
                ts.factory.createElementAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                    ts.factory.createStringLiteral(header.header)
                )
            )
        );
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
}
