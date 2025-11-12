import {
    ExampleEndpointCall,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    IntermediateRepresentation
} from "@fern-fern/ir-sdk/api";
import {
    ExportsManager,
    Fetcher,
    GetReferenceOpts,
    getParameterNameForPositionalPathParameter,
    getTextOfTsNode,
    PackageId
} from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { generateHeaders, HEADERS_VAR_NAME } from "../endpoints/utils/generateHeaders";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter";
import { isPathOnlyEndpoint } from "../request-parameter/isPathOnlyEndpoint";
import { PathOnlyRequestParameter } from "../request-parameter/PathOnlyRequestParameter";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace GeneratedBytesEndpointRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.Bytes;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        retainOriginalCasing: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        exportsManager: ExportsManager;
    }
}

export class GeneratedBytesEndpointRequest implements GeneratedEndpointRequest {
    private static readonly BINARY_UPLOAD_REQUEST_VARIABLE_NAME = "_binaryUploadRequest";
    private static readonly UPLOADABLE_PARAMETER_NAME = "uploadable";

    private readonly ir: IntermediateRepresentation;
    private readonly packageId: PackageId;
    private readonly requestParameter: FileUploadRequestParameter | undefined;
    private pathOnlyRequestParameter: PathOnlyRequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private readonly service: HttpService;
    private readonly endpoint: HttpEndpoint;
    private readonly requestBody: HttpRequestBody.Bytes;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly retainOriginalCasing: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";

    constructor({
        ir,
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        retainOriginalCasing,
        parameterNaming
    }: GeneratedBytesEndpointRequest.Init) {
        this.ir = ir;
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.retainOriginalCasing = retainOriginalCasing;
        this.parameterNaming = parameterNaming;

        if (this.endpoint.sdkRequest == null) {
            throw new Error("SdkRequest is not defined for bytes endpoint");
        }

        // You have query parameters
        if (this.endpoint.sdkRequest.shape.type === "wrapper") {
            this.requestParameter = new FileUploadRequestParameter({
                packageId,
                service,
                endpoint,
                sdkRequest: this.endpoint.sdkRequest
            });
        }
    }

    /**
     * Ensures that a path-only request parameter exists when inlinePathParameters is "always"
     * but there's no wrapper request parameter. Creates a synthetic PathOnlyRequestParameter in this case.
     */
    private ensureRequestParameter(context: SdkContext): void {
        if (
            this.requestParameter == null &&
            this.pathOnlyRequestParameter == null &&
            context.requestWrapper.shouldInlinePathParameters(this.endpoint.sdkRequest) &&
            isPathOnlyEndpoint(this.service, this.endpoint)
        ) {
            this.pathOnlyRequestParameter = new PathOnlyRequestParameter({
                packageId: this.packageId,
                service: this.service,
                endpoint: this.endpoint
            });
        }
    }

    public getRequestParameter(context: SdkContext): ts.TypeNode | undefined {
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        return rp?.getType(context);
    }

    public getExampleEndpointImports(): ts.Statement[] {
        return [
            ts.factory.createImportDeclaration(
                undefined,
                [],
                ts.factory.createImportClause(
                    false,
                    undefined,
                    ts.factory.createNamedImports([
                        ts.factory.createImportSpecifier(
                            false,
                            undefined,
                            ts.factory.createIdentifier("createReadStream")
                        )
                    ])
                ),
                ts.factory.createStringLiteral("fs"),
                undefined
            )
        ];
    }

    public getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined {
        this.ensureRequestParameter(context);
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const result: ts.Expression[] = [
            ts.factory.createCallExpression(ts.factory.createIdentifier("createReadStream"), undefined, [
                ts.factory.createStringLiteral("path/to/file")
            ])
        ];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            const exampleParameter = exampleParameters.find(
                (param) => param.name.originalName === pathParameter.name.originalName
            );
            if (exampleParameter == null) {
                result.push(ts.factory.createIdentifier("undefined"));
            } else {
                const generatedExample = context.type.getGeneratedExample(exampleParameter.value);
                result.push(generatedExample.build(context, opts));
            }
        }
        if (rp != null) {
            const requestParameterExample = rp.generateExample({ context, example, opts });
            if (
                requestParameterExample != null &&
                getTextOfTsNode(requestParameterExample) === "{}" &&
                rp.isOptional({ context })
            ) {
                // pass
            } else if (requestParameterExample != null) {
                result.push(requestParameterExample);
            } else if (!rp.isOptional({ context })) {
                return undefined;
            }
        }

