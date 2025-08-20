import { ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "../SingleUnionTypeGenerator";

export class NoPropertiesSingleUnionTypeGenerator<Context extends ModelContext>
    implements SingleUnionTypeGenerator<Context>
{
    public generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        return {
            typeNode: ts.factory.createTypeLiteralNode([]),
            requestTypeNode: undefined,
            responseTypeNode: undefined
        };
    }

    public getExtendsForInterface(): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    }[] {
        return [];
    }

    public getDiscriminantPropertiesForInterface(context: Context): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        return [];
    }

    public generateModule(context: Context): ModuleDeclarationStructure | undefined {
        return undefined;
    }

    public getNonDiscriminantPropertiesForInterface(): {
        property: PropertySignatureStructure;
        requestProperty: PropertySignatureStructure | undefined;
        responseProperty: PropertySignatureStructure | undefined;
        isReadonly: boolean;
        isWriteonly: boolean;
    }[] {
        return [];
    }

    public getParametersForBuilder(): ts.ParameterDeclaration[] {
        return [];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [];
    }

    public getVisitMethodParameterType(): ts.TypeNode | undefined {
        return undefined;
    }

    public getVisitorArguments(): ts.Expression[] {
        return [];
    }

    public getBuilderArgsFromExistingValue(): ts.Expression[] {
        return [];
    }

    public needsRequestResponse(): { request: boolean; response: boolean } {
        return { request: false, response: false };
    }
}
