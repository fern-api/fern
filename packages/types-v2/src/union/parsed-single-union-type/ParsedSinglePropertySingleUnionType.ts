import { SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionVisitHelper } from "../UnionVisitHelper";
import { AbstractParsedSingleUnionType } from "./AbstractParsedSingleUnionType";

export class ParsedSinglePropertySingleUnionType extends AbstractParsedSingleUnionType {
    private singleProperty: SingleUnionTypeProperty;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({
        singleProperty,
        ...superInit
    }: { singleProperty: SingleUnionTypeProperty } & AbstractParsedSingleUnionType.Init) {
        super(superInit);
        this.singleProperty = singleProperty;
    }

    protected getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(
        file: SdkFile,
        { isRaw }: { isRaw: boolean }
    ): OptionalKind<PropertySignatureStructure>[] {
        const type = isRaw
            ? file.getReferenceToRawType(this.singleProperty.type)
            : file.getReferenceToType(this.singleProperty.type);
        return [
            {
                // TODO change the "raw" case to singleProperty.name when we're ready to break the wire
                name: isRaw ? this.singleUnionType.discriminantValue.wireValue : this.getSinglePropertyKey(),
                type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                hasQuestionToken: type.isOptional,
            },
        ];
    }

    protected getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        const type = file.getReferenceToType(this.singleProperty.type);
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ParsedSinglePropertySingleUnionType.BUILDER_PARAMETER_NAME,
                type.isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode
            ),
        ];
    }

    protected getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                this.getSinglePropertyKey(),
                ts.factory.createIdentifier(ParsedSinglePropertySingleUnionType.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    protected getVisitorCallForBuilder(): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: [ts.factory.createIdentifier(ParsedSinglePropertySingleUnionType.BUILDER_PARAMETER_NAME)],
        });
    }

    protected getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined {
        return file.getReferenceToType(this.singleProperty.type).typeNode;
    }

    public getVisitMethod({ referenceToUnionValue }: { referenceToUnionValue: ts.Expression }): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: [
                ts.factory.createPropertyAccessExpression(referenceToUnionValue, this.getSinglePropertyKey()),
            ],
        });
    }

    protected getNonDiscriminantPropertiesForSchema(
        file: SdkFile
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: true,
            properties: [
                {
                    key: {
                        parsed: this.getSinglePropertyKey(),
                        // TODO change this to singleProperty.name when we're ready to break the wire
                        raw: this.getDiscriminantValue(),
                    },
                    value: file.getSchemaOfTypeReference(this.singleProperty.type),
                },
            ],
        };
    }

    private getSinglePropertyKey(): string {
        return this.singleProperty.name.camelCase;
    }
}
