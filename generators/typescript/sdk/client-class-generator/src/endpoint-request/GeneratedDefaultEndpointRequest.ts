import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    Fetcher,
    GetReferenceOpts,
    getParameterNameForPositionalPathParameter,
    getPropertyKey,
    getTextOfTsNode,
    PackageId
} from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams.js";
import { generateHeaders, HEADERS_VAR_NAME } from "../endpoints/utils/generateHeaders.js";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature.js";
import {
    getGlobalParametersForEndpoint,
    getResolvedGlobalParameterValueExpression,
    getResolvedGlobalParameterValueExpressionForWire
} from "../endpoints/utils/globalParameters.js";
import {
    REQUEST_OPTIONS_ADDITIONAL_BODY_PARAMETERS_PROPERTY_NAME,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "../endpoints/utils/requestOptionsParameter.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter.js";
import { RequestParameter } from "../request-parameter/RequestParameter.js";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter.js";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest.js";

export declare namespace GeneratedDefaultEndpointRequest {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        packageId: PackageId;
        sdkRequest: FernIr.SdkRequest | undefined;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        requestBody: FernIr.HttpRequestBody.InlinedRequestBody | FernIr.HttpRequestBody.Reference | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        retainOriginalCasing: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        caseConverter: CaseConverter;
    }
}

interface LiteralPropertyValue {
    propertyWireKey: string;
    propertyValue: boolean | string;
}

/**
 * A nested tree of body global-parameter targets: a branch is another tree, a leaf
 * is the resolved value expression to inject at that path.
 */
type BodyDefaultsTree = Map<string, BodyDefaultsTree | ts.Expression>;

function bodyDefaultsTreeToObjectLiteral(tree: BodyDefaultsTree): ts.ObjectLiteralExpression {
    return ts.factory.createObjectLiteralExpression(
        Array.from(tree.entries()).map(([key, value]) =>
            ts.factory.createPropertyAssignment(
                getPropertyKey(key),
                value instanceof Map ? bodyDefaultsTreeToObjectLiteral(value) : value
            )
        ),
        true
    );
}

export class GeneratedDefaultEndpointRequest implements GeneratedEndpointRequest {
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly packageId: PackageId;
    private readonly requestParameter: RequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private readonly service: FernIr.HttpService;
    private readonly endpoint: FernIr.HttpEndpoint;
    private readonly requestBody:
        | FernIr.HttpRequestBody.InlinedRequestBody
        | FernIr.HttpRequestBody.Reference
        | undefined;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly retainOriginalCasing: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    private readonly case: CaseConverter;

    constructor({
        ir,
        packageId,
        sdkRequest,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        retainOriginalCasing,
        parameterNaming,
        caseConverter
    }: GeneratedDefaultEndpointRequest.Init) {
        this.ir = ir;
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.retainOriginalCasing = retainOriginalCasing;
        this.parameterNaming = parameterNaming;
        this.case = caseConverter;
        this.requestParameter =
            sdkRequest != null
                ? FernIr.SdkRequestShape._visit<RequestParameter>(sdkRequest.shape, {
                      justRequestBody: (requestBodyReference) => {
                          if (requestBodyReference.type === "bytes") {
                              throw new Error("Bytes request is not supported");
                          }
                          return new RequestBodyParameter({
                              packageId,
                              requestBodyReference,
                              service,
                              endpoint,
                              sdkRequest,
                              caseConverter
                          });
                      },
                      wrapper: () =>
                          new RequestWrapperParameter({ packageId, service, endpoint, sdkRequest, caseConverter }),
                      _other: () => {
                          throw new Error("Unknown SdkRequest: " + this.endpoint.sdkRequest?.shape.type);
                      }
                  })
                : undefined;
    }

    public getRequestParameter(context: FileContext): ts.TypeNode | undefined {
        return this.requestParameter?.getType(context);
    }

