import { SingleUnionType, UnionTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { UnionModule } from "../UnionModule";
import { UnionVisitHelper } from "../UnionVisitHelper";

export interface ParsedSingleUnionType {
    getDocs(): string | null | undefined;
    getDiscriminantValue(): string;
    getInterfaceName(): string;
    getRawInterfaceDeclaration(file: SdkFile): AbstractParsedSingleUnionType.InterfaceDeclaration;
    getInterfaceDeclaration(file: SdkFile): AbstractParsedSingleUnionType.InterfaceDeclaration;
    getSchema(file: SdkFile): Zurg.union.SingleUnionType;
    getBuilder(file: SdkFile, unionModule: UnionModule): ts.ArrowFunction;
    getBuilderName(): string;
    getVisitMethod(args: { referenceToUnionValue: ts.Expression }): ts.ArrowFunction;
    getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode;
    getVisitorKey(): string;
}

export declare namespace AbstractParsedSingleUnionType {
    export interface Init {
        singleUnionType: SingleUnionType;
        union: UnionTypeDeclaration;
    }

    export interface InterfaceDeclaration {
        name: string;
        extends: ts.TypeNode[];
        jsonProperties: OptionalKind<PropertySignatureStructure>[];
    }
}

export abstract class AbstractParsedSingleUnionType implements ParsedSingleUnionType {
    protected singleUnionType: SingleUnionType;
    protected union: UnionTypeDeclaration;

    constructor(init: AbstractParsedSingleUnionType.Init) {
        this.singleUnionType = init.singleUnionType;
        this.union = init.union;
    }

    public getDocs(): string | null | undefined {
        return this.singleUnionType.docs;
    }

    public getInterfaceName(): string {
        return this.singleUnionType.discriminantValue.pascalCase;
    }

    public getInterfaceDeclaration(file: SdkFile): AbstractParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.getDiscriminantValue())
            ),
            nonDiscriminantProperties: this.getNonDiscriminantPropertiesForInterface(file, { isRaw: false }),
            extends: this.getExtendsForInterface(file, { isRaw: false }),
            union: this.union,
            isRaw: false,
        });
    }

    public getRawInterfaceDeclaration(file: SdkFile): AbstractParsedSingleUnionType.InterfaceDeclaration {
        return AbstractParsedSingleUnionType.createDiscriminatedInterface({
            typeName: this.getInterfaceName(),
            discriminantValue: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(this.singleUnionType.discriminantValue.wireValue)
            ),
            nonDiscriminantProperties: this.getNonDiscriminantPropertiesForInterface(file, { isRaw: true }),
            extends: this.getExtendsForInterface(file, { isRaw: true }),
            union: this.union,
            isRaw: true,
        });
    }

    protected abstract getExtendsForInterface(file: SdkFile, opts: { isRaw: boolean }): ts.TypeNode[];

    protected abstract getNonDiscriminantPropertiesForInterface(
        file: SdkFile,
        opts: { isRaw: boolean }
    ): OptionalKind<PropertySignatureStructure>[];

    public static createDiscriminatedInterface({
        typeName,
        discriminantValue,
        nonDiscriminantProperties = [],
        extends: extends_ = [],
        union,
        isRaw,
    }: {
        typeName: string;
        discriminantValue: ts.TypeNode;
        nonDiscriminantProperties?: OptionalKind<PropertySignatureStructure>[];
        extends?: ts.TypeNode[];
        union: UnionTypeDeclaration;
        isRaw: boolean;
    }): AbstractParsedSingleUnionType.InterfaceDeclaration {
        return {
            name: typeName,
            extends: extends_,
            jsonProperties: [
                {
                    name: isRaw
                        ? union.discriminantV2.wireValue
                        : AbstractParsedSingleUnionType.getDiscriminantKey(union),
                    type: getTextOfTsNode(discriminantValue),
                },
                ...nonDiscriminantProperties,
            ],
        };
    }

    public static getDiscriminantKey(union: UnionTypeDeclaration): string {
        return union.discriminantV2.camelCase;
    }

    public getDiscriminantValue(): string {
        return this.singleUnionType.discriminantValue.wireValue;
    }

    public getBuilder(file: SdkFile, unionModule: UnionModule): ts.ArrowFunction {
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            this.getParametersForBuilder(file),
            unionModule.getReferenceToSingleUnionType(this),
            undefined,
            ts.factory.createParenthesizedExpression(
                ts.factory.createObjectLiteralExpression(
                    [
                        ...this.getNonDiscriminantPropertiesForBuilder(file),
                        ts.factory.createPropertyAssignment(
                            AbstractParsedSingleUnionType.getDiscriminantKey(this.union),
                            ts.factory.createStringLiteral(this.getDiscriminantValue())
                        ),
                        ts.factory.createPropertyAssignment(
                            UnionModule.VISIT_UTIL_PROPERTY_NAME,
                            this.getVisitorCallForBuilder()
                        ),
                    ],
                    true
                )
            )
        );
    }

    public getBuilderName(): string {
        return this.singleUnionType.discriminantValue.pascalCase;
    }

    protected abstract getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[];

    protected abstract getNonDiscriminantPropertiesForBuilder(file: SdkFile): ts.ObjectLiteralElementLike[];

    protected abstract getVisitorCallForBuilder(): ts.ArrowFunction;

    public abstract getVisitMethod({
        referenceToUnionValue,
    }: {
        referenceToUnionValue: ts.Expression;
    }): ts.ArrowFunction;

    public getVisitMethodSignature(file: SdkFile): ts.FunctionTypeNode {
        return UnionVisitHelper.getVisitorPropertySignature({
            parameterType: this.getVisitMethodParameterType(file),
        });
    }

    protected abstract getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined;

    public getVisitorKey(): string {
        return this.singleUnionType.discriminantValue.camelCase;
    }

    public getSchema(file: SdkFile): Zurg.union.SingleUnionType {
        return {
            discriminantValue: this.getDiscriminantValue(),
            nonDiscriminantProperties: this.getNonDiscriminantPropertiesForSchema(file),
        };
    }

    protected abstract getNonDiscriminantPropertiesForSchema(
        file: SdkFile
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"];
}
