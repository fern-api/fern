import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { FileContext, GeneratedEnvironments } from "@fern-typescript/contexts";
import { ts, VariableDeclarationKind } from "ts-morph";

export declare namespace GeneratedSingleUrlEnvironmentsImpl {
    export interface Init {
        environmentEnumName: string;
        defaultEnvironmentId: FernIr.EnvironmentId | undefined;
        environments: FernIr.SingleBaseUrlEnvironments;
    }
}

export class GeneratedSingleUrlEnvironmentsImpl implements GeneratedEnvironments {
    private environmentEnumName: string;
    private environments: FernIr.SingleBaseUrlEnvironments;
    private defaultEnvironmentId: FernIr.EnvironmentId | undefined;

    constructor({ environments, environmentEnumName, defaultEnvironmentId }: GeneratedSingleUrlEnvironmentsImpl.Init) {
        this.environments = environments;
        this.environmentEnumName = environmentEnumName;
        this.defaultEnvironmentId = defaultEnvironmentId;
    }

    public writeToFile(context: FileContext): void {
        const objectWriter = FernWriters.object.writer({ asConst: true });
        for (const environment of this.environments.environments) {
            objectWriter.addProperty({
                key: this.getNameOfEnvironment(environment, context.case),
                value: `"${environment.url}"`,
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
                            ),
                            undefined
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
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
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
        // For single URL environments, baseUrlId is irrelevant since there's only one URL.
        // This can happen when an AsyncAPI spec defines a named server (e.g. "production")
        // which gets converted to a baseUrlId on the WebSocket channel.
        return referenceToEnvironmentValue;
    }

    private getNameOfEnvironment(environment: FernIr.SingleBaseUrlEnvironment, caseConverter: CaseConverter): string {
        return caseConverter.pascalUnsafe(environment.name);
    }
}
