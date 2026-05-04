import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey, getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { RawSingleUnionType } from "./RawSingleUnionType.js";

export declare namespace AbstractRawSingleUnionType {
    export interface Init {
        discriminant: FernIr.NameAndWireValueOrString;
        discriminantValue: FernIr.NameAndWireValueOrString;
        caseConverter: CaseConverter;
    }
}

export abstract class AbstractRawSingleUnionType<Context> implements RawSingleUnionType<Context> {
    private discriminant: FernIr.NameAndWireValueOrString;
    private discriminantValueWithAllCasings: FernIr.NameAndWireValueOrString;
    protected case: CaseConverter;

    constructor({ discriminant, discriminantValue, caseConverter }: AbstractRawSingleUnionType.Init) {
        this.discriminant = discriminant;
        this.discriminantValueWithAllCasings = discriminantValue;
        this.case = caseConverter;
    }

    public get discriminantValue(): string {
        return getWireValue(this.discriminantValueWithAllCasings);
    }

    public generateInterface(context: Context): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: sanitizeIdentifier(this.case.pascalUnsafe(this.discriminantValueWithAllCasings)),
            extends: this.getExtends(context).map(getTextOfTsNode),
            properties: [
                {
                    name: getPropertyKey(getWireValue(this.discriminant)),
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