        return result;
    }

    public getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        this.ensureRequestParameter(context);
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [
            {
                name: GeneratedBytesEndpointRequest.UPLOADABLE_PARAMETER_NAME,
                type: getTextOfTsNode(this.getFileParameterType(context))
            }
        ];

        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            parameters.push({
                name: getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing,
                    parameterNaming: this.parameterNaming
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode)
            });
        }

        if (rp != null) {
            parameters.push(rp.getParameterDeclaration(context));
        }

        return parameters;
    }

    private getFileParameterType(context: SdkContext): ts.TypeNode {
        const types: ts.TypeNode[] = [context.coreUtilities.fileUtils.Uploadable._getReferenceToType()];

        if (this.requestBody.isOptional) {
            types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
        }

        return ts.factory.createUnionTypeNode(types);
    }

    public getBuildRequestStatements(context: SdkContext): ts.Statement[] {
        this.ensureRequestParameter(context);
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        const statements: ts.Statement[] = [];

        if (rp != null) {
            statements.push(
                ...rp.getInitialStatements(context, {
                    variablesInScope: this.getEndpointParameters(context).map((param) => param.name)
                })
            );
        }

        const queryParams = this.getQueryParams(context);
        if (queryParams != null) {
            statements.push(...queryParams.getBuildStatements(context));
        }

        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedBytesEndpointRequest.BINARY_UPLOAD_REQUEST_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.coreUtilities.fileUtils.toBinaryUploadRequest._invoke(
                                ts.factory.createIdentifier(GeneratedBytesEndpointRequest.UPLOADABLE_PARAMETER_NAME)
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        statements.push(...this.initializeHeaders(context));

        return statements;
    }

    public getFetcherRequestArgs(
        context: SdkContext
    ): Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "requestType" | "duplex"> {
        return {
            headers: ts.factory.createIdentifier(HEADERS_VAR_NAME),
            queryParameters: this.getQueryParams(context)?.getReferenceTo(),
            contentType: this.requestBody.contentType,
            requestType: "bytes",
            body: ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedBytesEndpointRequest.BINARY_UPLOAD_REQUEST_VARIABLE_NAME),
                "body"
            ),
            duplex: ts.factory.createStringLiteral("half")
        };
    }

    private initializeHeaders(context: SdkContext): ts.Statement[] {
        return generateHeaders({
            context,
            intermediateRepresentation: this.ir,
            requestParameter: this.requestParameter,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            generatedSdkClientClass: this.generatedSdkClientClass,
            service: this.service,
            endpoint: this.endpoint,
            headersToMergeAfterClientOptionsHeaders: [
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(GeneratedBytesEndpointRequest.BINARY_UPLOAD_REQUEST_VARIABLE_NAME),
                    "headers"
                )
            ]
        });
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        return rp?.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        this.ensureRequestParameter(context);
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        if (rp == null) {
            throw new Error("Cannot get reference to path parameter because request parameter is not defined.");
        }
        return rp.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        this.ensureRequestParameter(context);
        const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
        if (rp == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return rp.getReferenceToQueryParameter(queryParameterKey, context);
    }

    public getQueryParams(context: SdkContext): GeneratedQueryParams {
        if (this.queryParams == null) {
            const rp = this.requestParameter ?? this.pathOnlyRequestParameter;
            this.queryParams = new GeneratedQueryParams({
                queryParameters: rp?.getAllQueryParameters(context),
                referenceToQueryParameterProperty: (key, context) => this.getReferenceToQueryParameter(key, context)
            });
        }
        return this.queryParams;
    }
}
