import { HttpMethod } from "@fern-fern/ir-model/services/http";
import { Fetcher } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedQueryParameter {
    key: string;
    value: ts.Expression;
    valueAsString: ts.Expression;
    isNullable: boolean;
}

export interface GeneratedHeader {
    header: string;
    value: ts.Expression;
}

export declare namespace FetcherArgsBuilder {
    export interface Init {
        url: ts.Expression;
        method: HttpMethod;
        body: ts.Expression | undefined;
        queryParameters?: GeneratedQueryParameter[];
        headers?: GeneratedHeader[];
    }

    export namespace build {
        export interface Return {
            fetcherArgs: Fetcher.Args;
            statementsToPrepend: ts.Statement[];
        }
    }
}

export class FetcherArgsBuilder {
    private static QUERY_PARAMS_VARIABLE_NAME = "queryParams";

    private url: ts.Expression;
    private method: HttpMethod;
    private body: ts.Expression | undefined;
    private queryParameters: GeneratedQueryParameter[];
    private headers: GeneratedHeader[];

    constructor({ url, method, body, queryParameters = [], headers = [] }: FetcherArgsBuilder.Init) {
        this.url = url;
        this.method = method;
        this.body = body;
        this.queryParameters = queryParameters;
        this.headers = headers;
    }

    public addQueryParameter(queryParameter: GeneratedQueryParameter): void {
        this.queryParameters.push(queryParameter);
    }

    public addHeader(header: GeneratedHeader): void {
        this.headers.push(header);
    }

    public addHeaders(headers: GeneratedHeader[]): void {
        this.headers.push(...headers);
    }

    public build(): FetcherArgsBuilder.build.Return {
        const statementsToPrepend: ts.Statement[] = [];
        if (this.queryParameters.length > 0) {
            statementsToPrepend.push(...this.buildQueryParameters());
        }

        const fetcherArgs: Fetcher.Args = {
            url: this.url,
            method: ts.factory.createStringLiteral(this.method),
            headers: this.headers.map((header) =>
                ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header.header), header.value)
            ),
            queryParameters:
                this.queryParameters.length > 0
                    ? ts.factory.createIdentifier(FetcherArgsBuilder.QUERY_PARAMS_VARIABLE_NAME)
                    : undefined,
            body: this.body,
            timeoutMs: undefined,
        };

        return { fetcherArgs, statementsToPrepend };
    }

    private buildQueryParameters(): ts.Statement[] {
        const statements: ts.Statement[] = [];

        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            FetcherArgsBuilder.QUERY_PARAMS_VARIABLE_NAME,
                            undefined,
                            undefined,
                            ts.factory.createNewExpression(
                                ts.factory.createIdentifier("URLSearchParams"),
                                undefined,
                                []
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        for (const { key, value, valueAsString, isNullable } of this.queryParameters) {
            const appendStatement = ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(FetcherArgsBuilder.QUERY_PARAMS_VARIABLE_NAME),
                        ts.factory.createIdentifier("append")
                    ),
                    undefined,
                    [ts.factory.createStringLiteral(key), valueAsString]
                )
            );

            if (isNullable) {
                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            value,
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock([appendStatement])
                    )
                );
            } else {
                statements.push(appendStatement);
            }
        }

        return statements;
    }
}
