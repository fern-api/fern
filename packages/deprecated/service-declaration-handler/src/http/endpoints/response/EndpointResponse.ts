import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { AbstractParsedSingleUnionType, UnionModule, UnionVisitHelper } from "@fern-typescript/types-v2";
import { ts } from "ts-morph";
import { AbstractEndpointDeclaration } from "../AbstractEndpointDeclaration";
import { EndpointError } from "../error/EndpointError";
import { EndpointErrorUnionGenerator } from "../error/EndpointErrorUnionGenerator";
import { WireBodySchema } from "../WireBodySchema";

export declare namespace EndpointResponse {
    export interface Init extends AbstractEndpointDeclaration.Init {
        endpointError: EndpointError;
    }
}

export class EndpointResponse extends AbstractEndpointDeclaration {
    public static RESPONSE_VARIABLE = "response";
    private static TYPE_NAME = "Response";
    private static SCHEMA_TYPE_NAME = "Response";

    private schema: WireBodySchema | undefined;
    private endpointError: EndpointError;

    constructor({ endpointError, ...superInit }: EndpointResponse.Init) {
        super(superInit);
        this.schema = WireBodySchema.of({
            typeName: EndpointResponse.SCHEMA_TYPE_NAME,
            type: superInit.endpoint.response.type,
            serviceName: superInit.service.name,
            endpoint: superInit.endpoint,
        });
        this.endpointError = endpointError;
    }

    public generate({ schemaFile }: { schemaFile: SdkFile }): void {
        this.schema?.writeSchemaToFile(schemaFile);
    }

    public getResponseType(file: SdkFile): ts.TypeNode {
        return ts.factory.createTypeReferenceNode("Promise", [
            file
                .getReferenceToEndpointFileExport(this.service.name, this.endpoint, EndpointResponse.TYPE_NAME)
                .getTypeNode(),
        ]);
    }

    public getReturnResponseStatements(file: SdkFile): ts.Statement[] {
        return [
            this.getReturnResponseIfOk(file),
            ...this.getReturnResponseForKnownErrors(file),
            this.getReturnResponseForUnknownError(file),
        ];
    }

    private getReturnResponseIfOk(file: SdkFile): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(EndpointResponse.RESPONSE_VARIABLE),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock(
                [
                    ts.factory.createReturnStatement(
                        file.coreUtilities.fetcher.APIResponse.SuccessfulResponse._build(this.getOkResponseBody(file))
                    ),
                ],
                true
            )
        );
    }

    private getOkResponseBody(file: SdkFile): ts.Expression {
        if (!this.hasResponseBody()) {
            return ts.factory.createIdentifier("undefined");
        }

        const responseBodySchema =
            this.schema != null
                ? this.schema.getReferenceToSchema(file)
                : file.getSchemaOfTypeReference(this.endpoint.response.type);
        const rawResponseBodyType =
            this.schema != null
                ? this.schema.getReferenceToRawShape(file)
                : file.getReferenceToRawType(this.endpoint.response.type).typeNode;

        return responseBodySchema.parse(
            ts.factory.createAsExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(EndpointResponse.RESPONSE_VARIABLE),
                    file.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                ),
                rawResponseBodyType
            )
        );
    }

    private hasResponseBody(): boolean {
        return this.endpoint.response.type._type !== "void";
    }

    private getReturnResponseForKnownErrors(file: SdkFile): ts.Statement[] {
        const allErrorsButLast = this.endpointError.getErrors();
        const lastError = allErrorsButLast.pop();

        if (lastError == null) {
            return [];
        }

        const referenceToError = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(EndpointResponse.RESPONSE_VARIABLE),
            file.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
        const referenceToErrorBody = ts.factory.createPropertyAccessExpression(
            referenceToError,
            file.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );

        const ifStatement = ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    file.coreUtilities.fetcher.Fetcher.Error.reason
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                ts.factory.createStringLiteral(
                    file.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._reasonLiteralValue
                )
            ),
            ts.factory.createBlock(
                [
                    ts.factory.createSwitchStatement(
                        ts.factory.createPropertyAccessChain(
                            ts.factory.createAsExpression(
                                referenceToErrorBody,
                                this.endpointError.getReferenceToRawType(file)
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            this.endpoint.errorsV2.discriminant.wireValue
                        ),
                        ts.factory.createCaseBlock([
                            ...allErrorsButLast.map((error) =>
                                ts.factory.createCaseClause(
                                    ts.factory.createStringLiteral(error.getDiscriminantValue()),
                                    []
                                )
                            ),
                            ts.factory.createCaseClause(
                                ts.factory.createStringLiteral(lastError.getDiscriminantValue()),
                                [
                                    ts.factory.createReturnStatement(
                                        file.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                            this.endpointError
                                                .getReferenceToSchema(file)
                                                .parse(
                                                    ts.factory.createAsExpression(
                                                        referenceToErrorBody,
                                                        this.endpointError.getReferenceToRawType(file)
                                                    )
                                                )
                                        )
                                    ),
                                ]
                            ),
                        ])
                    ),
                ],
                true
            ),
            undefined
        );

        return [ifStatement];
    }

    private getReturnResponseForUnknownError(file: SdkFile): ts.Statement {
        const referenceToError = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(EndpointResponse.RESPONSE_VARIABLE),
            file.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );

        return ts.factory.createReturnStatement(
            file.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(
                            AbstractParsedSingleUnionType.getDiscriminantKey(this.endpoint.errorsV2.discriminant),
                            ts.factory.createIdentifier("undefined")
                        ),
                        ts.factory.createPropertyAssignment(
                            EndpointErrorUnionGenerator.UNKNOWN_ERROR_PROPERTY_NAME,
                            referenceToError
                        ),
                        ts.factory.createPropertyAssignment(
                            UnionModule.VISIT_UTIL_PROPERTY_NAME,
                            UnionVisitHelper.getVisitMethod({
                                visitorKey: UnionVisitHelper.UNKNOWN_VISITOR_KEY,
                                visitorArguments: [referenceToError],
                            })
                        ),
                    ],
                    true
                )
            )
        );
    }
}
