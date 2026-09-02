import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts, getPropertyKey, PackageId } from "@fern-typescript/commons";
import { EndpointSampleCode, FileContext, GeneratedEndpointImplementation } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedDefaultEndpointImplementation } from "./default/GeneratedDefaultEndpointImplementation.js";
import { GeneratedStreamingEndpointImplementation } from "./GeneratedStreamingEndpointImplementation.js";

export declare namespace GeneratedStreamParameterEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        streamParameter: FernIr.RequestProperty;
        requestParameterName: string;
        streamingEndpoint: GeneratedStreamingEndpointImplementation;
        nonStreamingEndpoint: GeneratedDefaultEndpointImplementation;
    }
}

/**
 * Generates a single method for an endpoint whose response is controlled by a
 * request property (`stream-condition` in the Fern definition).
 *
 * The method is overloaded on that property so that `stream: true` narrows to
 * the streaming response and `stream: false` narrows to the non-streaming one,
 * while the implementation branches on the property at runtime.
 */
export class GeneratedStreamParameterEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: FernIr.HttpEndpoint;
    private readonly packageId: PackageId;
    private readonly streamParameter: FernIr.RequestProperty;
    private readonly requestParameterName: string;
    private readonly streamingEndpoint: GeneratedStreamingEndpointImplementation;
    private readonly nonStreamingEndpoint: GeneratedDefaultEndpointImplementation;

    constructor({
        packageId,
        endpoint,
        streamParameter,
        requestParameterName,
        streamingEndpoint,
        nonStreamingEndpoint
    }: GeneratedStreamParameterEndpointImplementation.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.streamParameter = streamParameter;
        this.requestParameterName = requestParameterName;
        this.streamingEndpoint = streamingEndpoint;
        this.nonStreamingEndpoint = nonStreamingEndpoint;
    }

    public isPaginated(): boolean {
        return false;
    }

    public getSignature(context: FileContext): GeneratedEndpointImplementation.EndpointSignature {
        return {
            parameters: this.streamingEndpoint.getSignature(context).parameters,
            returnTypeWithoutPromise: ts.factory.createUnionTypeNode([
                this.streamingEndpoint.getSignature(context).returnTypeWithoutPromise,
                this.nonStreamingEndpoint.getSignature(context).returnTypeWithoutPromise
            ])
        };
    }

    public getOverloads(context: FileContext): GeneratedEndpointImplementation.EndpointSignature[] {
        return [
            {
                parameters: this.getNarrowedParameters({ context, isStreaming: true }),
                returnTypeWithoutPromise: this.streamingEndpoint.getSignature(context).returnTypeWithoutPromise
            },
            {
                parameters: this.getNarrowedParameters({ context, isStreaming: false }),
                returnTypeWithoutPromise: this.nonStreamingEndpoint.getSignature(context).returnTypeWithoutPromise
            }
        ];
    }

    public getStatements(context: FileContext): ts.Statement[] {
        return [
            ts.factory.createIfStatement(
                this.getReferenceToStreamProperty(context),
                ts.factory.createBlock(this.streamingEndpoint.getStatements(context), true),
                ts.factory.createBlock(this.nonStreamingEndpoint.getStatements(context), true)
            )
        ];
    }

    public getDocs(context: FileContext): string | undefined {
        return this.nonStreamingEndpoint.getDocs(context);
    }

    public getExample(args: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }): EndpointSampleCode | undefined {
        return this.nonStreamingEndpoint.getExample(args);
    }

    public maybeLeverageInvocation(args: { context: FileContext; invocation: ts.Expression }): ts.Node[] | undefined {
        return this.nonStreamingEndpoint.maybeLeverageInvocation(args);
    }

    /**
     * Narrows the request parameter's type to the literal value of the stream
     * property for a single overload, e.g. `GenerateRequest & { stream: true }`.
     */
    private getNarrowedParameters({
        context,
        isStreaming
    }: {
        context: FileContext;
        isStreaming: boolean;
    }): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] {
        const propertyKey = this.getStreamPropertyKey(context);
        return this.streamingEndpoint.getSignature(context).parameters.map((parameter) => {
            if (parameter.name !== this.requestParameterName || parameter.type == null) {
                return parameter;
            }
            return {
                ...parameter,
                type: `(${parameter.type.toString()}) & { ${getPropertyKey(propertyKey)}: ${isStreaming} }`,
                initializer: undefined
            };
        });
    }

    private getStreamPropertyKey(context: FileContext): string {
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.packageId,
            this.endpoint.name
        );
        return visitDiscriminatedUnion(this.streamParameter.property, "type")._visit({
            query: (queryParameter) =>
                generatedRequestWrapper.getPropertyNameOfQueryParameterFromName(queryParameter.name).propertyName,
            body: (objectProperty) =>
                generatedRequestWrapper.getInlinedRequestBodyPropertyKeyFromName(objectProperty.name).propertyName
        });
    }

    private getReferenceToStreamProperty(context: FileContext): ts.Expression {
        const propertyKey = this.getStreamPropertyKey(context);
        const referenceToRequest = ts.factory.createIdentifier(this.requestParameterName);
        // getPropertyKey quotes any key that isn't a bare identifier, which is
        // exactly when we need element access instead of property access.
        if (getPropertyKey(propertyKey) === propertyKey) {
            return ts.factory.createPropertyAccessExpression(referenceToRequest, propertyKey);
        }
        return ts.factory.createElementAccessExpression(
            referenceToRequest,
            ts.factory.createStringLiteral(propertyKey)
        );
    }
}
