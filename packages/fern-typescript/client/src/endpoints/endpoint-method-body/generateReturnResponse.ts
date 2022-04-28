import { ts } from "ts-morph";
import {
    ERROR_BODY_PROPERTY_NAME,
    ERROR_BODY_TYPE_NAME,
    RESPONSE_BODY_PROPERTY_NAME,
    RESPONSE_OK_PROPERTY_NAME,
    RESPONSE_STATUS_CODE_PROPERTY_NAME,
} from "../generate-endpoint-types/response/constants";
import { GeneratedEndpointTypes } from "../generate-endpoint-types/types";
import {
    FETCHER_RESPONSE_BODY_PROPERTY_NAME,
    FETCHER_RESPONSE_STATUS_CODE_PROPERTY_NAME,
    RESPONSE_VARIABLE_NAME,
} from "./constants";

export function generateReturnResponse({
    endpointTypes,
    getReferenceToEndpointType,
}: {
    endpointTypes: GeneratedEndpointTypes;
    getReferenceToEndpointType: (identifier: ts.Identifier) => ts.TypeReferenceNode;
}): ts.Statement {
    return ts.factory.createIfStatement(
        isStatusCodeOk(),
        ts.factory.createBlock([generateReturnSuccessResponse({ endpointTypes, getReferenceToEndpointType })]),
        ts.factory.createBlock([generateReturnErrorResponse({ getReferenceToEndpointType })])
    );
}

function isStatusCodeOk() {
    return ts.factory.createBinaryExpression(
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier(FETCHER_RESPONSE_STATUS_CODE_PROPERTY_NAME)
            ),
            ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
            ts.factory.createNumericLiteral("200")
        ),
        ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier(FETCHER_RESPONSE_STATUS_CODE_PROPERTY_NAME)
            ),
            ts.factory.createToken(ts.SyntaxKind.LessThanToken),
            ts.factory.createNumericLiteral("300")
        )
    );
}

function generateReturnSuccessResponse({
    endpointTypes,
    getReferenceToEndpointType,
}: {
    endpointTypes: GeneratedEndpointTypes;
    getReferenceToEndpointType: (identifier: ts.Identifier) => ts.TypeReferenceNode;
}) {
    const properties: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(RESPONSE_OK_PROPERTY_NAME),
            ts.factory.createTrue()
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(RESPONSE_STATUS_CODE_PROPERTY_NAME),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier(FETCHER_RESPONSE_STATUS_CODE_PROPERTY_NAME)
            )
        ),
    ];

    if (endpointTypes.responseBody != null) {
        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(RESPONSE_BODY_PROPERTY_NAME),
                ts.factory.createAsExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                        ts.factory.createIdentifier(FETCHER_RESPONSE_BODY_PROPERTY_NAME)
                    ),
                    getReferenceToEndpointType(endpointTypes.responseBody.identifier)
                )
            )
        );
    }

    return ts.factory.createReturnStatement(ts.factory.createObjectLiteralExpression(properties, true));
}

function generateReturnErrorResponse({
    getReferenceToEndpointType,
}: {
    getReferenceToEndpointType: (identifier: ts.Identifier) => ts.TypeReferenceNode;
}) {
    return ts.factory.createReturnStatement(
        ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(RESPONSE_OK_PROPERTY_NAME),
                    ts.factory.createFalse()
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(RESPONSE_STATUS_CODE_PROPERTY_NAME),
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                        ts.factory.createIdentifier(FETCHER_RESPONSE_STATUS_CODE_PROPERTY_NAME)
                    )
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(ERROR_BODY_PROPERTY_NAME),
                    ts.factory.createAsExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(RESPONSE_VARIABLE_NAME),
                            ts.factory.createIdentifier(FETCHER_RESPONSE_BODY_PROPERTY_NAME)
                        ),
                        getReferenceToEndpointType(ts.factory.createIdentifier(ERROR_BODY_TYPE_NAME))
                    )
                ),
            ],
            true
        )
    );
}
