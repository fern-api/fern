import { getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { ModuleDeclarationStructure, PropertySignatureStructure, StructureKind, ts } from "ts-morph";

export declare namespace UnknownErrorSingleUnionTypeGenerator {
    export interface Init {
        discriminant: string;
    }
}

export class UnknownErrorSingleUnionTypeGenerator implements SingleUnionTypeGenerator<SdkContext> {
    private static readonly CONTENT_PROPERTY_NAME = "content";
    private static readonly BUILDER_PARAMETER_NAME = "fetcherError";

    private discriminant: string;

    constructor({ discriminant }: UnknownErrorSingleUnionTypeGenerator.Init) {
        this.discriminant = discriminant;
    }

    public generateForInlineUnion(context: SdkContext): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        return {
            typeNode: ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME,
                    undefined,
                    context.coreUtilities.fetcher.Fetcher.Error._getReferenceToType()
                )
            ]),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        };
    }

    public getExtendsForInterface(): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    }[] {
        return [];
    }

    public getDiscriminantPropertiesForInterface(): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        return [];
    }

    public generateModule(): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    public getNonDiscriminantPropertiesForInterface(context: SdkContext): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        return [
            {
                property: {
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME),
                    type: getTextOfTsNode(context.coreUtilities.fetcher.Fetcher.Error._getReferenceToType())
                },
                requestProperty: undefined,
                responseProperty: undefined,
                isReadonly: false,
                isWriteonly: false
            }
        ];
    }

    public getVisitorArguments({
        localReferenceToUnionValue
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [
            ts.factory.createPropertyAccessExpression(
                localReferenceToUnionValue,
                UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME
            )
        ];
    }

    public getVisitMethodParameterType(context: SdkContext): ts.TypeNode | undefined {
        return context.coreUtilities.fetcher.Fetcher.Error._getReferenceToType();
    }

    public getParametersForBuilder(context: SdkContext): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                UnknownErrorSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                context.coreUtilities.fetcher.Fetcher.Error._getReferenceToType()
            )
        ];
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [existingValue];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(this.discriminant),
                ts.factory.createIdentifier("undefined")
            ),
            ts.factory.createPropertyAssignment(
                UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME,
                ts.factory.createIdentifier(UnknownErrorSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            )
        ];
    }
    public needsRequestResponse(): { request: boolean; response: boolean } {
        return {
            request: false,
            response: false
        };
    }
}
