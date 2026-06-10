import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Extended type for InlinedRequestBody with unwrapPath (IR 67.4.0+).
 * The published @fern-fern/ir-sdk may not yet include this field,
 * but it is present at runtime when produced by the current CLI.
 */
interface InlinedRequestBodyWithUnwrap extends FernIr.InlinedRequestBody {
    unwrapPath?: string[];
}

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
            body: this.getSerializedRequestBodyWithNullCheck(context),
            contentType: this.requestBody?.contentType ?? this.getFallbackContentType(),
            requestType: this.getRequestType()
        };
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

        return this.getSerializedRequestBodyWithoutNullCheck(this.requestBody, referenceToRequestBody, context);
    }

    private getSerializedRequestBodyWithoutNullCheck(
        requestBody: FernIr.HttpRequestBody.InlinedRequestBody | FernIr.HttpRequestBody.Reference,
        referenceToRequestBody: ts.Expression,
        context: FileContext
    ): ts.Expression {
        switch (requestBody.type) {
            case "inlinedRequestBody": {
                const bodyWithUnwrap = requestBody as InlinedRequestBodyWithUnwrap;
                if (bodyWithUnwrap.unwrapPath != null && bodyWithUnwrap.unwrapPath.length > 0) {
                    return this.buildUnwrappedRequestBodyExpression(bodyWithUnwrap, referenceToRequestBody, context);
                }
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

    private buildUnwrappedRequestBodyExpression(
        inlinedRequestBody: InlinedRequestBodyWithUnwrap,
        referenceToRequestBody: ts.Expression,
        context: FileContext
    ): ts.Expression {
        const unwrapPath = inlinedRequestBody.unwrapPath ?? [];
        const requestWrapper = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);

        // Collect the chain of type declarations along the unwrap path
        interface PathLevelInfo {
            properties: FernIr.ObjectProperty[];
            pathSegment: string;
        }
        const levels: PathLevelInfo[] = [];

        // First level starts from the inlined request body properties (also search extends)
        let firstPathProp: FernIr.InlinedRequestBodyProperty | FernIr.ObjectProperty | undefined =
            inlinedRequestBody.properties.find((p) => getWireValue(p.name) === unwrapPath[0]);
        if (firstPathProp == null) {
            for (const extension of inlinedRequestBody.extends) {
                const extProps = this.resolveObjectPropertiesFromNamedType(extension, context);
                if (extProps != null) {
                    const found = extProps.find((p) => getWireValue(p.name) === unwrapPath[0]);
                    if (found != null) {
                        firstPathProp = found;
                        break;
                    }
                }
            }
        }
        if (firstPathProp == null) {
            return referenceToRequestBody;
        }

        const firstSegment = unwrapPath[0];
        if (firstSegment == null) {
            return referenceToRequestBody;
        }

        let firstLevelProps = this.resolveAllObjectProperties(firstPathProp.valueType, context);
        if (firstLevelProps == null) {
            return referenceToRequestBody;
        }
        levels.push({ properties: firstLevelProps, pathSegment: firstSegment });

        let currentLevelProps = firstLevelProps;
        for (let i = 1; i < unwrapPath.length; i++) {
            const segment = unwrapPath[i];
            if (segment == null) {
                return referenceToRequestBody;
            }
            const pathProp = currentLevelProps.find((p) => getWireValue(p.name) === segment);
            if (pathProp == null) {
                return referenceToRequestBody;
            }
            const nextProps = this.resolveAllObjectProperties(pathProp.valueType, context);
            if (nextProps == null) {
                return referenceToRequestBody;
            }
            currentLevelProps = nextProps;
            levels.push({ properties: currentLevelProps, pathSegment: segment });
        }

        // Build set of top-level wire names to skip collisions in leaf loop
        const topLevelWireNames = new Set<string>();
        for (const prop of inlinedRequestBody.properties) {
            if (getWireValue(prop.name) === unwrapPath[0]) {
                continue;
            }
            if (this.getAutoFillExpression(prop, context) != null) {
                continue;
            }
            topLevelWireNames.add(getWireValue(prop.name));
        }
        for (const extension of inlinedRequestBody.extends) {
            const extProps = this.resolveObjectPropertiesFromNamedType(extension, context);
            if (extProps != null) {
                for (const prop of extProps) {
                    if (this.getAutoFillExpression(prop, context) != null) {
                        continue;
                    }
                    topLevelWireNames.add(getWireValue(prop.name));
                }
            }
        }

        // Build leaf object: map flat request properties to wire-format keys
        const leafProps = currentLevelProps;
        const leafAssignments: ts.ObjectLiteralElementLike[] = [];
        for (const prop of leafProps) {
            if (topLevelWireNames.has(getWireValue(prop.name))) {
                continue;
            }
            const autoFillExpr = this.getAutoFillExpression(prop, context);
            if (autoFillExpr != null) {
                leafAssignments.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(getWireValue(prop.name)),
                        autoFillExpr
                    )
                );
            } else {
                const sdkName = requestWrapper.getPropertyNameOfTypeDeclarationProperty(prop).propertyName;
                leafAssignments.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(getWireValue(prop.name)),
                        ts.factory.createPropertyAccessExpression(referenceToRequestBody, sdkName)
                    )
                );
            }
        }
        let currentExpr: ts.Expression = ts.factory.createObjectLiteralExpression(leafAssignments, true);

        // Wrap with intermediate levels (from leaf-1 up to level 0)
        for (let i = levels.length - 2; i >= 0; i--) {
            const level = levels[i];
            const nextLevel = levels[i + 1];
            if (level == null || nextLevel == null) {
                continue;
            }
            const nextPathSegment = nextLevel.pathSegment;
            const assignments: ts.ObjectLiteralElementLike[] = [];

            // Include auto-fillable properties (literals, single-value enums)
            // at intermediate levels — they are not exposed in the SDK interface.
            for (const prop of level.properties) {
                if (getWireValue(prop.name) === nextPathSegment) {
                    continue;
                }
                const autoFillExpr = this.getAutoFillExpression(prop, context);
                if (autoFillExpr != null) {
                    assignments.push(
                        ts.factory.createPropertyAssignment(
                            ts.factory.createStringLiteral(getWireValue(prop.name)),
                            autoFillExpr
                        )
                    );
                }
            }

            // Add the nested path property pointing to the inner level
            assignments.push(
                ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(nextPathSegment), currentExpr)
            );

            currentExpr = ts.factory.createObjectLiteralExpression(assignments, true);
        }

        // Build top-level object with the path property and non-path top-level properties
        const topLevelAssignments: ts.ObjectLiteralElementLike[] = [];

        // Add non-path top-level properties (auto-fill literals/single-value enums, reference the rest)
        for (const prop of inlinedRequestBody.properties) {
            if (getWireValue(prop.name) === unwrapPath[0]) {
                continue;
            }
            const autoFillExpr = this.getAutoFillExpression(prop, context);
            if (autoFillExpr != null) {
                topLevelAssignments.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(getWireValue(prop.name)),
                        autoFillExpr
                    )
                );
            } else {
                const sdkName = requestWrapper.getInlinedRequestBodyPropertyKey(prop).propertyName;
                topLevelAssignments.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(getWireValue(prop.name)),
                        ts.factory.createPropertyAccessExpression(referenceToRequestBody, sdkName)
                    )
                );
            }
        }

        // Also include inherited (extends) top-level properties
        for (const extension of inlinedRequestBody.extends) {
            const extProps = this.resolveObjectPropertiesFromNamedType(extension, context);
            if (extProps != null) {
                for (const prop of extProps) {
                    const autoFillExpr = this.getAutoFillExpression(prop, context);
                    if (autoFillExpr != null) {
                        topLevelAssignments.push(
                            ts.factory.createPropertyAssignment(
                                ts.factory.createStringLiteral(getWireValue(prop.name)),
                                autoFillExpr
                            )
                        );
                    } else {
                        const sdkName = requestWrapper.getPropertyNameOfTypeDeclarationProperty(prop).propertyName;
                        topLevelAssignments.push(
                            ts.factory.createPropertyAssignment(
                                ts.factory.createStringLiteral(getWireValue(prop.name)),
                                ts.factory.createPropertyAccessExpression(referenceToRequestBody, sdkName)
                            )
                        );
                    }
                }
            }
        }

        // Add the path property (first segment of unwrapPath)
        topLevelAssignments.push(
            ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(firstSegment), currentExpr)
        );

        return ts.factory.createObjectLiteralExpression(topLevelAssignments, true);
    }

    private createLiteralExpression(literal: FernIr.Literal): ts.Expression {
        return literal._visit<ts.Expression>({
            string: (val: string) => ts.factory.createStringLiteral(val),
            boolean: (val: boolean) => (val ? ts.factory.createTrue() : ts.factory.createFalse()),
            _other: () => {
                throw new Error("Encountered non-boolean, non-string literal");
            }
        });
    }

    /**
     * Returns a constant expression if the property can be auto-filled:
     * either a container.literal or a single-value enum.
     */
    private getAutoFillExpression(
        prop: Pick<FernIr.ObjectProperty, "valueType">,
        context: FileContext
    ): ts.Expression | undefined {
        const resolvedType = context.type.resolveTypeReference(prop.valueType);
        if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
            return this.createLiteralExpression(resolvedType.container.literal);
        }
        if (prop.valueType.type === "named") {
            const typeDecl = context.type.getTypeDeclaration({
                typeId: prop.valueType.typeId,
                fernFilepath: prop.valueType.fernFilepath,
                name: prop.valueType.name,
                displayName: prop.valueType.displayName
            });
            if (typeDecl?.shape.type === "enum" && typeDecl.shape.values.length === 1) {
                const singleValue = typeDecl.shape.values[0];
                if (singleValue != null) {
                    const wireValue =
                        typeof singleValue.name === "string" ? singleValue.name : getWireValue(singleValue.name);
                    return ts.factory.createStringLiteral(wireValue);
                }
            }
        }
        return undefined;
    }

    /**
     * Resolves a type reference to its object properties, following aliases and walking extends.
     */
    private resolveAllObjectProperties(
        valueType: FernIr.TypeReference,
        context: FileContext
    ): FernIr.ObjectProperty[] | undefined {
        // Unwrap Container.Optional and Container.Nullable to extract the inner reference.
        if (valueType.type === "container") {
            if (valueType.container.type === "optional") {
                return this.resolveAllObjectProperties(valueType.container.optional, context);
            }
            if (valueType.container.type === "nullable") {
                return this.resolveAllObjectProperties(valueType.container.nullable, context);
            }
            return undefined;
        }
        if (valueType.type !== "named") {
            return undefined;
        }
        return this.resolveObjectPropertiesFromNamedType(
            {
                typeId: valueType.typeId,
                fernFilepath: valueType.fernFilepath,
                name: valueType.name,
                displayName: valueType.displayName
            },
            context
        );
    }

    private resolveObjectPropertiesFromNamedType(
        namedType: {
            typeId: string;
            fernFilepath: FernIr.FernFilepath;
            name: FernIr.NameOrString;
            displayName: string | undefined;
        },
        context: FileContext
    ): FernIr.ObjectProperty[] | undefined {
        let typeDecl = context.type.getTypeDeclaration(namedType);
        if (typeDecl == null) {
            return undefined;
        }
        // Follow alias chain
        while (typeDecl?.shape.type === "alias" && typeDecl.shape.aliasOf.type === "named") {
            typeDecl = context.type.getTypeDeclaration({
                typeId: typeDecl.shape.aliasOf.typeId,
                fernFilepath: typeDecl.shape.aliasOf.fernFilepath,
                name: typeDecl.shape.aliasOf.name,
                displayName: typeDecl.shape.aliasOf.displayName
            });
        }
        if (typeDecl?.shape.type !== "object") {
            return undefined;
        }
        const result: FernIr.ObjectProperty[] = [];
        for (const ext of typeDecl.shape.extends) {
            const extProps = this.resolveObjectPropertiesFromNamedType(ext, context);
            if (extProps != null) {
                result.push(...extProps);
            }
        }
        result.push(...typeDecl.shape.properties);
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
                referenceToQueryParameterProperty: (key, context) => this.getReferenceToQueryParameter(key, context)
            });
        }
        return this.queryParams;
    }
}
