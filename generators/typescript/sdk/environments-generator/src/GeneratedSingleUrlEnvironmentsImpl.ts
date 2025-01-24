import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedEnvironments, SdkContext } from "@fern-typescript/contexts";
import { VariableDeclarationKind, ts } from "ts-morph";

import {
    EnvironmentBaseUrlId,
    EnvironmentId,
    SingleBaseUrlEnvironment,
    SingleBaseUrlEnvironments
} from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedSingleUrlEnvironmentsImpl {
    export interface Init {
        environmentEnumName: string;
        defaultEnvironmentId: EnvironmentId | undefined;
        environments: SingleBaseUrlEnvironments;
    }
}

export class GeneratedSingleUrlEnvironmentsImpl implements GeneratedEnvironments {
    private environmentEnumName: string;
    private environments: SingleBaseUrlEnvironments;
    private defaultEnvironmentId: EnvironmentId | undefined;

    constructor({ environments, environmentEnumName, defaultEnvironmentId }: GeneratedSingleUrlEnvironmentsImpl.Init) {
        this.environments = environments;
        this.environmentEnumName = environmentEnumName;
        this.defaultEnvironmentId = defaultEnvironmentId;
    }

    public writeToFile(context: SdkContext): void {
        const objectWriter = FernWriters.object.writer({ asConst: true });
        for (const environment of this.environments.environments) {
            objectWriter.addProperty({
                key: this.getNameOfEnvironment(environment),
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
                                ts.factory.createIdentifier(this.getNameOfEnvironment(environment))
                            ),
                            undefined
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
        baseUrlId: EnvironmentBaseUrlId | undefined;
    }): ts.Expression {
        if (baseUrlId != null) {
            throw new Error(`Cannot get reference to environment URL because baseUrlId is defined ("${baseUrlId}")`);
        }
        return referenceToEnvironmentValue;
    }

    private getNameOfEnvironment(environment: SingleBaseUrlEnvironment): string {
        return environment.name.pascalCase.unsafeName;
    }
}
