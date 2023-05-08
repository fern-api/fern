import { HttpEndpoint, MaybeStreamingResponse, StreamCondition } from "@fern-fern/ir-model/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { zip } from "lodash-es";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedDefaultEndpointImplementation } from "./GeneratedDefaultEndpointImplementation";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { GeneratedStreamingEndpointImplementation } from "./GeneratedStreamingEndpointImplementation";

export declare namespace GeneratedMaybeStreamingEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        response: MaybeStreamingResponse;
        nonStreamingEndpointImplementation: GeneratedDefaultEndpointImplementation;
        streamingEndpointImplementation: GeneratedStreamingEndpointImplementation;
    }
}

export class GeneratedMaybeStreamingEndpointImplementation implements GeneratedEndpointImplementation {
    public endpoint: HttpEndpoint;
    private response: MaybeStreamingResponse;
    private nonStreamingEndpointImplementation: GeneratedDefaultEndpointImplementation;
    private streamingEndpointImplementation: GeneratedStreamingEndpointImplementation;

    constructor({
        endpoint,
        response,
        nonStreamingEndpointImplementation,
        streamingEndpointImplementation,
    }: GeneratedMaybeStreamingEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.response = response;
        this.nonStreamingEndpointImplementation = nonStreamingEndpointImplementation;
        this.streamingEndpointImplementation = streamingEndpointImplementation;
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        return [
            ...this.streamingEndpointImplementation.getRequestBuilderStatements(context),
            ts.factory.createIfStatement(
                this.getReferenceToStreamConditionVariable(context),
                ts.factory.createBlock(
                    this.streamingEndpointImplementation.invokeFetcher(context, { isCallbackOptional: true }),
                    true
                ),
                ts.factory.createBlock(
                    this.nonStreamingEndpointImplementation.invokeFetcherAndReturnResponse(context),
                    true
                )
            ),
        ];
    }

    private getReferenceToStreamConditionVariable(context: SdkClientClassContext): ts.Expression {
        return StreamCondition._visit<ts.Expression>(this.response.condition, {
            queryParameterKey: (queryParameterKey) => {
                return this.streamingEndpointImplementation.getReferenceToQueryParameter(queryParameterKey, context);
            },
            requestPropertyKey: (requestPropertyKey) => {
                const referenceToRequestBody = this.streamingEndpointImplementation.getReferenceToRequestBody(context);
                if (referenceToRequestBody == null) {
                    throw new Error(
                        "Cannot generate maybe-streaming endpoint because request parameter is not defined."
                    );
                }
                return ts.factory.createPropertyAccessExpression(
                    referenceToRequestBody,
                    ts.factory.createIdentifier(requestPropertyKey)
                );
            },
            _unknown: () => {
                throw new Error("Unknown StreamCondition: " + this.response.condition.type);
            },
        });
    }

    public getOverloads(context: SdkClientClassContext): EndpointSignature[] {
        const requestParameterKeyForStreamCondition = StreamCondition._visit(this.response.condition, {
            queryParameterKey: (queryParameterKey) => queryParameterKey,
            requestPropertyKey: (requestPropertyKey) => requestPropertyKey,
            _unknown: () => {
                throw new Error("Unknown StreamCondition: " + this.response.condition.type);
            },
        });
        return [
            this.nonStreamingEndpointImplementation.getSignature(context, {
                requestParameterIntersection: ts.factory.createTypeLiteralNode([
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier(requestParameterKeyForStreamCondition),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createLiteralTypeNode(ts.factory.createFalse())
                    ),
                ]),
                excludeInitializers: true,
            }),

            this.streamingEndpointImplementation.getSignature(context, {
                requestParameterIntersection: ts.factory.createTypeLiteralNode([
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier(requestParameterKeyForStreamCondition),
                        undefined,
                        ts.factory.createLiteralTypeNode(ts.factory.createTrue())
                    ),
                ]),
                excludeInitializers: true,
            }),
        ];
    }

    public getSignature(context: SdkClientClassContext): EndpointSignature {
        const nonStreamingSignature = this.nonStreamingEndpointImplementation.getSignature(context);
        const streamingSignature = this.streamingEndpointImplementation.getSignature(context);
        return {
            parameters: this.mergeEndpointParameters(nonStreamingSignature.parameters, streamingSignature.parameters),
            returnTypeWithoutPromise: this.maybeUnionTypes(
                nonStreamingSignature.returnTypeWithoutPromise,
                streamingSignature.returnTypeWithoutPromise
            ),
        };
    }

    private mergeEndpointParameters(
        aParameters: OptionalKind<ParameterDeclarationStructure>[],
        bParameters: OptionalKind<ParameterDeclarationStructure>[]
    ): OptionalKind<ParameterDeclarationStructure>[] {
        return zip(aParameters, bParameters).map(([aParam, bParam]) => {
            const firstDefinedParam: OptionalKind<ParameterDeclarationStructure> | undefined = aParam ?? bParam;
            if (firstDefinedParam == null) {
                throw new Error("zip() resulted in two undefined parameters.");
            }
            if (aParam != null && bParam != null && aParam.type !== bParam.type) {
                throw new Error("Two parameters at same index hae different types.");
            }

            const aIsOptional = aParam == null || aParam.hasQuestionToken === true || aParam.initializer != null;
            const bIsOptional = bParam == null || bParam.hasQuestionToken === true || bParam.initializer != null;

            return {
                name: firstDefinedParam.name,
                hasQuestionToken: (aIsOptional || bIsOptional) && firstDefinedParam.initializer == null,
                type: firstDefinedParam.type,
                initializer: firstDefinedParam.initializer,
            };
        });
    }

    private maybeUnionTypes(a: ts.TypeNode, b: ts.TypeNode) {
        if (getTextOfTsNode(a) === getTextOfTsNode(b)) {
            return a;
        } else {
            return ts.factory.createUnionTypeNode([a, b]);
        }
    }

    public getDocs(): string | undefined {
        return this.endpoint.docs ?? undefined;
    }
}
