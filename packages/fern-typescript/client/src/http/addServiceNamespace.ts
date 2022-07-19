import { HttpService } from "@fern-fern/ir-model/services";
import {
    DependencyManager,
    getReferenceToFernServiceUtilsType,
    getTextOfTsKeyword,
    getTextOfTsNode,
} from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { InterfaceDeclaration, ModuleDeclaration, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { doesServiceHaveBasicAuth, doesServiceHaveBearerAuth, doesServiceHaveHeaders } from "./utils";

export function addServiceNamespace({
    serviceFile,
    service,
    modelContext,
    dependencyManager,
}: {
    serviceFile: SourceFile;
    service: HttpService;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): void {
    const module = serviceFile.addModule({
        name: service.name.name,
        isExported: true,
        hasDeclareKeyword: true,
    });

    const initInterface = module.addInterface({
        name: ClientConstants.HttpService.ServiceNamespace.Init.TYPE_NAME,
        properties: [
            {
                name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.ORIGIN,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.FETCHER,
                type: getTextOfTsNode(
                    getReferenceToFernServiceUtilsType({
                        type: "Fetcher",
                        dependencyManager,
                        referencedIn: serviceFile,
                    })
                ),
                hasQuestionToken: true,
            },
        ],
    });

    maybeAddBasicAuthProperties({ service, dependencyManager, serviceFile, initInterface });
    maybeAddBearerTokenProperty({ service, dependencyManager, serviceFile, initInterface });
    maybeAddHeaders({ service, initInterface, module, modelContext, dependencyManager });
}

function maybeAddBasicAuthProperties({
    service,
    dependencyManager,
    serviceFile,
    initInterface,
}: {
    service: HttpService;
    dependencyManager: DependencyManager;
    serviceFile: SourceFile;
    initInterface: InterfaceDeclaration;
}) {
    const authInfo = doesServiceHaveBasicAuth(service);
    if (!authInfo.hasAuth) {
        return;
    }

    const referenceToBasicAuthType = getReferenceToFernServiceUtilsType({
        type: "BasicAuth",
        dependencyManager,
        referencedIn: serviceFile,
    });

    initInterface.addProperty({
        name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.BASIC_AUTH,
        hasQuestionToken: authInfo.isOptional,
        type: getTextOfTsNode(
            getReferenceToFernServiceUtilsType({
                type: "Supplier",
                typeArguments: [
                    authInfo.isOptional
                        ? ts.factory.createUnionTypeNode([
                              referenceToBasicAuthType,
                              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                          ])
                        : referenceToBasicAuthType,
                ],
                dependencyManager,
                referencedIn: serviceFile,
            })
        ),
    });
}

function maybeAddBearerTokenProperty({
    service,
    dependencyManager,
    serviceFile,
    initInterface,
}: {
    service: HttpService;
    dependencyManager: DependencyManager;
    serviceFile: SourceFile;
    initInterface: InterfaceDeclaration;
}) {
    const authInfo = doesServiceHaveBearerAuth(service);
    if (!authInfo.hasAuth) {
        return;
    }

    const referenceToTokenType = getReferenceToFernServiceUtilsType({
        type: "BearerToken",
        dependencyManager,
        referencedIn: serviceFile,
    });

    initInterface.addProperty({
        name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.BEARER_TOKEN,
        hasQuestionToken: authInfo.isOptional,
        type: getTextOfTsNode(
            getReferenceToFernServiceUtilsType({
                type: "Supplier",
                typeArguments: [
                    authInfo.isOptional
                        ? ts.factory.createUnionTypeNode([
                              referenceToTokenType,
                              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                          ])
                        : referenceToTokenType,
                ],
                dependencyManager,
                referencedIn: serviceFile,
            })
        ),
    });
}

function maybeAddHeaders({
    service,
    initInterface,
    module,
    modelContext,
    dependencyManager,
}: {
    service: HttpService;
    initInterface: InterfaceDeclaration;
    module: ModuleDeclaration;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}) {
    if (doesServiceHaveHeaders(service)) {
        initInterface.addProperty({
            name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.HEADERS,
            type: ClientConstants.HttpService.ServiceNamespace.Headers.TYPE_NAME,
        });

        module.addInterface({
            name: ClientConstants.HttpService.ServiceNamespace.Headers.TYPE_NAME,
            properties: service.headers.map((header) => ({
                name: `"${header.header}"`,
                type: getTextOfTsNode(
                    getReferenceToFernServiceUtilsType({
                        type: "Supplier",
                        dependencyManager,
                        referencedIn: module.getSourceFile(),
                        typeArguments: [
                            modelContext.getReferenceToType({
                                reference: header.valueType,
                                referencedIn: module.getSourceFile(),
                            }),
                        ],
                    })
                ),
            })),
        });
    }
}
