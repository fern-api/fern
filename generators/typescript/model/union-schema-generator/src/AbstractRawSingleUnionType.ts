import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { NameAndWireValue } from "@fern-fern/ir-sdk/api";

import { RawSingleUnionType } from "./RawSingleUnionType";

export declare namespace AbstractRawSingleUnionType {
    export interface Init {
        discriminant: NameAndWireValue;
        discriminantValue: NameAndWireValue;
    }
}

export abstract class AbstractRawSingleUnionType<Context> implements RawSingleUnionType<Context> {
    private disciminant: NameAndWireValue;
    private discriminantValueWithAllCasings: NameAndWireValue;

    constructor({ discriminant, discriminantValue }: AbstractRawSingleUnionType.Init) {
        this.disciminant = discriminant;
        this.discriminantValueWithAllCasings = discriminantValue;
    }

    public get discriminantValue(): string {
        return this.discriminantValueWithAllCasings.wireValue;
    }

    public generateInterface(context: Context): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: this.discriminantValueWithAllCasings.name.pascalCase.unsafeName,
            extends: this.getExtends(context).map(getTextOfTsNode),
            properties: [
                {
                    name: `"${this.disciminant.wireValue}"`,
                    type: `"${this.discriminantValue}"`
                },
                ...this.getNonDiscriminantPropertiesForInterface(context)
            ],
            isExported: true
        };
    }

    public getSchema(context: Context): Zurg.union.SingleUnionType {
        return {
            discriminantValue: this.discriminantValue,
            nonDiscriminantProperties: this.getNonDiscriminantPropertiesForSchema(context)
        };
    }

    protected abstract getExtends(context: Context): ts.TypeNode[];

    protected abstract getNonDiscriminantPropertiesForInterface(
        context: Context
    ): OptionalKind<PropertySignatureStructure>[];

    protected abstract getNonDiscriminantPropertiesForSchema(
        context: Context
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"];
}
