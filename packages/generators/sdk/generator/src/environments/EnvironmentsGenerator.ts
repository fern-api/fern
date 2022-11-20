import { Environment, EnvironmentId } from "@fern-fern/ir-model/environment";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { ParsedEnvironments, Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts, VariableDeclarationKind } from "ts-morph";
import { getReferenceToExportViaNamespaceImport } from "../declaration-referencers/utils/getReferenceToExportViaNamespaceImport";
import { ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ImportsManager } from "../imports-manager/ImportsManager";

export declare namespace EnvironmentsGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        packageName: string;
    }
}

export class EnvironmentsGenerator {
    private static TYPE_NAME = "Environment";
    private packageName: string;
    private intermediateRepresentation: IntermediateRepresentation;

    constructor({ intermediateRepresentation, packageName }: EnvironmentsGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.packageName = packageName;
    }

    public getFilepath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: "environments.ts",
            },
        };
    }

    public toParsedEnvironments({
        importsManager,
        sourceFile,
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): ParsedEnvironments | undefined {
        if (this.intermediateRepresentation.environments.length === 0) {
            return undefined;
        }

        const { defaultEnvironment } = this.intermediateRepresentation;

        return {
            getReferenceToEnvironmentEnum: () =>
                this.getReferenceToEnvironmentEnum({
                    importsManager,
                    sourceFile,
                }),
            getReferenceToDefaultEnvironment:
                defaultEnvironment != null
                    ? () =>
                          this.getReferenceToEnvironmentEnum({
                              importsManager,
                              sourceFile,
                              environmentId: defaultEnvironment,
                          }).getExpression()
                    : undefined,
        };
    }

    private getReferenceToEnvironmentEnum({
        importsManager,
        sourceFile,
        environmentId,
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
        environmentId?: EnvironmentId;
    }): Reference {
        return getReferenceToExportViaNamespaceImport({
            exportedName: EnvironmentsGenerator.TYPE_NAME,
            filepathToNamespaceImport: this.getFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "environments",
            importsManager,
            referencedIn: sourceFile,
            subImport: environmentId != null ? [this.getNameOfEnvironmentId(environmentId)] : undefined,
            packageName: this.packageName,
        });
    }

    public generateEnvironments(file: SourceFile): void {
        if (this.intermediateRepresentation.environments.length === 0) {
            return;
        }

        const objectWriter = FernWriters.object.writer({ asConst: true });
        for (const environment of this.intermediateRepresentation.environments) {
            objectWriter.addProperty({
                key: this.getNameOfEnvironment(environment),
                value: `"${environment.url}"`,
                docs: environment.docs ?? undefined,
            });
        }

        file.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: EnvironmentsGenerator.TYPE_NAME,
                    initializer: objectWriter.toFunction(),
                },
            ],
        });

        file.addTypeAlias({
            name: EnvironmentsGenerator.TYPE_NAME,
            isExported: true,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.intermediateRepresentation.environments.map((environment) =>
                        ts.factory.createTypeQueryNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(EnvironmentsGenerator.TYPE_NAME),
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

    private getNameOfEnvironmentId(environmentId: EnvironmentId): string {
        const environment = this.intermediateRepresentation.environments.find(
            (environment) => environment.id === environmentId
        );
        if (environment == null) {
            throw new Error("No environment with ID: " + environmentId);
        }
        return this.getNameOfEnvironment(environment);
    }
}
