import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey, getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { RawSingleUnionType } from "./RawSingleUnionType.js";

export declare namespace AbstractRawSingleUnionType {
    export interface Init {
        discriminant: FernIr.NameAndWireValue;
        discriminantValue: FernIr.NameAndWireValue;
    }
}

export abstract class AbstractRawSingleUnionType<Context> implements RawSingleUnionType<Context> {
    private discriminant: FernIr.NameAndWireValue;
    private discriminantValueWithAllCasings: FernIr.NameAndWireValue;

    constructor({ discriminant, discriminantValue }: AbstractRawSingleUnionType.Init) {
        this.discriminant = discriminant;
        this.discriminantValueWithAllCasings = discriminantValue;
    }

    public get discriminantValue(): string {
        return this.discriminantValueWithAllCasings.wireValue;
    }

    public generateInterface(context: Context): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: sanitizeIdentifier(this.discriminantValueWithAllCasings.name.pascalCase.safeName),
            extends: this.getExtends(context).map(getTextOfTsNode),
            properties: [
                {
                    name: getPropertyKey(this.discriminant.wireValue),
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

const STARTS_WITH_DIGIT = /^\d/;

function sanitizeIdentifier(name: string): string {
    if (STARTS_WITH_DIGIT.test(name)) {
        return `_${name}`;
    }
    return name;
}
