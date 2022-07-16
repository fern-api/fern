import { HttpAuth, HttpService } from "@fern-fern/ir-model/services";
import {
    DependencyManager,
    getReferenceToFernServiceUtilsType,
    getTextOfTsKeyword,
    getTextOfTsNode,
} from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { InterfaceDeclaration, ModuleDeclaration, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { doesServiceHaveAuth, doesServiceHaveHeaders } from "./utils";

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

    maybeAddTokenProperty({ service, dependencyManager, serviceFile, initInterface });
    maybeAddHeaders({ service, initInterface, module, modelContext, dependencyManager });
}

function maybeAddTokenProperty({
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
    const authInfo = doesServiceHaveAuth(service);
    if (!authInfo.hasAuth) {
        return;
    }

    const referenceToTokenType = getReferenceToFernServiceUtilsType({
        type: authInfo.authType === HttpAuth.Bearer ? "BearerToken" : "BasicAuth",
        dependencyManager,
        referencedIn: serviceFile,
    });

    initInterface.addProperty({
        name: ClientConstants.HttpService.ServiceNamespace.Init.Properties.TOKEN,
        hasQuestionToken: authInfo.isOptional,
        type: getTextOfTsNode(
            getReferenceToFernServiceUtilsType({
                type: "MaybeGetter",
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
                        type: "MaybeGetter",
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
