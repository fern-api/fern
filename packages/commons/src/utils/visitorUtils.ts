import { InterfaceDeclarationStructure, OptionalKind, ts } from "ts-morph";
import { getTextOfTsNode } from "./getTextOfTsNode";

export interface VisitableItems {
    items: VisitableItem[];
    unknownArgument: Argument | undefined;
}

export interface VisitableItem {
    caseInSwitchStatement: ts.Expression;
    keyInVisitor: string;
    visitorArgument: Argument | undefined;
}

export interface Argument {
    argument: ts.Expression;
    type: ts.TypeNode;
    name?: string;
}

export const VISITOR_RESULT_TYPE_PARAMETER = "Result";
export const VISITOR_PARAMETER_NAME = "visitor";
export const VALUE_PARAMETER_NAME = "value";
export const VISITOR_INTERFACE_NAME = "_Visitor";
export const UNKNOWN_PROPERY_NAME = "_unknown";
export const VISIT_PROPERTY_NAME = "_visit";

export function generateVisitMethod({
    typeName,
    switchOn,
    items,
}: {
    typeName: ts.EntityName | string;
    switchOn: ts.Expression;
    items: VisitableItems;
}): ts.ArrowFunction {
    return ts.factory.createArrowFunction(
        undefined,
        [
            ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                undefined,
                undefined
            ),
        ],
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(items.items.length > 0 ? VALUE_PARAMETER_NAME : `_${VALUE_PARAMETER_NAME}`),
                undefined,
                ts.factory.createTypeReferenceNode(
                    typeof typeName === "string" ? ts.factory.createIdentifier(typeName) : typeName,
                    undefined
                ),
                undefined
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                undefined,
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        typeof typeName === "string" ? ts.factory.createIdentifier(typeName) : typeName,
                        ts.factory.createIdentifier(VISITOR_INTERFACE_NAME)
                    ),
                    [
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                            undefined
                        ),
                    ]
                ),
                undefined
            ),
        ],
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER), undefined),
        undefined,
        ts.factory.createBlock([generateVisitSwitchStatement({ items, switchOn })], true)
    );
}

export function generateVisitSwitchStatement({
    items: { items, unknownArgument },
    switchOn,
}: {
    items: VisitableItems;
    switchOn: ts.Expression;
}): ts.Statement {
    const returnUnknown = ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                ts.factory.createIdentifier(UNKNOWN_PROPERY_NAME)
            ),
            undefined,
            unknownArgument != null ? [unknownArgument.argument] : undefined
        )
    );

    if (items.length === 0) {
        return returnUnknown;
    }

    return ts.factory.createSwitchStatement(
        switchOn,
        ts.factory.createCaseBlock([
            ...items.map((item) =>
                ts.factory.createCaseClause(item.caseInSwitchStatement, [
                    ts.factory.createReturnStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                                ts.factory.createIdentifier(item.keyInVisitor)
                            ),
                            undefined,
                            item.visitorArgument != null ? [item.visitorArgument.argument] : []
                        )
                    ),
                ])
            ),
            ts.factory.createDefaultClause([returnUnknown]),
        ])
    );
}

export function generateVisitMethodType(referenceToVisitor: ts.EntityName): ts.TypeNode {
    return ts.factory.createFunctionTypeNode(
        [
            ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                undefined,
                undefined
            ),
        ],
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                undefined,
                ts.factory.createTypeReferenceNode(referenceToVisitor, [
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                        undefined
                    ),
                ]),
                undefined
            ),
        ],
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER), undefined)
    );
}

export function generateVisitorInterface({
    items,
    name = VISITOR_INTERFACE_NAME,
}: {
    items: VisitableItems;
    name?: string;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name,
        isExported: true,
        typeParameters: [VISITOR_RESULT_TYPE_PARAMETER],
        properties: [
            ...items.items.map((item) => {
                return {
                    name: item.keyInVisitor,
                    type: getTextOfTsNode(
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            item.visitorArgument != null
                                ? [
                                      ts.factory.createParameterDeclaration(
                                          undefined,
                                          undefined,
                                          undefined,
                                          ts.factory.createIdentifier(
                                              item.visitorArgument.name ?? VALUE_PARAMETER_NAME
                                          ),
                                          undefined,
                                          item.visitorArgument.type,
                                          undefined
                                      ),
                                  ]
                                : [],
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                                undefined
                            )
                        )
                    ),
                };
            }),
            {
                name: UNKNOWN_PROPERY_NAME,
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        items.unknownArgument != null
                            ? [
                                  ts.factory.createParameterDeclaration(
                                      undefined,
                                      undefined,
                                      undefined,
                                      items.unknownArgument.name ?? VALUE_PARAMETER_NAME,
                                      undefined,
                                      items.unknownArgument.type
                                  ),
                              ]
                            : [],
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                            undefined
                        )
                    )
                ),
            },
        ],
    };
}
