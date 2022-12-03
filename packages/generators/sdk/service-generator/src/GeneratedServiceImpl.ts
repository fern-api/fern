import { ApiAuth, AuthScheme } from "@fern-fern/ir-model/auth";
import { HttpHeader } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { AugmentedService } from "@fern-typescript/commons-v2";
import { GeneratedService, ServiceContext } from "@fern-typescript/sdk-declaration-handler";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, Scope, ts } from "ts-morph";
import { GeneratedHeader } from "./FetcherArgsBuilder";
import { GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { GeneratedWrappedService } from "./GeneratedWrappedService";

export declare namespace GeneratedServiceImpl {
    export interface Init {
        apiAuth: ApiAuth;
        apiHeaders: HttpHeader[];
        service: AugmentedService;
        serviceClassName: string;
    }
}

export class GeneratedServiceImpl implements GeneratedService {
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static OPTIONS_PRIVATE_MEMBER = "options";
    private static ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    private static BASIC_AUTH_OPTION_PROPERTY_NAME = "credentials";
    private static BEARER_OPTION_PROPERTY_NAME = "token";

    private hasBearerAuth: boolean;
    private hasBasicAuth: boolean;
    private authHeaders: HttpHeader[];
    private apiHeaders: HttpHeader[];
    private serviceClassName: string;
    private service: AugmentedService;
    private generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private generatedWrappedServices: GeneratedWrappedService[];

    constructor({ serviceClassName, service, apiAuth, apiHeaders }: GeneratedServiceImpl.Init) {
        this.serviceClassName = serviceClassName;
        this.service = service;
        this.apiHeaders = apiHeaders;

        if (service.originalService == null) {
            this.generatedEndpointImplementations = [];
        } else {
            const { originalService } = service;
            this.generatedEndpointImplementations = service.originalService.endpoints.map(
                (endpoint) =>
                    new GeneratedEndpointImplementation({
                        endpoint,
                        service: originalService,
                        generatedService: this,
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

    public writeToFile(context: ServiceContext): void {
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
                    name: GeneratedServiceImpl.OPTIONS_PRIVATE_MEMBER,
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
            serviceClass.addMethod(endpoint.getImplementation(context));
        }

        for (const wrappedService of this.generatedWrappedServices) {
            wrappedService.addToServiceClass(serviceClass, context);
        }
    }

    public getEnvironment(context: ServiceContext): ts.Expression {
        let environment = this.getReferenceToEnvironment();
        const defaultEnvironment = context.environments.getReferenceToDefaultEnvironment();
        if (defaultEnvironment != null) {
            environment = ts.factory.createBinaryExpression(
                environment,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                defaultEnvironment
            );
        }
        return environment;
    }

    public getAuthorizationHeaders(context: ServiceContext): GeneratedHeader[] {
        const headerNameToValues: Record<string, ts.Expression[]> = {};
        if (this.hasBearerAuth) {
            const authorizationValues = (headerNameToValues.Authorization ??= []);
            authorizationValues.push(
                context.base.coreUtilities.auth.BearerToken.toAuthorizationHeader(
                    context.base.coreUtilities.fetcher.Supplier.get(
                        this.getReferenceToOption(GeneratedServiceImpl.BEARER_OPTION_PROPERTY_NAME)
                    )
                )
            );
        }

        if (this.hasBasicAuth) {
            const authorizationValues = (headerNameToValues.Authorization ??= []);
            authorizationValues.push(
                context.base.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                    context.base.coreUtilities.fetcher.Supplier.get(
                        this.getReferenceToOption(GeneratedServiceImpl.BASIC_AUTH_OPTION_PROPERTY_NAME)
                    )
                )
            );
        }

        for (const header of this.authHeaders) {
            const headerValues = (headerNameToValues[header.nameV2.wireValue] ??= []);
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
            header: header.nameV2.wireValue,
            value: this.getReferenceToOption(this.getOptionKeyForHeader(header)),
        }));
    }

    /***********
     * OPTIONS *
     ***********/

    private generateOptionsInterface(context: ServiceContext): OptionalKind<InterfaceDeclarationStructure> {
        const generatedEnvironments = context.environments.getGeneratedEnvironments();

        const properties: OptionalKind<PropertySignatureStructure>[] = [
            {
                name: GeneratedServiceImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    generatedEnvironments != null
                        ? ts.factory.createUnionTypeNode([
                              context.environments.getReferenceToEnvironmentsEnum().getTypeNode(),
                              ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                          ])
                        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                ),
                hasQuestionToken: generatedEnvironments?.defaultEnvironmentEnumMemberName != null,
            },
        ];

        if (this.hasBearerAuth) {
            properties.push({
                name: GeneratedServiceImpl.BEARER_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                        context.base.coreUtilities.auth.BearerToken._getReferenceToType()
                    )
                ),
                hasQuestionToken: true,
            });
        }

        if (this.hasBasicAuth) {
            properties.push({
                name: GeneratedServiceImpl.BASIC_AUTH_OPTION_PROPERTY_NAME,
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

        return {
            name: GeneratedServiceImpl.OPTIONS_INTERFACE_NAME,
            properties,
        };
    }

    private getReferenceToEnvironment(): ts.Expression {
        return this.getReferenceToOption(GeneratedServiceImpl.ENVIRONMENT_OPTION_PROPERTY_NAME);
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedServiceImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getOptionKeyForHeader(header: HttpHeader): string {
        return header.nameV2.name.unsafeName.camelCase;
    }
}
