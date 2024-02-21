import { HttpEndpoint, HttpHeader, HttpService } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedHeader } from "../../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { RequestParameter } from "../../request-parameter/RequestParameter";
import { getLiteralValueForHeader } from "./isLiteralHeader";
import { REQUEST_OPTIONS_PARAMETER_NAME } from "./requestOptionsParameter";

export function generateHeaders({
    context,
    generatedSdkClientClass,
    requestParameter,
    service,
    endpoint,
    idempotencyHeaders,
    additionalHeaders = []
}: {
    context: SdkContext;
    generatedSdkClientClass: GeneratedSdkClientClassImpl;
    requestParameter: RequestParameter | undefined;
    service: HttpService;
    endpoint: HttpEndpoint;
    idempotencyHeaders: HttpHeader[];
    additionalHeaders?: GeneratedHeader[];
}): ts.ObjectLiteralElementLike[] {
    const elements: GeneratedHeader[] = [];

    const authorizationHeaderValue = generatedSdkClientClass.getAuthorizationHeaderValue();
    if (authorizationHeaderValue != null) {
        elements.push({
            header: "Authorization",
            value: authorizationHeaderValue
        });
    }

    elements.push(...generatedSdkClientClass.getHeaders(context));

    for (const header of [...service.headers, ...endpoint.headers]) {
        elements.push({
            header: header.name.wireValue,
            value: getValueExpressionForHeader({ header, context, requestParameter })
        });
    }

    if (endpoint.idempotent) {
        for (const header of idempotencyHeaders) {
            elements.push({
                header: header.name.wireValue,
                value: getValueExpressionForIdempotencyHeader({ header, context })
            });
        }
    }

    elements.push(...additionalHeaders);

    return elements.map(({ header, value }) =>
        ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
    );
}

function getValueExpressionForHeader({
    header,
    context,
    requestParameter
}: {
    header: HttpHeader;
    context: SdkContext;
    requestParameter: RequestParameter | undefined;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue.toString());
    } else if (requestParameter == null) {
        throw new Error(`Cannot reference header ${header.name.wireValue} because request parameter is not defined.`);
    } else {
        return context.type.stringify(
            requestParameter.getReferenceToNonLiteralHeader(header, context),
            header.valueType,
            { includeNullCheckIfOptional: true }
        );
    }
}

function getValueExpressionForIdempotencyHeader({
    header,
    context
}: {
    header: HttpHeader;
    context: SdkContext;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue.toString());
    } else {
        return context.type.stringify(
            ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(header.name.name.camelCase.unsafeName)
            ),
            header.valueType,
            { includeNullCheckIfOptional: true }
        );
    }
}
