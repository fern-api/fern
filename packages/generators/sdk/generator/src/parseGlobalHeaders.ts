import { HttpHeader } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { createPropertyAssignment, ExpressionReferenceNode } from "@fern-typescript/commons-v2";
import { ParsedGlobalHeaders } from "@fern-typescript/sdk-declaration-handler/src/ParsedGlobalHeaders";
import { ts } from "ts-morph";

interface HeaderInfo {
    wireKey: string;
    propertyName: string;
    typeReference: TypeReference;
}

export function parseGlobalHeaders({
    headers,
    getReferenceToType,
    convertExpressionToString,
}: {
    headers: HttpHeader[];
    getReferenceToType: (typeReference: TypeReference) => ts.TypeNode;
    convertExpressionToString: (expression: ts.Expression, type: TypeReference) => ExpressionReferenceNode;
}): ParsedGlobalHeaders {
    const headerInfos: HeaderInfo[] = headers.map((header) => {
        return {
            wireKey: header.nameV2.wireValue,
            propertyName: header.nameV2.name.safeName.camelCase,
            typeReference: header.valueType,
        };
    });
    return {
        getProperties: () =>
            headerInfos.map((headerInfo) => {
                return {
                    name: headerInfo.propertyName,
                    type: getTextOfTsNode(getReferenceToType(headerInfo.typeReference)),
                };
            }),
        getHeaders: (nodeWithGlobalHeaderProperties) => {
            return headerInfos.map((headerInfo) => {
                return createPropertyAssignment(
                    ts.factory.createStringLiteral(headerInfo.wireKey),
                    convertExpressionToString(
                        ts.factory.createPropertyAccessChain(
                            nodeWithGlobalHeaderProperties,
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            headerInfo.propertyName
                        ),
                        headerInfo.typeReference
                    ).expression
                );
            });
        },
    };
}
