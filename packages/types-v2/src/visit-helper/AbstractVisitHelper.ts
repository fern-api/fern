import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export abstract class AbstractVisitHelper {
    public static readonly VISITOR_PARAMETER_NAME = "visitor";
    public static readonly VISITOR_INTERFACE_NAME = "_Visitor";
    public static readonly VISITOR_RETURN_TYPE = "_Result";
    public static readonly UNKNOWN_VISITOR_KEY = "_other";
    public static readonly VISITOR_INVOCATION_PARAMETER_NAME = "value";

    public static getSignature({
        getReferenceToVisitor,
        file,
    }: {
        getReferenceToVisitor: (file: SdkFile) => ts.EntityName;
        file: SdkFile;
    }): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            [
                ts.factory.createTypeParameterDeclaration(
                    undefined,
                    ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE),
                    undefined,
                    undefined
                ),
            ],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_PARAMETER_NAME),
                    undefined,
                    ts.factory.createTypeReferenceNode(getReferenceToVisitor(file), [
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE)
                        ),
                    ])
                ),
            ],
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE),
                undefined
            )
        );
    }

    public getVisitorInterface(file: SdkFile): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: AbstractVisitHelper.VISITOR_INTERFACE_NAME,
            typeParameters: [
                {
                    name: AbstractVisitHelper.VISITOR_RETURN_TYPE,
                },
            ],
            properties: [
                ...this.getProperties(file),
                {
                    name: AbstractVisitHelper.UNKNOWN_VISITOR_KEY,
                    type: getTextOfTsNode(
                        AbstractVisitHelper.getVisitorPropertySignature({
                            parameterType: this.getUnknownParameterType(file),
                        })
                    ),
                },
            ],
        };
    }

    protected abstract getProperties(file: SdkFile): OptionalKind<PropertySignatureStructure>[];

    protected abstract getUnknownParameterType(file: SdkFile): ts.TypeNode;

    public static getVisitMethod({
        visitorKey,
        visitorArguments,
    }: {
        visitorKey: string;
        visitorArguments: ts.Expression[];
    }): ts.ArrowFunction {
        return ts.factory.createArrowFunction(
            undefined,
            [],
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    AbstractVisitHelper.VISITOR_PARAMETER_NAME
                ),
            ],
            undefined,
            undefined,
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_PARAMETER_NAME),
                    ts.factory.createIdentifier(visitorKey)
                ),
                undefined,
                visitorArguments
            )
        );
    }

    public static getVisitorPropertySignature({
        parameterType,
    }: {
        parameterType: ts.TypeNode | undefined;
    }): ts.FunctionTypeNode {
        return ts.factory.createFunctionTypeNode(
            undefined,
            parameterType != null
                ? [
                      ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          AbstractVisitHelper.VISITOR_INVOCATION_PARAMETER_NAME,
                          undefined,
                          parameterType
                      ),
                  ]
                : [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(AbstractVisitHelper.VISITOR_RETURN_TYPE))
        );
    }
}
