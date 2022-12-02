import { getTextOfTsNode } from "@fern-typescript/commons";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export class UnknownErrorSingleUnionTypeGenerator implements SingleUnionTypeGenerator<EndpointTypesContext> {
    private static CONTENT_PROPERTY_NAME = "content";
    private static BUILDER_PARAMETER_NAME = "fetcherError";

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(
        context: EndpointTypesContext
    ): OptionalKind<PropertySignatureStructure>[] {
        return [
            {
                name: UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME,
                type: getTextOfTsNode(context.base.coreUtilities.fetcher.Fetcher.Error._getReferenceToType()),
            },
        ];
    }

    public getVisitorArguments({
        localReferenceToUnionValue,
    }: {
        localReferenceToUnionValue: ts.Expression;
    }): ts.Expression[] {
        return [localReferenceToUnionValue];
    }

    public getVisitMethodParameterType(context: EndpointTypesContext): ts.TypeNode | undefined {
        return context.base.coreUtilities.fetcher.Fetcher.Error._getReferenceToType();
    }

    public getParametersForBuilder(context: EndpointTypesContext): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                UnknownErrorSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                context.base.coreUtilities.fetcher.Fetcher.Error._getReferenceToType()
            ),
        ];
    }

    public getBuilderArgsFromExistingValue(existingValue: ts.Expression): ts.Expression[] {
        return [existingValue];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME,
                ts.factory.createIdentifier(UnknownErrorSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getBuilderParameterName(): string {
        return UnknownErrorSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME;
    }
}
