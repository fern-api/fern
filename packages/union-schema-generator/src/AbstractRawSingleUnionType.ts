import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { BaseContext } from "@fern-typescript/sdk-declaration-handler";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { RawSingleUnionType } from "./RawSingleUnionType";

export declare namespace AbstractRawSingleUnionType {
    export interface Init {
        discriminant: WireStringWithAllCasings;
        discriminantValue: WireStringWithAllCasings;
    }
}

export abstract class AbstractRawSingleUnionType<Context extends BaseContext> implements RawSingleUnionType<Context> {
    private disciminant: WireStringWithAllCasings;
    private discriminantValueWithAllCasings: WireStringWithAllCasings;

    constructor({ discriminant, discriminantValue }: AbstractRawSingleUnionType.Init) {
        this.disciminant = discriminant;
        this.discriminantValueWithAllCasings = discriminantValue;
    }

    public get discriminantValue(): string {
        return this.discriminantValueWithAllCasings.wireValue;
    }

    public generateInterface(context: Context): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: this.discriminantValueWithAllCasings.pascalCase,
            extends: this.getExtends(context).map(getTextOfTsNode),
            properties: [
                {
                    name: `"${this.disciminant.wireValue}"`,
                    type: `"${this.discriminantValue}"`,
                },
                ...this.getNonDiscriminantPropertiesForInterface(context),
            ],
        };
    }

    public getSchema(context: Context): Zurg.union.SingleUnionType {
        return {
            discriminantValue: this.discriminantValue,
            nonDiscriminantProperties: this.getNonDiscriminantPropertiesForSchema(context),
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
