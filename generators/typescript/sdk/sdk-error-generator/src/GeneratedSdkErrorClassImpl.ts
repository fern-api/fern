import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkErrorClass, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

import { ErrorDeclaration } from "@fern-fern/ir-sdk";

export declare namespace GeneratedSdkErrorClassImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
    }
}

export class GeneratedSdkErrorClassImpl
    extends AbstractErrorClassGenerator<SdkContext>
    implements GeneratedSdkErrorClass
{
    public readonly type = "class";

    private static BODY_CONSTRUCTOR_PARAMETER_NAME = "body";
    private static RAW_RESPONSE_CONSTRUCTOR_PARAMETER_NAME = "rawResponse";

    private errorDeclaration: ErrorDeclaration;

    constructor({ errorClassName, errorDeclaration }: GeneratedSdkErrorClassImpl.Init) {
        super({ errorClassName });
        this.errorDeclaration = errorDeclaration;
    }

    public writeToFile(context: SdkContext): void {
        super.writeToSourceFile(context);
    }

    public build(
        context: SdkContext,
        {
            referenceToBody,
            referenceToRawResponse
        }: {
            referenceToBody: ts.Expression | undefined;
            referenceToRawResponse: ts.Expression | undefined;
        }
    ): ts.NewExpression {
        const params = [];
        if (referenceToBody != null) {
            params.push(referenceToBody);
        }
        if (referenceToRawResponse != null) {
            params.push(referenceToRawResponse);
        }
        return ts.factory.createNewExpression(
            context.sdkError.getReferenceToError(this.errorDeclaration.name).getExpression(),
            undefined,
            params
        );
    }

    protected addToClass(): void {
        // no-op
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [];
    }

    protected getConstructorParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        if (this.errorDeclaration.type != null) {
            const referenceToType = context.type.getReferenceToType(this.errorDeclaration.type);
            parameters.push({
                name: GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined)
            });
        }
        parameters.push({
            name: GeneratedSdkErrorClassImpl.RAW_RESPONSE_CONSTRUCTOR_PARAMETER_NAME,
            hasQuestionToken: true,
            type: getTextOfTsNode(context.coreUtilities.fetcher.RawResponse.RawResponse._getReferenceToType())
        });
        return parameters;
    }

    protected getSuperArguments(context: SdkContext): ts.Expression[] {
        return context.genericAPISdkError.getGeneratedGenericAPISdkError().buildConstructorArguments({
            message: ts.factory.createStringLiteral(this.errorDeclaration.name.name.originalName),
            statusCode: ts.factory.createNumericLiteral(this.errorDeclaration.statusCode),
            responseBody:
                this.errorDeclaration.type != null
                    ? ts.factory.createIdentifier(GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME)
                    : undefined,
            rawResponse: ts.factory.createIdentifier(GeneratedSdkErrorClassImpl.RAW_RESPONSE_CONSTRUCTOR_PARAMETER_NAME)
        });
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected isAbstract(): boolean {
        return false;
    }

    protected override getBaseClass(context: SdkContext): ts.TypeNode {
        return context.genericAPISdkError.getReferenceToGenericAPISdkError().getTypeNode();
    }
}
