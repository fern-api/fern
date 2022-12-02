import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { AugmentedService } from "@fern-typescript/commons-v2";
import { GeneratedService, ServiceContext } from "@fern-typescript/sdk-declaration-handler";
import { Scope, ts } from "ts-morph";
import { GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { GeneratedWrappedService } from "./GeneratedWrappedService";

export declare namespace GeneratedServiceImpl {
    export interface Init {
        service: AugmentedService;
        serviceClassName: string;
    }
}

export class GeneratedServiceImpl implements GeneratedService {
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static ORIGIN_OPTION_PROPERTY_NAME = "origin";
    private static OPTIONS_PRIVATE_MEMBER = "options";

    private serviceClassName: string;
    private service: AugmentedService;
    private generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private generatedWrappedServices: GeneratedWrappedService[];

    constructor({ serviceClassName, service }: GeneratedServiceImpl.Init) {
        this.serviceClassName = serviceClassName;
        this.service = service;

        if (service.originalService == null) {
            this.generatedEndpointImplementations = [];
        } else {
            const { originalService } = service;
            this.generatedEndpointImplementations = service.originalService.endpoints.map(
                (endpoint) => new GeneratedEndpointImplementation({ endpoint, service: originalService })
            );
        }

        this.generatedWrappedServices = service.wrappedServices.map(
            (wrappedService) => new GeneratedWrappedService({ wrappedService, wrapperService: this })
        );
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

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedServiceImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public writeToFile(context: ServiceContext): void {
        const serviceModule = context.base.sourceFile.addModule({
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true,
        });

        const generatedEnvironments = context.environments.getGeneratedEnvironments();

        const optionsInterface = serviceModule.addInterface({
            name: GeneratedServiceImpl.OPTIONS_INTERFACE_NAME,
            properties: [
                {
                    name: GeneratedServiceImpl.ORIGIN_OPTION_PROPERTY_NAME,
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
            ],
        });

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
}
