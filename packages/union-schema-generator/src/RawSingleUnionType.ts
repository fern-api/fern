import { Zurg } from "@fern-typescript/commons-v2";
import { TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { InterfaceDeclarationStructure, OptionalKind } from "ts-morph";

export interface RawSingleUnionType<Context extends TypeSchemaContext> {
    discriminantValue: string;
    generateInterface: (context: Context) => OptionalKind<InterfaceDeclarationStructure>;
    getSchema: (context: Context) => Zurg.union.SingleUnionType;
}
