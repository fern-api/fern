import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface UnknownSingleUnionType {
    discriminantType: ts.TypeNode;
    getVisitorArgument: (context: TypeContext) => ts.TypeNode;
    getNonDiscriminantProperties?: (context: TypeContext) => OptionalKind<PropertySignatureStructure>[];
}
