import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface SingleUnionTypeGenerator {
    getExtendsForInterface(file: SdkFile, opts: { isRaw: boolean }): ts.TypeNode[];
    getNonDiscriminantPropertiesForInterface(
        file: SdkFile,
        opts: { isRaw: boolean }
    ): OptionalKind<PropertySignatureStructure>[];
    getVisitorArguments(args: { referenceToUnionValue: ts.Expression }): ts.Expression[];
    getVisitorArgumentsForBuilder(): ts.Expression[];
    getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined;
    getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[];
    getNonDiscriminantPropertiesForBuilder(file: SdkFile): ts.ObjectLiteralElementLike[];
    getNonDiscriminantPropertiesForSchema(file: SdkFile): Zurg.union.SingleUnionType["nonDiscriminantProperties"];
}