    public getEndpointParameters(
        context: FileContext
    ): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            parameters.push({
                name: getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing,
                    parameterNaming: this.parameterNaming,
                    caseConverter: this.case
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
                docs: pathParameter.docs
            });
        }
        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }
        return parameters;
    }

    public getExampleEndpointImports(): ts.Statement[] {
        return [];
    }

    public getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined {
        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const result: ts.Expression[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            const exampleParameter = exampleParameters.find(
                (param) => getOriginalName(param.name) === getOriginalName(pathParameter.name)
            );
            if (exampleParameter == null) {
                result.push(ts.factory.createIdentifier("undefined"));
            } else {
                const generatedExample = context.type.getGeneratedExample(exampleParameter.value);
                result.push(generatedExample.build(context, opts));
            }
        }
        if (this.requestParameter != null) {
            const requestParameterExample = this.requestParameter.generateExample({ context, example, opts });
            if (
                requestParameterExample != null &&
                getTextOfTsNode(requestParameterExample) === "{}" &&
                this.requestParameter.isOptional({ context })
            ) {
                // pass
            } else if (requestParameterExample != null) {
                result.push(requestParameterExample);
            } else if (!this.requestParameter.isOptional({ context })) {
                return undefined;
            }
        }
        return result;
    }

    public getBuildRequestStatements(context: FileContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(
                ...this.requestParameter.getInitialStatements(context, {
                    variablesInScope: this.getEndpointParameters(context).map((param) => param.name)
                })
            );
        }

        statements.push(...this.getQueryParams(context).getBuildStatements(context));

        statements.push(...this.initializeHeaders(context));

        return statements;
    }

    public getBuildHeaderStatements(context: FileContext): ts.Statement[] {
        return this.initializeHeaders(context);
    }

    public getFetcherRequestArgs(
        context: FileContext
    ): Pick<Fetcher.Args, "headers" | "body" | "contentType" | "requestType" | "queryString"> {
        const queryParams = this.getQueryParams(context);
        return {
            headers: ts.factory.createIdentifier(HEADERS_VAR_NAME),
            queryString: queryParams.getQueryStringExpression(context),
            body: this.injectBodyGlobalParameters(this.getSerializedRequestBodyWithNullCheck(context), context),
            contentType: this.requestBody?.contentType ?? this.getFallbackContentType(),
            requestType: this.getRequestType()
        };
    }

    /**
     * Deep-merges applicable `in: body` global parameters underneath the serialized
     * request body via `mergeGlobalBodyParameters`. The globals form a defaults object
     * (keyed by each parameter's dotted target path) that the caller's body is spread
     * on top of, so a per-call body value always wins.
     */
    private injectBodyGlobalParameters(
        body: ts.Expression | undefined,
        context: FileContext
    ): ts.Expression | undefined {
        // Only inject when the endpoint declares a request body — never fabricate a
        // body on a bodyless endpoint (e.g. an `apply: auto` body global must not add
        // a body to a GET). The runtime helper additionally leaves non-object bodies
        // and a runtime-`undefined` body (an omitted optional reference body) alone,
        // so an injected global never turns a bodyless request into one with a payload.
        if (body == null || this.requestBody == null) {
            return body;
        }

        const bodyGlobalParameters = getGlobalParametersForEndpoint({
            ir: this.ir,
            endpoint: this.endpoint,
            location: FernIr.GlobalParameterLocation.Body,
            context
        });
        if (bodyGlobalParameters.length === 0) {
            return body;
        }

        const defaultsObject = this.buildBodyGlobalParameterDefaults(bodyGlobalParameters);
        if (defaultsObject == null) {
            return body;
        }

        context.importsManager.addImportFromRoot("core/requestBody", {
            namedImports: ["mergeGlobalBodyParameters"]
        });

        return ts.factory.createCallExpression(ts.factory.createIdentifier("mergeGlobalBodyParameters"), undefined, [
            body,
            defaultsObject
        ]);
    }

    /**
     * Builds the global-defaults object literal passed to `mergeGlobalBodyParameters`,
     * nesting each parameter's resolved value under its dotted target path (so targets
     * sharing a prefix merge into a single object). Returns `undefined` when no
     * parameter has a usable target.
     */
    private buildBodyGlobalParameterDefaults(
        bodyGlobalParameters: FernIr.GlobalParameter[]
    ): ts.ObjectLiteralExpression | undefined {
        const tree: BodyDefaultsTree = new Map();
        let hasEntry = false;
        for (const globalParameter of bodyGlobalParameters) {
            const pathSegments = globalParameter.target.split(".").filter((segment) => segment.length > 0);
            if (pathSegments.length === 0) {
                continue;
            }
            hasEntry = true;
            let cursor = tree;
            for (let i = 0; i < pathSegments.length - 1; i++) {
                const segment = pathSegments[i] as string;
                const existing = cursor.get(segment);
                if (existing instanceof Map) {
                    cursor = existing;
                } else {
                    const next: BodyDefaultsTree = new Map();
                    cursor.set(segment, next);
                    cursor = next;
                }
            }
            cursor.set(
                pathSegments[pathSegments.length - 1] as string,
                getResolvedGlobalParameterValueExpression(globalParameter, this.case)
            );
        }
        if (!hasEntry) {
            return undefined;
        }
        return bodyDefaultsTreeToObjectLiteral(tree);
    }

    private getFallbackContentType(): string | undefined {
        const requestBodyType = this.requestBody?.type ?? "undefined";
        switch (requestBodyType) {
            case "inlinedRequestBody":
                return "application/json";
            case "reference":
                return "application/json";
            case "undefined":
                return undefined;
            default:
                assertNever(requestBodyType);
        }
    }

    private getRequestType(): "json" | "form" | undefined {
        const contentType = this.requestBody?.contentType;
        if (contentType === "application/x-www-form-urlencoded") {
            return "form";
        }

        const requestBodyType = this.requestBody?.type ?? "undefined";
        switch (requestBodyType) {
            case "inlinedRequestBody":
                return "json";
            case "reference":
                return "json";
            case "undefined":
                return undefined;
            default:
                assertNever(requestBodyType);
        }
    }

    private initializeHeaders(context: FileContext): ts.Statement[] {
        return generateHeaders({
            context,
            intermediateRepresentation: this.ir,
            requestParameter: this.requestParameter,
            generatedSdkClientClass: this.generatedSdkClientClass,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            service: this.service,
            endpoint: this.endpoint
        });
    }

    private getSerializedRequestBodyWithNullCheck(context: FileContext): ts.Expression | undefined {
        if (this.requestParameter == null || this.requestBody == null) {
            return undefined;
        }
        const referenceToRequestBody = this.requestParameter.getReferenceToRequestBody(context);
        if (referenceToRequestBody == null) {
            return undefined;
        }

        const serializedRequestBody = this.getSerializedRequestBodyWithoutNullCheck(
            this.requestBody,
            referenceToRequestBody,
            context
        );
        return this.mergeAdditionalBodyParameters(serializedRequestBody, context);
    }

    /**
     * Wraps the serialized request body so that caller-supplied `requestOptions.additionalBodyParameters`
     * are spread on top of the endpoint body (per-call properties win). When the option is absent
     * at runtime the helper returns the body unchanged, so this is a no-op for callers that don't
     * use it. Only emitted for endpoints that carry a body, so bodyless requests are never
     * fabricated into an object.
     */
    private mergeAdditionalBodyParameters(body: ts.Expression, context: FileContext): ts.Expression {
        context.importsManager.addImportFromRoot("core/requestBody", {
            namedImports: ["mergeAdditionalBodyParameters"]
        });
        return ts.factory.createCallExpression(
            ts.factory.createIdentifier("mergeAdditionalBodyParameters"),
            undefined,
            [
                body,
                ts.factory.createPropertyAccessChain(
                    ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    ts.factory.createIdentifier(REQUEST_OPTIONS_ADDITIONAL_BODY_PARAMETERS_PROPERTY_NAME)
                )
            ]
        );
    }

    private getSerializedRequestBodyWithoutNullCheck(
        requestBody: FernIr.HttpRequestBody.InlinedRequestBody | FernIr.HttpRequestBody.Reference,
        referenceToRequestBody: ts.Expression,
        context: FileContext
    ): ts.Expression {
        switch (requestBody.type) {
            case "inlinedRequestBody": {
                const serializeExpression = context.sdkInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
                return this.serializeInlinedRequestBodyWithLiterals({
                    inlinedRequestBody: requestBody,
                    serializeExpression,
                    context
                });
            }
            case "reference":
                return context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            default:
                assertNever(requestBody);
        }
    }

    private serializeInlinedRequestBodyWithLiterals({
        inlinedRequestBody,
        serializeExpression,
        context
    }: {
        inlinedRequestBody: FernIr.InlinedRequestBody;
        serializeExpression: ts.Expression;
        context: FileContext;
    }): ts.Expression {
        const literalProperties = this.getLiteralProperties({ inlinedRequestBody, context });
        if (literalProperties.length > 0) {
            return ts.factory.createObjectLiteralExpression([
                ts.factory.createSpreadAssignment(ts.factory.createParenthesizedExpression(serializeExpression)),
                ...literalProperties.map((property) => {
                    return ts.factory.createPropertyAssignment(
                        getPropertyKey(property.propertyWireKey),
                        typeof property.propertyValue === "string"
                            ? ts.factory.createStringLiteral(property.propertyValue)
                            : property.propertyValue
                              ? ts.factory.createTrue()
                              : ts.factory.createFalse()
                    );
                })
            ]);
        } else {
            return serializeExpression;
        }
    }

    private getLiteralProperties({
        inlinedRequestBody,
        context
    }: {
        inlinedRequestBody: FernIr.InlinedRequestBody;
        context: FileContext;
    }): LiteralPropertyValue[] {
        const result: LiteralPropertyValue[] = [];
        for (const property of inlinedRequestBody.properties) {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
                result.push({
                    propertyValue: resolvedType.container.literal._visit<boolean | string>({
                        string: (val: string) => val,
                        boolean: (val: boolean) => val,
                        _other: () => {
                            throw new Error("Encountered non-boolean, non-string literal");
                        }
                    }),
                    propertyWireKey: getWireValue(property.name)
                });
            }
        }
        return result;
    }

    public getReferenceToRequestBody(context: FileContext): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to path parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }

    public getQueryParams(context: FileContext): GeneratedQueryParams {
        if (this.queryParams == null) {
            this.queryParams = new GeneratedQueryParams({
                queryParameters: this.requestParameter?.getAllQueryParameters(context),
                referenceToQueryParameterProperty: (key, context) => this.getReferenceToQueryParameter(key, context),
                globalQueryParameters: getGlobalParametersForEndpoint({
                    ir: this.ir,
                    endpoint: this.endpoint,
                    location: FernIr.GlobalParameterLocation.Query,
                    context
                }).map((param) => ({
                    wireName: param.target,
                    value: getResolvedGlobalParameterValueExpressionForWire(param, context)
                }))
            });
        }
        return this.queryParams;
    }
}
