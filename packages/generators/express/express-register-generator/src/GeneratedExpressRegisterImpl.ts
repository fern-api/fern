import { HttpService } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation, Package } from "@fern-fern/ir-model/ir";
import { convertHttpPathToExpressRoute, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { ExpressRegisterContext, GeneratedExpressRegister } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { partition } from "lodash-es";
import { ts } from "ts-morph";

export declare namespace GeneratedExpressRegisterImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        registerFunctionName: string;
        areImplementationsOptional: boolean;
        packageResolver: PackageResolver;
    }
}

export class GeneratedExpressRegisterImpl implements GeneratedExpressRegister {
    private static EXPRESS_APP_PARAMETER_NAME = "expressApp";
    private static EXPRESS_SERVICES_PARAMETER_NAME = "services";

    private intermediateRepresentation: IntermediateRepresentation;
    private registerFunctionName: string;
    private areImplementationsOptional: boolean;
    private packageResolver: PackageResolver;

    constructor({
        intermediateRepresentation,
        registerFunctionName,
        areImplementationsOptional,
        packageResolver,
    }: GeneratedExpressRegisterImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.registerFunctionName = registerFunctionName;
        this.areImplementationsOptional = areImplementationsOptional;
        this.packageResolver = packageResolver;
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
                    type: getTextOfTsNode(
                        this.constructLiteralTypeNodeForServicesTree(
                            { isRoot: true },
                            this.intermediateRepresentation.rootPackage,
                            context
                        )
                    ),
                },
            ],
            returnType: "void",
            statements: Object.keys(this.intermediateRepresentation.subpackages)
                .flatMap((subpackageId) => {
                    const packageId = { isRoot: false, subpackageId };
                    const service = this.packageResolver.getServiceDeclaration(packageId);
                    if (service == null) {
                        return [];
                    }

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
                                .getGeneratedExpressService(packageId)
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
                    return [statement];
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
                    // TODO there's some conflation around subpackage name and fern filepath part in this file
                    part.camelCase.unsafeName
                ),
            ts.factory.createIdentifier(GeneratedExpressRegisterImpl.EXPRESS_SERVICES_PARAMETER_NAME)
        );
    }

    private getServiceKey(packageId: PackageId) {
        if (packageId.isRoot) {
            return "_root";
        }
        const subpackage = this.packageResolver.resolveSubpackage(packageId.subpackageId);
        return subpackage.name.camelCase.unsafeName;
    }

    private constructLiteralTypeNodeForServicesTree(
        rootId: PackageId,
        root: Package,
        context: ExpressRegisterContext
    ): ts.TypeLiteralNode {
        const [leaves, otherChildren] = partition(
            root.subpackages,
            (subpackageId) => this.packageResolver.resolveSubpackage(subpackageId).subpackages.length === 0
        );

        const members: ts.TypeElement[] = [];
        if (root.service != null) {
            members.push(this.getPropertySignatureForService(rootId, context));
        }

        for (const leafId of leaves) {
            const leaf = this.packageResolver.resolveSubpackage(leafId);
            if (leaf.service != null) {
                members.push(this.getPropertySignatureForService({ isRoot: false, subpackageId: leafId }, context));
            }
        }

        for (const otherChildId of otherChildren) {
            const otherChild = this.packageResolver.resolveSubpackage(otherChildId);
            members.push(
                ts.factory.createPropertySignature(
                    undefined,
                    // TODO put in function
                    otherChild.name.camelCase.unsafeName,
                    this.areImplementationsOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    this.constructLiteralTypeNodeForServicesTree(
                        { isRoot: false, subpackageId: otherChildId },
                        otherChild,
                        context
                    )
                )
            );
        }

        return ts.factory.createTypeLiteralNode(members);
    }

    private getPropertySignatureForService(packageId: PackageId, context: ExpressRegisterContext): ts.TypeElement {
        return ts.factory.createPropertySignature(
            undefined,
            this.getServiceKey(packageId),
            this.areImplementationsOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
            context.expressService
                .getReferenceToExpressService(packageId, {
                    importAlias: this.getImportAliasForService(packageId),
                })
                .getTypeNode()
        );
    }

    private getImportAliasForService(packageId: PackageId): string {
        const service = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const lastPart = service.name.fernFilepath.allParts[service.name.fernFilepath.allParts.length - 1];
        return [
            ...service.name.fernFilepath.packagePath.map((part) => part.camelCase.unsafeName),
            `${lastPart != null ? lastPart.pascalCase.unsafeName : "Root"}Service`,
        ].join("_");
    }
}
