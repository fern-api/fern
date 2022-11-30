import { Environment } from "@fern-fern/ir-model/environment";
import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { EnvironmentsContext, GeneratedEnvironments } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";

export declare namespace GeneratedEnvironmentsImpl {
    export interface Init {
        environmentEnumName: string;
        environments: Environment[];
    }
}

export class GeneratedEnvironmentsImpl implements GeneratedEnvironments {
    private environmentEnumName: string;
    private environments: Environment[];

    constructor({ environments, environmentEnumName }: GeneratedEnvironmentsImpl.Init) {
        this.environments = environments;
        this.environmentEnumName = environmentEnumName;
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

    private getNameOfEnvironment(environment: Environment): string {
        return environment.name.unsafeName.pascalCase;
    }
}
