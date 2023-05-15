import { HttpEndpoint, HttpHeader, HttpService } from "@fern-fern/ir-model/http";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedHeader } from "../../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { RequestParameter } from "../../request-parameter/RequestParameter";
import { getLiteralValueForHeader } from "./isLiteralHeader";

export function generateHeaders({
    context,
    generatedSdkClientClass,
    requestParameter,
    service,
    endpoint,
    additionalHeaders = [],
}: {
    context: SdkClientClassContext;
    generatedSdkClientClass: GeneratedSdkClientClassImpl;
    requestParameter: RequestParameter | undefined;
    service: HttpService;
    endpoint: HttpEndpoint;
    additionalHeaders?: GeneratedHeader[];
}): ts.ObjectLiteralElementLike[] {
    const elements: GeneratedHeader[] = [];

    const authorizationHeaderValue = generatedSdkClientClass.getAuthorizationHeaderValue();
    if (authorizationHeaderValue != null) {
        elements.push({
            header: "Authorization",
            value: authorizationHeaderValue,
        });
    }

    elements.push(...generatedSdkClientClass.getHeaders(context));

    for (const header of [...service.headers, ...endpoint.headers]) {
        elements.push({
            header: header.name.wireValue,
            value: getValueExpressionForHeader({ header, context, requestParameter }),
        });
    }

    elements.push(...additionalHeaders);

    return elements.map(({ header, value }) =>
        ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
    );
}

function getValueExpressionForHeader({
    header,
    context,
    requestParameter,
}: {
    header: HttpHeader;
    context: SdkClientClassContext;
    requestParameter: RequestParameter | undefined;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue);
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
