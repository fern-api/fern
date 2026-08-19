import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FernWriters, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { FileContext, GeneratedEnvironments } from "@fern-typescript/contexts";
import { ts, VariableDeclarationKind } from "ts-morph";

export declare namespace GeneratedMultipleUrlsEnvironmentsImpl {
    export interface Init {
        environmentEnumName: string;
        environmentUrlsTypeName: string;
        defaultEnvironmentId: FernIr.EnvironmentId | undefined;
        environments: FernIr.MultipleBaseUrlsEnvironments;
        caseConverter: CaseConverter;
    }
}

export class GeneratedMultipleUrlsEnvironmentsImpl implements GeneratedEnvironments {
    private environmentEnumName: string;
    private environmentUrlsTypeName: string;
    private environments: FernIr.MultipleBaseUrlsEnvironments;
    private defaultEnvironmentId: FernIr.EnvironmentId | undefined;
    private readonly case: CaseConverter;

    constructor({
        environments,
        environmentEnumName,
        environmentUrlsTypeName,
        defaultEnvironmentId,
        caseConverter
    }: GeneratedMultipleUrlsEnvironmentsImpl.Init) {
        this.environments = environments;
        this.environmentEnumName = environmentEnumName;
        this.environmentUrlsTypeName = environmentUrlsTypeName;
        this.defaultEnvironmentId = defaultEnvironmentId;
        this.case = caseConverter;
    }

    public writeToFile(context: FileContext): void {
        context.sourceFile.addInterface({
            name: this.environmentUrlsTypeName,
            properties: this.environments.baseUrls.map((baseUrl) => ({
                name: getPropertyKey(this.getNameOfBaseUrl(baseUrl, context.case)),
                type: "string"
            })),
            isExported: true
        });

        const objectWriter = FernWriters.object.writer({ asConst: true });
        for (const environment of this.environments.environments) {
            objectWriter.addProperty({
                key: this.getNameOfEnvironment(environment, context.case),
                value: getTextOfTsNode(
                    ts.factory.createObjectLiteralExpression(
                        this.environments.baseUrls.map((baseUrl) => {
                            const url = environment.urls[baseUrl.id];
                            if (url == null) {
                                throw new Error(
                                    `No URL defined for ${getOriginalName(environment.name)}.${getOriginalName(baseUrl.name)}`
                                );
                            }
                            return ts.factory.createPropertyAssignment(
                                getPropertyKey(this.getNameOfBaseUrl(baseUrl, context.case)),
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
                                ts.factory.createIdentifier(this.getNameOfEnvironment(environment, context.case))
                            )
                        )
                    )
                )
            )
        });
    }

    public getReferenceToDefaultEnvironment(context: FileContext): ts.Expression | undefined {
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
            this.getNameOfEnvironment(defaultEnvironment, context.case)
        );
    }

    public getTypeForUserSuppliedEnvironment(context: FileContext): ts.TypeNode {
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
        baseUrlId: FernIr.EnvironmentBaseUrlId | undefined;
    }): ts.Expression {
        if (baseUrlId == null) {
            throw new Error("Cannot get reference to multiple environment URL because baseUrlId is not defined");
        }
        const baseUrl = this.environments.baseUrls.find((otherBaseUrl) => otherBaseUrl.id === baseUrlId);
        if (baseUrl == null) {
            throw new Error(`Cannot get reference to multiple environment URL because ${baseUrlId} is not defined`);
        }
        return ts.factory.createPropertyAccessExpression(
            referenceToEnvironmentValue,
            this.getNameOfBaseUrl(baseUrl, this.case)
        );
    }

    private getNameOfEnvironment(
        environment: FernIr.MultipleBaseUrlsEnvironment,
        caseConverter: CaseConverter
    ): string {
        return caseConverter.pascalUnsafe(environment.name);
    }

    private getNameOfBaseUrl(baseUrl: FernIr.EnvironmentBaseUrlWithId, caseConverter: CaseConverter): string {
        return caseConverter.camelUnsafe(baseUrl.name);
    }
}
