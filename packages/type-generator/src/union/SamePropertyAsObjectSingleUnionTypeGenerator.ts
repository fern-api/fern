import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class SamePropertyAsObjectSingleUnionTypeGenerator<Context extends TypeContext = TypeContext>
    implements SingleUnionTypeGenerator<Context>
{
    private extended: DeclaredTypeName;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ extended }: { extended: DeclaredTypeName }) {
        this.extended = extended;
    }

    public getExtendsForInterface(context: Context): ts.TypeNode[] {
        return [context.getReferenceToNamedType(this.extended).getTypeNode()];
    }

    public getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    public getParametersForBuilder(context: Context): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                context.getReferenceToNamedType(this.extended).getTypeNode()
            ),
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier(SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitMethodParameterType(context: Context): ts.TypeNode | undefined {
        return context.getReferenceToNamedType(this.extended).getTypeNode();
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [localReferenceToUnionValue];
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [existingValue];
    }
}
