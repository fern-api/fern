import { EnvironmentsConfig, MultipleBaseUrlsEnvironments, SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";
import {
    ExportedFilePath,
    ExportsManager,
    getReferenceToExportFromPackage,
    getReferenceToExportViaNamespaceImport,
    ImportsManager,
    NpmPackage,
    Reference
} from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace EnvironmentsDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        npmPackage: NpmPackage | undefined;
        environmentsConfig: EnvironmentsConfig | undefined;
        relativePackagePath: string;
        relativeTestPath: string;
    }
}

export class EnvironmentsDeclarationReferencer extends AbstractDeclarationReferencer {
    private npmPackage: NpmPackage | undefined;
    private environmentsConfig: EnvironmentsConfig | undefined;
    private readonly relativePackagePath: string;
    private readonly relativeTestPath: string;

    constructor({
        npmPackage,
        environmentsConfig,
        relativePackagePath,
        relativeTestPath,
        ...superInit
    }: EnvironmentsDeclarationReferencer.Init) {
        super(superInit);
        this.npmPackage = npmPackage;
        this.environmentsConfig = environmentsConfig;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
    }

    public getExportedFilepath(): ExportedFilePath {
        const namedExports = [this.getExportedNameOfEnvironmentsEnum()];
        if (this.environmentsConfig?.environments.type === "multipleBaseUrls") {
            namedExports.push(this.getExportedNameOfEnvironmentUrls());
        }

        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports
                }
            }
        };
    }

    public getFilename(): string {
        return "environments.ts";
    }

    public getExportedNameOfEnvironmentsEnum(): string {
        return `${this.namespaceExport}Environment`;
    }

    public getExportedNameOfEnvironmentUrls(): string {
        return `${this.namespaceExport}EnvironmentUrls`;
    }

    public getExportedNameOfFirstEnvironmentEnum(): { namepaceImport: string; exportedName: string } | undefined {
        if (this.environmentsConfig == null) {
            return undefined;
        }
        const maybeFirstEnvironmentName = this.getFirstEnvironmentName(this.environmentsConfig);
        if (maybeFirstEnvironmentName == null) {
            return undefined;
        }
        return {
            namepaceImport: this.getExportedNameOfEnvironmentsEnum(),
            exportedName: maybeFirstEnvironmentName
        };
    }

    public getReferenceToEnvironmentsEnum({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            exportsManager,
            sourceFile,
            exportedName: this.getExportedNameOfEnvironmentsEnum()
        });
    }

    public getReferenceToFirstEnvironmentEnum({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference | undefined {
        const firstEnvironmentEnum = this.getExportedNameOfFirstEnvironmentEnum();
        if (firstEnvironmentEnum == null) {
            return undefined;
        }
        if (this.npmPackage != null) {
            return this.getReferenceToPackageExport({
                importsManager,
                exportsManager,
                exportedName: firstEnvironmentEnum.exportedName,
                namespaceImport: firstEnvironmentEnum.namepaceImport,
                npmPackage: this.npmPackage
            });
        }
        return getReferenceToExportViaNamespaceImport({
            exportedName: firstEnvironmentEnum.exportedName,
            filepathToNamespaceImport: this.getExportedFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "environments",
            importsManager,
            exportsManager,
            referencedIn: sourceFile
        });
    }

    public getReferenceToEnvironmentUrls({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            exportsManager,
            sourceFile,
            exportedName: this.getExportedNameOfEnvironmentUrls()
        });
    }

    private getReferenceToPackageExport({
        importsManager,
        exportsManager,
        exportedName,
        namespaceImport,
        npmPackage
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        exportedName: string;
        namespaceImport: string;
        npmPackage: NpmPackage;
    }): Reference {
        return getReferenceToExportFromPackage({
            packageName: npmPackage.packageName,
            exportedName,
            namespaceImport,
            importsManager
        });
    }

    private getReferenceToExport({
        importsManager,
        exportsManager,
        sourceFile,
        exportedName
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
        exportedName: string;
    }): Reference {
        return getReferenceToExportViaNamespaceImport({
            exportedName,
            filepathToNamespaceImport: this.getExportedFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "environments",
            importsManager,
            exportsManager,
            referencedIn: sourceFile
        });
    }

    private getFirstEnvironmentName(environmentsConfig: EnvironmentsConfig): string | undefined {
        switch (environmentsConfig.environments.type) {
            case "singleBaseUrl":
                return this.getFirstEnvironmentNameFromSingleEnvironment(environmentsConfig.environments);
            case "multipleBaseUrls":
                return this.getFirstEnvironmentNameFromMultiEnvironment(environmentsConfig.environments);
        }
    }

    private getFirstEnvironmentNameFromSingleEnvironment(
        singleBaseUrlEnvironments: SingleBaseUrlEnvironments
    ): string | undefined {
        for (const environment of singleBaseUrlEnvironments.environments) {
            return environment.name.pascalCase.unsafeName;
        }
        return undefined;
    }

    private getFirstEnvironmentNameFromMultiEnvironment(
        multiBaseUrlsEnvironments: MultipleBaseUrlsEnvironments
    ): string | undefined {
        for (const environment of multiBaseUrlsEnvironments.environments) {
            return environment.name.pascalCase.unsafeName;
        }
        return undefined;
    }
}
