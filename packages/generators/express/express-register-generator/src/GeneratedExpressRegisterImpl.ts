import { Name } from "@fern-fern/ir-model/commons";
import { HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { convertHttpPathToExpressRoute, getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressRegisterContext, GeneratedExpressRegister } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace GeneratedExpressRegisterImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        registerFunctionName: string;
        areImplementationsOptional: boolean;
    }
}

export class GeneratedExpressRegisterImpl implements GeneratedExpressRegister {
    private static EXPRESS_APP_PARAMETER_NAME = "expressApp";
    private static EXPRESS_SERVICES_PARAMETER_NAME = "services";

    private intermediateRepresentation: IntermediateRepresentation;
    private registerFunctionName: string;
    private areImplementationsOptional: boolean;
    private servicesTree: ServicesTree;

    constructor({
        intermediateRepresentation,
        registerFunctionName,
        areImplementationsOptional,
    }: GeneratedExpressRegisterImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.registerFunctionName = registerFunctionName;
        this.areImplementationsOptional = areImplementationsOptional;
        this.servicesTree = buildServicesTree(intermediateRepresentation);
    }

    public writeToFile(context: ExpressRegisterContext): void {
        context.base.sourceFile.addFunction({
            isExported: true,
            name: this.registerFunctionName,
            parameters: [
                {
                    name: GeneratedExpressRegisterImpl.EXPRESS_APP_PARAMETER_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createUnionTypeNode([
                            context.base.externalDependencies.express.Express(),
                            context.base.externalDependencies.express.Router._getReferenceToType(),
                        ])
                    ),
                },
                {
                    name: GeneratedExpressRegisterImpl.EXPRESS_SERVICES_PARAMETER_NAME,
                    type: getTextOfTsNode(this.constructLiteralTypeNodeForServicesTree(this.servicesTree, context)),
                },
            ],
            returnType: "void",
            statements: Object.values(this.intermediateRepresentation.services)
                .map((service) => {
                    let statement: ts.Statement = ts.factory.createExpressionStatement(
                        context.base.externalDependencies.express.App.use({
                            referenceToApp: ts.factory.createParenthesizedExpression(
                                ts.factory.createAsExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedExpressRegisterImpl.EXPRESS_APP_PARAMETER_NAME
                                    ),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                )
                            ),
                            path: ts.factory.createStringLiteral(convertHttpPathToExpressRoute(service.basePath)),
                            router: context.expressService
                                .getGeneratedExpressService(service.name)
                                .toRouter(this.getReferenceToServiceArgument(service)),
                        })
                    );
                    if (this.areImplementationsOptional) {
                        statement = ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                this.getReferenceToServiceArgument(service, { includeQuestionMarks: true }),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock([statement], true)
                        );
                    }
                    return statement;
                })
                .map(getTextOfTsNode),
        });
    }

    private getReferenceToServiceArgument(
        service: HttpService,
        { includeQuestionMarks = false }: { includeQuestionMarks?: boolean } = {}
    ) {
        return service.name.fernFilepath.allParts.reduce<ts.Expression>(
            (acc, part) =>
                ts.factory.createPropertyAccessChain(
                    acc,
                    includeQuestionMarks ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken) : undefined,
                    getKeyForFernFilepathPart(part)
                ),
            ts.factory.createIdentifier(GeneratedExpressRegisterImpl.EXPRESS_SERVICES_PARAMETER_NAME)
        );
    }

    private getServiceKey(service: HttpService) {
        const lastFernFilepathPart = service.name.fernFilepath.allParts[service.name.fernFilepath.allParts.length - 1];
        if (lastFernFilepathPart == null) {
            throw new Error("Cannot generate register() because fern filepath is empty");
        }
        return getKeyForFernFilepathPart(lastFernFilepathPart);
    }

    private constructLiteralTypeNodeForServicesTree(
        root: ServicesTree,
        context: ExpressRegisterContext
    ): ts.TypeLiteralNode {
        return ts.factory.createTypeLiteralNode([
            ...root.services.map((service) =>
                ts.factory.createPropertySignature(
                    undefined,
                    this.getServiceKey(service),
                    this.areImplementationsOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    context.expressService
                        .getReferenceToExpressService(service.name, {
                            importAlias: this.getImportAliasForService(service),
                        })
                        .getTypeNode()
                )
            ),
            ...root.folders.map((folder) =>
                ts.factory.createPropertySignature(
                    undefined,
                    folder.name,
                    this.areImplementationsOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    this.constructLiteralTypeNodeForServicesTree(folder, context)
                )
            ),
        ]);
    }

    private getImportAliasForService(service: HttpService): string {
        const lastPart = service.name.fernFilepath.allParts[service.name.fernFilepath.allParts.length - 1];
        return [
            ...service.name.fernFilepath.packagePath.map((part) => part.camelCase.unsafeName),
            `${lastPart != null ? lastPart.pascalCase.unsafeName : "Root"}Service`,
        ].join("_");
    }
}

interface ServicesTree {
    services: HttpService[];
    folders: ServicesTreeFolderNode[];
}

interface ServicesTreeFolderNode extends ServicesTree {
    name: string;
}

function buildServicesTree(intermediateRepresentation: IntermediateRepresentation): ServicesTree {
    const tree: ServicesTree = {
        services: [],
        folders: [],
    };

    for (const service of Object.values(intermediateRepresentation.services)) {
        let treeForService = tree;

        for (let i = 0; i < service.name.fernFilepath.allParts.length - 1; i++) {
            const name = getKeyForFernFilepathPart(service.name.fernFilepath.allParts[i]!);
            let subTree: ServicesTreeFolderNode | undefined = treeForService.folders.find(
                (other) => other.name === name
            );
            if (subTree == null) {
                subTree = {
                    name,
                    services: [],
                    folders: [],
                };
                treeForService.folders.push(subTree);
            }
            treeForService = subTree;
        }

        treeForService.services.push(service);
    }

    return tree;
}

function getKeyForFernFilepathPart(part: Name): string {
    return part.camelCase.unsafeName;
}
