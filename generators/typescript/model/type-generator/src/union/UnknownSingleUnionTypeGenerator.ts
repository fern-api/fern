import { getPropertyKey } from '@fern-typescript/commons'
import { BaseContext } from '@fern-typescript/contexts'
import { SingleUnionTypeGenerator } from '@fern-typescript/union-generator'
import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from 'ts-morph'

export class UnknownSingleUnionTypeGenerator implements SingleUnionTypeGenerator<BaseContext> {
    private static BUILDER_PARAMETER_NAME = 'value'

    public generateForInlineUnion(context: BaseContext): ts.TypeNode {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return []
    }

    public getDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return []
    }

    public generateModule(context: BaseContext): ModuleDeclarationStructure | undefined {
        return undefined
    }

    public getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return []
    }

    public getVisitorArguments({
        localReferenceToUnionValue
    }: {
        localReferenceToUnionValue: ts.Expression
    }): ts.Expression[] {
        return [localReferenceToUnionValue]
    }

    public getVisitMethodParameterType(
        _context: BaseContext,
        { discriminant }: { discriminant: string }
    ): ts.TypeNode | undefined {
        return ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier(getPropertyKey(discriminant)),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            )
        ])
    }

    public getParametersForBuilder(
        _context: BaseContext,
        { discriminant }: { discriminant: string }
    ): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                UnknownSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                ts.factory.createTypeLiteralNode([
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier(getPropertyKey(discriminant)),
                        undefined,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                    )
                ])
            )
        ]
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [existingValue]
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createParenthesizedExpression(
                    ts.factory.createAsExpression(
                        ts.factory.createIdentifier(UnknownSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    )
                )
            )
        ]
    }
}
