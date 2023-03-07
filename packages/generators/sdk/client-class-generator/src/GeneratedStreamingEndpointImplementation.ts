import { StreamingResponse } from "@fern-fern/ir-model/http";
import { Fetcher, getTextOfTsNode, StreamingFetcher } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, StatementStructures, ts, WriterFunction } from "ts-morph";
import { AbstractGeneratedEndpointImplementation } from "./AbstractGeneratedEndpointImplementation";

export declare namespace GeneratedStreamingEndpointImplementation {
    export interface Init extends AbstractGeneratedEndpointImplementation.Init {
        response: StreamingResponse;
    }
}

export class GeneratedStreamingEndpointImplementation extends AbstractGeneratedEndpointImplementation {
    private static DB_CALLBACK_NAME = "cb";
    private static DATA_PARAMETER_NAME = "data";
    private static OPTS_PARAMETER_NAME = "opts";

    private response: StreamingResponse;

    constructor({ response, ...superInit }: GeneratedStreamingEndpointImplementation.Init) {
        super(superInit);
        this.response = response;
    }

    protected getAdditionalEndpointParameters(
        context: SdkClientClassContext
    ): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            {
                name: GeneratedStreamingEndpointImplementation.DB_CALLBACK_NAME,
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME,
                                undefined,
                                context.type.getReferenceToType(this.response.dataEventType).typeNode
                            ),
                        ],
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                    )
                ),
            },
            {
                name: GeneratedStreamingEndpointImplementation.OPTS_PARAMETER_NAME,
                hasQuestionToken: true,
                type: getTextOfTsNode(
                    ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier("Pick"), [
                        context.base.coreUtilities.streamingFetcher.StreamingFetcher.Args._getReferenceToType(),
                        ts.factory.createUnionTypeNode([
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.base.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties.onError
                                )
                            ),
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.base.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties
                                        .onFinish
                                )
                            ),
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.base.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties
                                        .abortController
                                )
                            ),
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.base.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties
                                        .timeoutMs
                                )
                            ),
                        ]),
                    ])
                ),
            },
        ];
    }

    protected getAdditionalDocLines(): string[] {
        return [];
    }

    protected invokeFetcher(
        fetcherArgs: Fetcher.Args,
        context: SdkClientClassContext
    ): (StatementStructures | WriterFunction | string)[] {
        const PARSED_DATA_VARIABLE_NAME = "parsed";

        return [
            getTextOfTsNode(
                context.base.coreUtilities.streamingFetcher.streamingFetcher._invoke(
                    {
                        ...fetcherArgs,
                        onData: ts.factory.createArrowFunction(
                            [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                ),
                            ],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createVariableStatement(
                                        undefined,
                                        ts.factory.createVariableDeclarationList(
                                            [
                                                ts.factory.createVariableDeclaration(
                                                    PARSED_DATA_VARIABLE_NAME,
                                                    undefined,
                                                    undefined,
                                                    context.sdkEndpointTypeSchemas
                                                        .getGeneratedEndpointTypeSchemas(
                                                            this.packageId,
                                                            this.endpoint.name
                                                        )
                                                        .deserializeStreamData(
                                                            ts.factory.createIdentifier(
                                                                GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                            ),
                                                            context
                                                        )
                                                ),
                                            ],
                                            ts.NodeFlags.Const
                                        )
                                    ),
                                    ...context.base.coreUtilities.zurg.Schema._visitMaybeValid(
                                        ts.factory.createIdentifier(PARSED_DATA_VARIABLE_NAME),
                                        {
                                            valid: (validData) => [
                                                ts.factory.createExpressionStatement(
                                                    ts.factory.createCallExpression(
                                                        ts.factory.createIdentifier(
                                                            GeneratedStreamingEndpointImplementation.DB_CALLBACK_NAME
                                                        ),
                                                        undefined,
                                                        [validData]
                                                    )
                                                ),
                                            ],
                                            invalid: (errors) => [
                                                ts.factory.createExpressionStatement(
                                                    ts.factory.createCallChain(
                                                        this.getReferenceToOpt("onError"),
                                                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                                        undefined,
                                                        [errors]
                                                    )
                                                ),
                                            ],
                                        }
                                    ),
                                ],
                                true
                            )
                        ),
                        onError: this.getReferenceToOpt("onError"),
                        onFinish: this.getReferenceToOpt("onFinish"),
                        abortController: this.getReferenceToOpt("abortController"),
                    },
                    {
                        referenceToFetcher:
                            context.base.coreUtilities.streamingFetcher.streamingFetcher._getReferenceTo(),
                    }
                )
            ),
        ];
    }

    private getReferenceToOpt(key: keyof StreamingFetcher.Args): ts.Expression {
        return ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(GeneratedStreamingEndpointImplementation.OPTS_PARAMETER_NAME),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(key)
        );
    }

    protected getReturnResponseStatements(): ts.Statement[] {
        return [];
    }

    protected getResponseType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        ]);
    }
}
