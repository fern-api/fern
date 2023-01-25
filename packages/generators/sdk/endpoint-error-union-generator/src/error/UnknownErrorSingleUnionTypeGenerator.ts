import { getTextOfTsNode } from "@fern-typescript/commons";
import { EndpointErrorUnionContext } from "@fern-typescript/contexts";
import { SingleUnionTypeGenerator } from "@fern-typescript/union-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace UnknownErrorSingleUnionTypeGenerator {
    export interface Init {
        discriminant: string;
    }
}

export class UnknownErrorSingleUnionTypeGenerator implements SingleUnionTypeGenerator<EndpointErrorUnionContext> {
    private static CONTENT_PROPERTY_NAME = "content";
    private static BUILDER_PARAMETER_NAME = "fetcherError";

    private discriminant: string;

    constructor({ discriminant }: UnknownErrorSingleUnionTypeGenerator.Init) {
        this.discriminant = discriminant;
    }

    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(
        context: EndpointErrorUnionContext
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

    public getVisitMethodParameterType(context: EndpointErrorUnionContext): ts.TypeNode | undefined {
        return context.base.coreUtilities.fetcher.Fetcher.Error._getReferenceToType();
    }

    public getParametersForBuilder(context: EndpointErrorUnionContext): ts.ParameterDeclaration[] {
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
            ts.factory.createPropertyAssignment(this.discriminant, ts.factory.createIdentifier("undefined")),
            ts.factory.createPropertyAssignment(
                UnknownErrorSingleUnionTypeGenerator.CONTENT_PROPERTY_NAME,
                ts.factory.createIdentifier(UnknownErrorSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }
}
