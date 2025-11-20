import { ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, PropertySignatureStructure, ts } from "ts-morph";

export interface SingleUnionTypeGenerator<Context extends ModelContext> {
    generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    };
    getDiscriminantPropertiesForInterface(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[];
    generateModule(context: Context): ModuleDeclarationStructure | undefined;
    getExtendsForInterface(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    }[];
    getNonDiscriminantPropertiesForInterface(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[];
    getVisitorArguments(args: { localReferenceToUnionValue: ts.Expression }): ts.Expression[];
    getVisitMethodParameterType(context: Context, args: { discriminant: string }): ts.TypeNode | undefined;
    getParametersForBuilder(context: Context, args: { discriminant: string }): ts.ParameterDeclaration[];
    getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[];
    getNonDiscriminantPropertiesForBuilder(context: Context): ts.ObjectLiteralElementLike[];
    needsRequestResponse(context: Context): { request: boolean; response: boolean };
    getTypeAliasForNamingConflict?(context: Context): { name: string; type: string } | undefined;
}
