import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import {
    OptionalKind,
    ParameterDeclarationStructure,
    StatementStructures,
    StructureKind,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import { AbstractGeneratedEndpointImplementation } from "./AbstractGeneratedEndpointImplementation";
import { GeneratedSdkClientClassImpl } from "./GeneratedSdkClientClassImpl";

export declare namespace AbstractNonStreamingGeneratedEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
    }
}

export abstract class AbstractNonStreamingGeneratedEndpointImplementation extends AbstractGeneratedEndpointImplementation {
    protected getReturnResponseStatements(context: SdkClientClassContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkClientClassContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(AbstractGeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock([ts.factory.createReturnStatement(this.getReturnValueForOkResponse(context))], true)
        );
    }

    protected getOkResponseBody(context: SdkClientClassContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(AbstractGeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
                context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    protected getReferenceToError(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(AbstractGeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    protected getReferenceToErrorBody(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    protected getAdditionalEndpointParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return [];
    }

    protected invokeFetcher(
        fetcherArgs: Fetcher.Args,
        context: SdkClientClassContext
    ): (StatementStructures | WriterFunction | string)[] {
        return [
            {
                kind: StructureKind.VariableStatement,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: AbstractGeneratedEndpointImplementation.RESPONSE_VARIABLE_NAME,
                        initializer: getTextOfTsNode(
                            context.base.coreUtilities.fetcher.fetcher._invoke(fetcherArgs, {
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
                            })
                        ),
                    },
                ],
            },
        ];
    }

    protected abstract getReturnValueForOkResponse(context: SdkClientClassContext): ts.Expression | undefined;
    protected abstract getReturnFailedResponse(context: SdkClientClassContext): ts.Statement[];
}
