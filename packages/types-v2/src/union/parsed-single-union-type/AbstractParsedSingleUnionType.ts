import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "../single-union-type-generator/SingleUnionTypeGenerator";
import { UnionModule } from "../UnionModule";
import { UnionVisitHelper } from "../UnionVisitHelper";
import { ParsedSingleUnionType } from "./ParsedSingleUnionType";

export abstract class AbstractParsedSingleUnionType implements ParsedSingleUnionType {
    constructor(private readonly singleUnionType: SingleUnionTypeGenerator) {}

    public getInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForInterface(file, {
                isRaw: false,
            }),
            extends: this.singleUnionType.getExtendsForInterface(file, { isRaw: false }),
            discriminant: this.getDiscriminant(),
            isRaw: false,
        });
    }

    public getRawInterfaceDeclaration(file: SdkFile): ParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForInterface(file, {
                isRaw: true,
            }),
            extends: this.singleUnionType.getExtendsForInterface(file, { isRaw: true }),
            discriminant: this.getDiscriminant(),
            isRaw: true,
        });
    }

    public static createDiscriminatedInterface({
        typeName,
        discriminant,
        discriminantValue,
        nonDiscriminantProperties = [],
        extends: extends_ = [],
        isRaw,
    }: {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        discriminantValue: ts.TypeNode;
        nonDiscriminantProperties?: OptionalKind<PropertySignatureStructure>[];
        extends?: ts.TypeNode[];
        isRaw: boolean;
    }): ParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: typeName,
            extends: extends_,
            jsonProperties: [
                {
                    name: isRaw
                        ? discriminant.wireValue
                        : AbstractParsedSingleUnionType.getDiscriminantKey(discriminant),
                    type: getTextOfTsNode(discriminantValue),
                },
                ...nonDiscriminantProperties,
            ],
        };
    }

    public getBuilder(
        file: SdkFile,
        { referenceToBuiltType }: { referenceToBuiltType: ts.TypeNode }
    ): ts.ArrowFunction {
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.singleUnionType.getParametersForBuilder(file),
            referenceToBuiltType,
            undefined,
            ts.factory.createParenthesizedExpression(
                ts.factory.createObjectLiteralExpression(
                    [
                        ...this.singleUnionType.getNonDiscriminantPropertiesForBuilder(file),
                        ts.factory.createPropertyAssignment(
                            this.getDiscriminantKey(),
                            ts.factory.createStringLiteral(this.getDiscriminantValue())
                        ),
                        ts.factory.createPropertyAssignment(
                            UnionModule.VISIT_UTIL_PROPERTY_NAME,
                            UnionVisitHelper.getVisitMethod({
                                visitorKey: this.getVisitorKey(),
                                visitorArguments: this.singleUnionType.getVisitorArgumentsForBuilder(),
                            })
                        ),
                    ],
                    true
                )
            )
        );
    }

    private getDiscriminantKey(): string {
        return AbstractParsedSingleUnionType.getDiscriminantKey(this.getDiscriminant());
    }

    public static getDiscriminantKey(discriminant: WireStringWithAllCasings): string {
        return discriminant.camelCase;
    }

    public getSchema(file: SdkFile): Zurg.union.SingleUnionType {
        return {
            discriminantValue: this.getDiscriminantValue(),
            nonDiscriminantProperties: this.singleUnionType.getNonDiscriminantPropertiesForSchema(file),
        };
    }

    public getVisitMethod({ referenceToUnionValue }: { referenceToUnionValue: ts.Expression }): ts.ArrowFunction {
        return UnionVisitHelper.getVisitMethod({
            visitorKey: this.getVisitorKey(),
            visitorArguments: this.singleUnionType.getVisitorArguments({ referenceToUnionValue }),
        });
    }

    public getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode {
        return UnionVisitHelper.getVisitorPropertySignature({
            parameterType: this.singleUnionType.getVisitMethodParameterType(file),
        });
    }

    public abstract getDocs(): string | null | undefined;
    public abstract getDiscriminantValue(): string;
    public abstract getInterfaceName(): string;
    public abstract getBuilderName(): string;
    public abstract getVisitorKey(): string;
    protected abstract getDiscriminant(): WireStringWithAllCasings;
}
