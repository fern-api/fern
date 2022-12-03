import { Zurg } from "@fern-typescript/commons-v2";
import { InterfaceDeclarationStructure, OptionalKind } from "ts-morph";

export interface RawSingleUnionType<Context> {
    discriminantValue: string;
    generateInterface: (context: Context) => OptionalKind<InterfaceDeclarationStructure>;
    getSchema: (context: Context) => Zurg.union.SingleUnionType;
}
