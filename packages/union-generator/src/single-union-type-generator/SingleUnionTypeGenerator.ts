import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface SingleUnionTypeGenerator {
    getExtendsForInterface(context: TypeContext): ts.TypeNode[];
    getNonDiscriminantPropertiesForInterface(context: TypeContext): OptionalKind<PropertySignatureStructure>[];
    getVisitorArguments(args: { localReferenceToUnionValue: ts.Expression }): ts.Expression[];
    getVisitMethodParameterType(context: TypeContext): ts.TypeNode | undefined;
    getParametersForBuilder(context: TypeContext): ts.ParameterDeclaration[];
    getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[];
    getNonDiscriminantPropertiesForBuilder(context: TypeContext): ts.ObjectLiteralElementLike[];
}
