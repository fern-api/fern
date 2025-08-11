import { BaseContext } from "@fern-typescript/contexts";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";

export declare namespace SamePropertiesAsObjectSingleUnionTypeGenerator {
    export interface Init {
        extended: DeclaredTypeName;
        enableInlineTypes: boolean;
    }
}

export class SamePropertiesAsObjectSingleUnionTypeGenerator<Context extends BaseContext>
    implements SingleUnionTypeGenerator<Context>
{
    private static BUILDER_PARAMETER_NAME = "value";

    private extended: DeclaredTypeName;
    private enableInlineTypes: boolean;

    constructor({ extended, enableInlineTypes }: SamePropertiesAsObjectSingleUnionTypeGenerator.Init) {
        this.extended = extended;
        this.enableInlineTypes = enableInlineTypes;
    }

    public generateForInlineUnion(context: Context): ts.TypeNode {
        const typeDeclaration = context.type.getTypeDeclaration(this.extended);
        if (typeDeclaration.inline) {
            const type = context.type.getGeneratedType(typeDeclaration.name);
            return type.generateForInlineUnion(context);
        }
        return context.type.getReferenceToNamedType(this.extended).getTypeNode();
    }

    public getExtendsForInterface(context: Context): ts.TypeNode[] {
        const typeDeclaration = context.type.getTypeDeclaration(this.extended);
        if (this.enableInlineTypes && typeDeclaration.inline) {
            // inline types don't inherit the properties from the interface, but have the properties directly on the parent interface
            return [];
        }
        return [context.type.getReferenceToNamedType(this.extended).getTypeNode()];
    }

    public getDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[] {
        const typeDeclaration = context.type.getTypeDeclaration(this.extended);
        if (this.enableInlineTypes && typeDeclaration.inline) {
            const type = context.type.getGeneratedType(typeDeclaration.name);
            if (type.type === "object") {
                return type.generateProperties(context);
            }
        }
        return [];
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        if (!this.enableInlineTypes) {
            return undefined;
        }
        const typeDeclaration = context.type.getTypeDeclaration(this.extended);
        if (!typeDeclaration.inline) {
            return undefined;
        }
        const type = context.type.getGeneratedType(typeDeclaration.name);
        return type.generateModule(context);
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
            )
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier(SamePropertiesAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            )
        ];
    }

    public getVisitMethodParameterType(context: Context): ts.TypeNode | undefined {
        return context.type.getReferenceToNamedType(this.extended).getTypeNode();
    }

    public getVisitorArguments({
        localReferenceToUnionValue
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [localReferenceToUnionValue];
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [existingValue];
    }
}
