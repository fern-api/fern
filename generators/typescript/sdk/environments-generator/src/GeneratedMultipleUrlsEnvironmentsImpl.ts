import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedEnvironments, SdkContext } from "@fern-typescript/contexts";
import { VariableDeclarationKind, ts } from "ts-morph";

import {
    EnvironmentBaseUrlId,
    EnvironmentBaseUrlWithId,
    EnvironmentId,
    MultipleBaseUrlsEnvironment,
    MultipleBaseUrlsEnvironments
} from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedMultipleUrlsEnvironmentsImpl {
    export interface Init {
        environmentEnumName: string;
        environmentUrlsTypeName: string;
        defaultEnvironmentId: EnvironmentId | undefined;
        environments: MultipleBaseUrlsEnvironments;
    }
}

export class GeneratedMultipleUrlsEnvironmentsImpl implements GeneratedEnvironments {
    private environmentEnumName: string;
    private environmentUrlsTypeName: string;
    private environments: MultipleBaseUrlsEnvironments;
    private defaultEnvironmentId: EnvironmentId | undefined;

    constructor({
        environments,
        environmentEnumName,
        environmentUrlsTypeName,
        defaultEnvironmentId
    }: GeneratedMultipleUrlsEnvironmentsImpl.Init) {
        this.environments = environments;
        this.environmentEnumName = environmentEnumName;
        this.environmentUrlsTypeName = environmentUrlsTypeName;
        this.defaultEnvironmentId = defaultEnvironmentId;
    }

    public writeToFile(context: SdkContext): void {
        context.sourceFile.addInterface({
            name: this.environmentUrlsTypeName,
            properties: this.environments.baseUrls.map((baseUrl) => ({
                name: this.getNameOfBaseUrl(baseUrl),
                type: "string"
            })),
            isExported: true
        });

        const objectWriter = FernWriters.object.writer({ asConst: true });
        for (const environment of this.environments.environments) {
            objectWriter.addProperty({
                key: this.getNameOfEnvironment(environment),
                value: getTextOfTsNode(
                    ts.factory.createObjectLiteralExpression(
                        this.environments.baseUrls.map((baseUrl) => {
                            const url = environment.urls[baseUrl.id];
                            if (url == null) {
                                throw new Error(
                                    `No URL defined for ${environment.name.originalName}.${baseUrl.name.originalName}`
                                );
                            }
                            return ts.factory.createPropertyAssignment(
                                this.getNameOfBaseUrl(baseUrl),
                                ts.factory.createStringLiteral(url)
                            );
                        }),
                        true
                    )
                ),
                docs: environment.docs ?? undefined
            });
        }

        context.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: this.environmentEnumName,
                    initializer: objectWriter.toFunction()
                }
            ]
        });

        context.sourceFile.addTypeAlias({
            name: this.environmentEnumName,
            isExported: true,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.environments.environments.map((environment) =>
                        ts.factory.createTypeQueryNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(this.environmentEnumName),
                                ts.factory.createIdentifier(this.getNameOfEnvironment(environment))
                            )
                        )
                    )
                )
            )
        });
    }

    public getReferenceToDefaultEnvironment(context: SdkContext): ts.Expression | undefined {
        if (this.defaultEnvironmentId == null) {
            return undefined;
        }
        const defaultEnvironment = this.environments.environments.find(
            (environment) => environment.id === this.defaultEnvironmentId
        );
        if (defaultEnvironment == null) {
            throw new Error("Default environment does not exist");
        }

        return ts.factory.createPropertyAccessExpression(
            context.environments.getReferenceToEnvironmentsEnum().getExpression(),
            this.getNameOfEnvironment(defaultEnvironment)
        );
    }

    public getTypeForUserSuppliedEnvironment(context: SdkContext): ts.TypeNode {
        return ts.factory.createUnionTypeNode([
            context.environments.getReferenceToEnvironmentsEnum().getTypeNode(),
            context.environments.getReferenceToEnvironmentUrls().getTypeNode()
        ]);
    }

    public hasDefaultEnvironment(): boolean {
        return this.defaultEnvironmentId != null;
    }

    public getReferenceToEnvironmentUrl({
        referenceToEnvironmentValue,
        baseUrlId
    }: {
        referenceToEnvironmentValue: ts.Expression;
        baseUrlId: EnvironmentBaseUrlId | undefined;
    }): ts.Expression {
        if (baseUrlId == null) {
            throw new Error("Cannot get reference to environment URL because baseUrlId is not defined");
        }
        const baseUrl = this.environments.baseUrls.find((otherBaseUrl) => otherBaseUrl.id === baseUrlId);
        if (baseUrl == null) {
            throw new Error(`Cannot get reference to environment URL because ${baseUrlId} is not defined`);
        }
        return ts.factory.createPropertyAccessExpression(referenceToEnvironmentValue, this.getNameOfBaseUrl(baseUrl));
    }

    private getNameOfEnvironment(environment: MultipleBaseUrlsEnvironment): string {
        return environment.name.pascalCase.unsafeName;
    }

    private getNameOfBaseUrl(baseUrl: EnvironmentBaseUrlWithId): string {
        return baseUrl.name.camelCase.unsafeName;
    }
}
