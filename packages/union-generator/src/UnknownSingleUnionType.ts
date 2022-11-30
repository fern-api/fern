import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface UnknownSingleUnionType<Context> {
    discriminantType: ts.TypeNode;
    getVisitorArgument: (context: Context) => ts.TypeNode;
    getNonDiscriminantProperties?: (context: Context) => OptionalKind<PropertySignatureStructure>[];
}
