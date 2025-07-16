import { Zurg } from "@fern-typescript/commons"
import { InterfaceDeclarationStructure, OptionalKind } from "ts-morph"

export interface RawSingleUnionType<Context> {
    discriminantValue: string
    generateInterface: (context: Context) => OptionalKind<InterfaceDeclarationStructure>
    getSchema: (context: Context) => Zurg.union.SingleUnionType
}
