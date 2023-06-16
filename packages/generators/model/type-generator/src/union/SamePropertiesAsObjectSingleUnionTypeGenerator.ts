import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { ModelContext } from "@fern-typescript/contexts";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace SamePropertiesAsObjectSingleUnionTypeGenerator {
    export interface Init {
        extended: DeclaredTypeName;
    }
}

export class SamePropertiesAsObjectSingleUnionTypeGenerator<Context extends ModelContext>
    implements SingleUnionTypeGenerator<Context>
{
    private static BUILDER_PARAMETER_NAME = "value";

    private extended: DeclaredTypeName;

    constructor({ extended }: SamePropertiesAsObjectSingleUnionTypeGenerator.Init) {
        this.extended = extended;
    }

    public getExtendsForInterface(context: Context): ts.TypeNode[] {
        return [context.type.getReferenceToNamedType(this.extended).getTypeNode()];
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
                SamePropertiesAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                context.type.getReferenceToNamedType(this.extended).getTypeNode()
            ),
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier(SamePropertiesAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitMethodParameterType(context: Context): ts.TypeNode | undefined {
        return context.type.getReferenceToNamedType(this.extended).getTypeNode();
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
