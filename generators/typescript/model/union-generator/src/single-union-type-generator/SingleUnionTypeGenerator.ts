import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export interface SingleUnionTypeGenerator<Context> {
    generateForInlineUnion(context: Context): ts.TypeNode;
    getDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[];
    generateModule(context: Context): ModuleDeclarationStructure | undefined;
    getExtendsForInterface(context: Context): ts.TypeNode[];
    getNonDiscriminantPropertiesForInterface(context: Context): OptionalKind<PropertySignatureStructure>[];
    getVisitorArguments(args: { localReferenceToUnionValue: ts.Expression }): ts.Expression[];
    getVisitMethodParameterType(context: Context, args: { discriminant: string }): ts.TypeNode | undefined;
    getParametersForBuilder(context: Context, args: { discriminant: string }): ts.ParameterDeclaration[];
    getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[];
    getNonDiscriminantPropertiesForBuilder(context: Context): ts.ObjectLiteralElementLike[];
}
