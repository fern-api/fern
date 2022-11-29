import { BaseContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface UnknownSingleUnionType<Context extends BaseContext> {
    discriminantType: ts.TypeNode;
    getVisitorArgument: (context: Context) => ts.TypeNode;
    getNonDiscriminantProperties?: (context: Context) => OptionalKind<PropertySignatureStructure>[];
}
