import { ApiAuth, AuthScheme } from "@fern-fern/ir-model/auth";
import { HttpHeader } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { AugmentedService, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, Scope, ts } from "ts-morph";
import { GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { GeneratedHeader } from "./GeneratedHeader";
import { GeneratedNonThrowingEndpointImplementation } from "./GeneratedNonThrowingEndpointImplementation";
import { GeneratedThrowingEndpointImplementation } from "./GeneratedThrowingEndpointImplementation";
import { GeneratedWrappedService } from "./GeneratedWrappedService";

export declare namespace GeneratedSdkClientClassImpl {
    export interface Init {
        apiAuth: ApiAuth;
        apiHeaders: HttpHeader[];
        service: AugmentedService;
        serviceClassName: string;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
    }
}

export class GeneratedSdkClientClassImpl implements GeneratedSdkClientClass {
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static OPTIONS_PRIVATE_MEMBER = "options";
    private static ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    private static BASIC_AUTH_OPTION_PROPERTY_NAME = "credentials";
    private static BEARER_OPTION_PROPERTY_NAME = "token";
    private static CUSTOM_FETCHER_PROPERTY_NAME = "fetcher";

    private hasBearerAuth: boolean;
    private hasBasicAuth: boolean;
    private authHeaders: HttpHeader[];
    private apiHeaders: HttpHeader[];
    private serviceClassName: string;
    private service: AugmentedService;
    private generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private generatedWrappedServices: GeneratedWrappedService[];
    private allowCustomFetcher: boolean;

    constructor({
        serviceClassName,
        service,
        apiAuth,
        apiHeaders,
        errorResolver,
        errorDiscriminationStrategy,
        neverThrowErrors,
        includeCredentialsOnCrossOriginRequests,
        allowCustomFetcher,
    }: GeneratedSdkClientClassImpl.Init) {
        this.serviceClassName = serviceClassName;
        this.service = service;
        this.apiHeaders = apiHeaders;
        this.allowCustomFetcher = allowCustomFetcher;

        if (service.originalService == null) {
            this.generatedEndpointImplementations = [];
        } else {
            const { originalService } = service;
            this.generatedEndpointImplementations = service.originalService.endpoints.map((endpoint) =>
                neverThrowErrors
                    ? new GeneratedNonThrowingEndpointImplementation({
                          endpoint,
                          service: originalService,
                          generatedSdkClientClass: this,
                          errorResolver,
                          errorDiscriminationStrategy,
                          includeCredentialsOnCrossOriginRequests,
                      })
                    : new GeneratedThrowingEndpointImplementation({
                          endpoint,
                          service: originalService,
                          generatedSdkClientClass: this,
                          errorResolver,
                          errorDiscriminationStrategy,
                          includeCredentialsOnCrossOriginRequests,
                      })
            );
        }

        this.generatedWrappedServices = service.wrappedServices.map(
            (wrappedService) => new GeneratedWrappedService({ wrappedService, wrapperService: this })
        );

        let hasBearerAuth = false;
        let hasBasicAuth = false;
        const authHeaders: HttpHeader[] = [];
        for (const authScheme of apiAuth.schemes) {
            AuthScheme._visit(authScheme, {
                basic: () => {
                    hasBasicAuth = true;
                },
                bearer: () => {
                    hasBearerAuth = true;
                },
                header: (header) => {
                    authHeaders.push(header);
                },
                _unknown: () => {
                    throw new Error("Unknown auth scheme: " + authScheme._type);
                },
            });
        }
        this.hasBearerAuth = hasBearerAuth;
        this.hasBasicAuth = hasBasicAuth;
        this.authHeaders = authHeaders;
    }

    public instantiate({
        referenceToClient,
        referenceToOptions,
    }: {
        referenceToClient: ts.Expression;
        referenceToOptions: ts.Expression;
    }): ts.Expression {
        return ts.factory.createNewExpression(referenceToClient, undefined, [referenceToOptions]);
    }

    public writeToFile(context: SdkClientClassContext): void {
        const serviceModule = context.base.sourceFile.addModule({
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true,
        });

        const optionsInterface = serviceModule.addInterface(this.generateOptionsInterface(context));

        const serviceClass = context.base.sourceFile.addClass({
            name: this.serviceClassName,
            isExported: true,
        });
        maybeAddDocs(serviceClass, this.service.originalService?.docs);

        serviceClass.addConstructor({
            parameters: [
                {
                    name: GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER,
                    isReadonly: true,
                    scope: Scope.Private,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(serviceModule.getName()),
                                ts.factory.createIdentifier(optionsInterface.getName())
                            )
                        )
                    ),
                },
            ],
        });

        for (const endpoint of this.generatedEndpointImplementations) {
            const method = serviceClass.addMethod(endpoint.getImplementation(context));
            maybeAddDocs(method, endpoint.getDocs(context));
        }

        for (const wrappedService of this.generatedWrappedServices) {
            wrappedService.addToServiceClass(serviceClass, context);
        }
    }

    public getEnvironment(context: SdkClientClassContext): ts.Expression {
        let referenceToEnvironmentValue = this.getReferenceToEnvironment();

        const defaultEnvironment = context.environments
            .getGeneratedEnvironments()
            .getReferenceToDefaultEnvironment(context);
        if (defaultEnvironment != null) {
            referenceToEnvironmentValue = ts.factory.createBinaryExpression(
                referenceToEnvironmentValue,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                defaultEnvironment
            );
        }

        return context.environments.getGeneratedEnvironments().getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue,
            baseUrlId: this.service.originalService?.baseUrl ?? undefined,
        });
    }

    public getAuthorizationHeaders(context: SdkClientClassContext): GeneratedHeader[] {
        const headerNameToValues: Record<string, ts.Expression[]> = {};
        if (this.hasBearerAuth) {
            const authorizationValues = (headerNameToValues.Authorization ??= []);
            authorizationValues.push(
                context.base.coreUtilities.auth.BearerToken.toAuthorizationHeader(
                    context.base.coreUtilities.fetcher.Supplier.get(
                        this.getReferenceToOption(GeneratedSdkClientClassImpl.BEARER_OPTION_PROPERTY_NAME)
                    )
                )
            );
        }

        if (this.hasBasicAuth) {
            const authorizationValues = (headerNameToValues.Authorization ??= []);
            authorizationValues.push(
                context.base.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                    context.base.coreUtilities.fetcher.Supplier.get(
                        this.getReferenceToOption(GeneratedSdkClientClassImpl.BASIC_AUTH_OPTION_PROPERTY_NAME)
                    )
                )
            );
        }

        for (const header of this.authHeaders) {
            const headerValues = (headerNameToValues[header.name.wireValue] ??= []);
            headerValues.push(
                context.base.coreUtilities.fetcher.Supplier.get(
                    this.getReferenceToOption(this.getOptionKeyForHeader(header))
                )
            );
        }

        const headerElements: GeneratedHeader[] = [];
        for (const [headerName, [firstHeaderValue, ...remainingHeaderValues]] of Object.entries(headerNameToValues)) {
            if (firstHeaderValue == null) {
                continue;
            }
            headerElements.push({
                header: headerName,
                value: remainingHeaderValues.reduce((acc, headerValue) => {
                    return ts.factory.createBinaryExpression(
                        acc,
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        headerValue
                    );
                }, firstHeaderValue),
            });
        }

        return headerElements;
    }

    public getApiHeaders(): GeneratedHeader[] {
        return this.apiHeaders.map((header) => ({
            header: header.name.wireValue,
            value: this.getReferenceToOption(this.getOptionKeyForHeader(header)),
        }));
    }

    /***********
     * OPTIONS *
     ***********/

    private generateOptionsInterface(context: SdkClientClassContext): OptionalKind<InterfaceDeclarationStructure> {
        const generatedEnvironments = context.environments.getGeneratedEnvironments();

        const properties: OptionalKind<PropertySignatureStructure>[] = [
            {
                name: GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(generatedEnvironments.getTypeForUserSuppliedEnvironment(context)),
                hasQuestionToken: generatedEnvironments.hasDefaultEnvironment(),
            },
        ];

        if (this.hasBearerAuth) {
            properties.push({
                name: GeneratedSdkClientClassImpl.BEARER_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                        ts.factory.createUnionTypeNode([
                            context.base.coreUtilities.auth.BearerToken._getReferenceToType(),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                        ])
                    )
                ),
                hasQuestionToken: true,
            });
        }

        if (this.hasBasicAuth) {
            properties.push({
                name: GeneratedSdkClientClassImpl.BASIC_AUTH_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                        context.base.coreUtilities.auth.BasicAuth._getReferenceToType()
                    )
                ),
                hasQuestionToken: true,
            });
        }

        for (const header of this.authHeaders) {
            properties.push({
                name: this.getOptionKeyForHeader(header),
                type: getTextOfTsNode(
                    context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                        context.type.getReferenceToType(header.valueType).typeNodeWithoutUndefined
                    )
                ),
                hasQuestionToken: true,
            });
        }

        for (const header of this.apiHeaders) {
            const type = context.type.getReferenceToType(header.valueType);
            properties.push({
                name: this.getOptionKeyForHeader(header),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            });
        }

        if (this.allowCustomFetcher) {
            properties.push({
                name: GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME,
                type: getTextOfTsNode(context.base.coreUtilities.fetcher.FetchFunction._getReferenceToType()),
                hasQuestionToken: true,
            });
        }

        return {
            name: GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME,
            properties,
        };
    }

    private getReferenceToEnvironment(): ts.Expression {
        return this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME);
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToFetcher(context: SdkClientClassContext): ts.Expression {
        if (this.allowCustomFetcher) {
            return ts.factory.createBinaryExpression(
                this.getReferenceToOption(GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                context.base.coreUtilities.fetcher.fetcher._getReferenceTo()
            );
        } else {
            return context.base.coreUtilities.fetcher.fetcher._getReferenceTo();
        }
    }

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getOptionKeyForHeader(header: HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }
}
