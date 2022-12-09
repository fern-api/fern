import { Environment, EnvironmentId } from "@fern-fern/ir-model/environment";
import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { EnvironmentsContext, GeneratedEnvironments } from "@fern-typescript/contexts";
import { ts, VariableDeclarationKind } from "ts-morph";

export declare namespace GeneratedEnvironmentsImpl {
    export interface Init {
        environmentEnumName: string;
        environments: Environment[];
        defaultEnvironment: EnvironmentId | undefined;
    }
}

export class GeneratedEnvironmentsImpl implements GeneratedEnvironments {
    private environmentEnumName: string;
    private environments: Environment[];
    private defaultEnvironmentId: EnvironmentId | undefined;

    constructor({ environments, defaultEnvironment, environmentEnumName }: GeneratedEnvironmentsImpl.Init) {
        this.environments = environments;
        this.environmentEnumName = environmentEnumName;
        this.defaultEnvironmentId = defaultEnvironment;
    }

    public writeToFile(context: EnvironmentsContext): void {
        if (this.environments.length === 0) {
            return;
        }

        const objectWriter = FernWriters.object.writer({ asConst: true });
        for (const environment of this.environments) {
            objectWriter.addProperty({
                key: this.getNameOfEnvironment(environment),
                value: `"${environment.url}"`,
                docs: environment.docs ?? undefined,
            });
        }

        context.base.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: this.environmentEnumName,
                    initializer: objectWriter.toFunction(),
                },
            ],
        });

        context.base.sourceFile.addTypeAlias({
            name: this.environmentEnumName,
            isExported: true,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.environments.map((environment) =>
                        ts.factory.createTypeQueryNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(this.environmentEnumName),
                                ts.factory.createIdentifier(this.getNameOfEnvironment(environment))
                            ),
                            undefined
                        )
                    )
                )
            ),
        });
    }

    public get defaultEnvironmentEnumMemberName(): string | undefined {
        if (this.defaultEnvironmentId == null) {
            return undefined;
        }
        const defaultEnvironment = this.environments.find(
            (environment) => environment.id === this.defaultEnvironmentId
        );
        if (defaultEnvironment == null) {
            throw new Error("Default environment does not exist");
        }
        return this.getNameOfEnvironment(defaultEnvironment);
    }

    private getNameOfEnvironment(environment: Environment): string {
        return environment.name.unsafeName.pascalCase;
    }
}
