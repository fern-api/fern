import { InterfaceDeclarationStructure, OptionalKind, ts } from "ts-morph";
import { getTextOfTsNode } from "./getTextOfTsNode";

export interface VisitableItem {
    caseInSwitchStatement: ts.Expression;
    keyInVisitor: string;
    visitorArgument: VisitorArgument | undefined;
}

export interface VisitorArgument {
    argument: ts.Expression;
    type: ts.TypeNode;
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
    items: readonly VisitableItem[];
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
                ts.factory.createIdentifier(items.length > 0 ? VALUE_PARAMETER_NAME : `_${VALUE_PARAMETER_NAME}`),
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
        generateVisitSwitchStatement({ items, switchOn })
    );
}

export function generateVisitSwitchStatement({
    items,
    switchOn,
}: {
    items: readonly VisitableItem[];
    switchOn: ts.Expression;
}): ts.ConciseBody {
    const returnUnknown = ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                ts.factory.createIdentifier(UNKNOWN_PROPERY_NAME)
            ),
            undefined,
            undefined
        )
    );

    return ts.factory.createBlock(
        [
            items.length > 0
                ? ts.factory.createSwitchStatement(
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
                  )
                : returnUnknown,
        ],
        true
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
    items: readonly VisitableItem[];
    name?: string;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name,
        isExported: true,
        typeParameters: [VISITOR_RESULT_TYPE_PARAMETER],
        properties: [
            ...items.map((item) => {
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
                                          ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
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
                        [],
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
