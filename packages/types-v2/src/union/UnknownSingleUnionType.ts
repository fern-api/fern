import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface UnknownSingleUnionType {
    discriminantType: ts.TypeNode;
    getVisitorArgument: (file: SdkFile) => ts.TypeNode;
    getNonDiscriminantProperties?: (file: SdkFile) => OptionalKind<PropertySignatureStructure>[];
}
