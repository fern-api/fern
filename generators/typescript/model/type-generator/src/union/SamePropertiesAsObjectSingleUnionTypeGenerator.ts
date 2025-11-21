import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { ModuleDeclarationStructure, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace SamePropertiesAsObjectSingleUnionTypeGenerator {
    export interface Init {
        extended: DeclaredTypeName;
        enableInlineTypes: boolean;
        unionMemberName: string;
    }
}

export class SamePropertiesAsObjectSingleUnionTypeGenerator<Context extends BaseContext>
    implements SingleUnionTypeGenerator<Context>
{
    private static BUILDER_PARAMETER_NAME = "value";
    private static OUTER_TYPE_ALIAS_PREFIX = "Outer";

    private extended: DeclaredTypeName;
    private enableInlineTypes: boolean;
    private unionMemberName: string;

    constructor({ extended, enableInlineTypes, unionMemberName }: SamePropertiesAsObjectSingleUnionTypeGenerator.Init) {
        this.extended = extended;
        this.enableInlineTypes = enableInlineTypes;
        this.unionMemberName = unionMemberName;
    }

    public needsRequestResponse(context: Context): { request: boolean; response: boolean } {
        return context.type.needsRequestResponseTypeVariantById(this.extended.typeId);
    }

    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const typeDeclaration = context.type.getTypeDeclaration(this.extended);
        if (typeDeclaration.inline) {
            const type = context.type.getGeneratedType(typeDeclaration.name);
            return type.generateForInlineUnion(context);
        }
        const reference = context.type.getReferenceToType(context.type.typeNameToTypeReference(this.extended));
        return {
            typeNode: reference.typeNode,
            requestTypeNode: reference.requestTypeNode,
            responseTypeNode: reference.responseTypeNode
        };
    }

    public getExtendsForInterface(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    }[] {
        const typeDeclaration = context.type.getTypeDeclaration(this.extended);
        if (this.enableInlineTypes && typeDeclaration.inline) {
            // inline types don't inherit the properties from the interface, but have the properties directly on the parent interface
            return [];
        }

        const reference = context.type.getReferenceToType(context.type.typeNameToTypeReference(this.extended));
        const referenceText = getTextOfTsNode(reference.typeNode);
        const extendedTypeName = this.extended.name.pascalCase.safeName;

        // Check if there's a naming conflict: the union member name matches the extended type name
        // AND the reference uses the simple name (not an aliased import like "SeedExhaustive_Dog")
        // This happens with consolidateTypeFiles when both the union and extended type are in the same file
        const hasNamingConflict = this.unionMemberName === extendedTypeName && referenceText === extendedTypeName;

        if (hasNamingConflict) {
            // Use an alias to avoid circular reference (e.g., "OuterDog" instead of "Dog")
            const aliasName = `${SamePropertiesAsObjectSingleUnionTypeGenerator.OUTER_TYPE_ALIAS_PREFIX}${extendedTypeName}`;
            return [
                {
                    typeNode: ts.factory.createTypeReferenceNode(aliasName),
                    requestTypeNode: undefined,
                    responseTypeNode: undefined
                }
            ];
        }

        return [reference];
    }

    public getDiscriminantPropertiesForInterface(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
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

    public getNonDiscriminantPropertiesForInterface(): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
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

    /**
     * Returns the type alias that should be generated to avoid naming conflicts.
     * For example: `type OuterDog = Dog;`
     */
    public getTypeAliasForNamingConflict(context: Context): { name: string; type: string } | undefined {
        const originalTypeReference = context.type.getReferenceToType(
            context.type.typeNameToTypeReference(this.extended)
        );
        const referenceText = getTextOfTsNode(originalTypeReference.typeNode);
        const extendedTypeName = this.extended.name.pascalCase.safeName;

        // Only generate alias if there's a true naming conflict
        // (union member name matches extended type name AND the reference uses the simple name)
        const hasNamingConflict = this.unionMemberName === extendedTypeName && referenceText === extendedTypeName;

        if (!hasNamingConflict) {
            return undefined;
        }

        const aliasName = `${SamePropertiesAsObjectSingleUnionTypeGenerator.OUTER_TYPE_ALIAS_PREFIX}${extendedTypeName}`;

        return {
            name: aliasName,
            type: referenceText
        };
    }
}
