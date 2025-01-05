import { PackageId, convertHttpPathToExpressRoute, getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressRegister } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { partition } from "lodash-es";
import { ts } from "ts-morph";

import { IntermediateRepresentation, Name, Package } from "@fern-fern/ir-sdk/api";

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
        packageResolver
    }: GeneratedExpressRegisterImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.registerFunctionName = registerFunctionName;
        this.areImplementationsOptional = areImplementationsOptional;
        this.packageResolver = packageResolver;
    }

    public writeToFile(context: ExpressContext): void {
        context.sourceFile.addFunction({
            isExported: true,
            name: this.registerFunctionName,
            parameters: [
                {
                    name: GeneratedExpressRegisterImpl.EXPRESS_APP_PARAMETER_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createUnionTypeNode([
                            context.externalDependencies.express.Express(),
                            context.externalDependencies.express.Router._getReferenceToType()
                        ])
                    )
                },
                {
                    name: GeneratedExpressRegisterImpl.EXPRESS_SERVICES_PARAMETER_NAME,
                    type: getTextOfTsNode(
                        this.constructLiteralTypeNodeForServicesTree(
                            { isRoot: true },
                            this.intermediateRepresentation.rootPackage,
                            context
                        )
                    )
                }
            ],
            returnType: "void",
            statements: this.packageResolver
                .getAllPackageIds()
                .flatMap((packageId) => {
                    const service = this.packageResolver.getServiceDeclaration(packageId);
                    if (service == null) {
                        return [];
                    }

                    let statement: ts.Statement = ts.factory.createExpressionStatement(
                        context.externalDependencies.express.App.use({
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
                                .toRouter(this.getReferenceToServiceArgument(packageId))
                        })
                    );
                    if (this.areImplementationsOptional) {
                        statement = ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                this.getReferenceToServiceArgument(packageId, { includeQuestionMarks: true }),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock([statement], true)
                        );
                    }
                    return [statement];
                })
                .map(getTextOfTsNode)
        });
    }

    private getReferenceToServiceArgument(
        packageId: PackageId,
        { includeQuestionMarks = false }: { includeQuestionMarks?: boolean } = {}
    ) {
        const referenceToPackage = this.packageResolver
            .resolvePackage(packageId)
            .fernFilepath.packagePath.reduce<ts.Expression>(
                (acc, part) =>
                    ts.factory.createPropertyAccessChain(
                        acc,
                        includeQuestionMarks ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken) : undefined,
                        this.getPackagePathKey(part)
                    ),
                ts.factory.createIdentifier(GeneratedExpressRegisterImpl.EXPRESS_SERVICES_PARAMETER_NAME)
            );

        return ts.factory.createPropertyAccessChain(
            referenceToPackage,
            includeQuestionMarks ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken) : undefined,
            this.getServiceKey(packageId)
        );
    }

    private getServiceKey(packageId: PackageId) {
        const subpackage = this.packageResolver.resolvePackage(packageId);
        return subpackage.fernFilepath.file != null ? subpackage.fernFilepath.file.camelCase.unsafeName : "_root";
    }

    private getPackagePathKey(part: Name): string {
        return part.camelCase.unsafeName;
    }

    private constructLiteralTypeNodeForServicesTree(
        rootId: PackageId,
        root: Package,
        context: ExpressContext
    ): ts.TypeLiteralNode {
        const [leaves, otherChildren] = partition(
            root.subpackages,
            (subpackageId) => this.packageResolver.resolveSubpackage(subpackageId).fernFilepath.file != null
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
            if (otherChild.hasEndpointsInTree) {
                members.push(
                    ts.factory.createPropertySignature(
                        undefined,
                        this.getPackagePathKey(otherChild.name),
                        this.areImplementationsOptional
                            ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                            : undefined,
                        this.constructLiteralTypeNodeForServicesTree(
                            { isRoot: false, subpackageId: otherChildId },
                            otherChild,
                            context
                        )
                    )
                );
            }
        }

        return ts.factory.createTypeLiteralNode(members);
    }

    private getPropertySignatureForService(packageId: PackageId, context: ExpressContext): ts.TypeElement {
        return ts.factory.createPropertySignature(
            undefined,
            this.getServiceKey(packageId),
            this.areImplementationsOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
            context.expressService
                .getReferenceToExpressService(packageId, {
                    importAlias: this.getImportAliasForService(packageId)
                })
                .getTypeNode()
        );
    }

    private getImportAliasForService(packageId: PackageId): string {
        const package_ = this.packageResolver.resolvePackage(packageId);
        return [
            ...package_.fernFilepath.packagePath.map((part) => part.camelCase.unsafeName),
            package_.fernFilepath.file != null
                ? `${package_.fernFilepath.file.pascalCase.unsafeName}Service`
                : "RootService"
        ].join("_");
    }
}
