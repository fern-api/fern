import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";

import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";

export class RootClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly package: Package;
    private readonly projectName: string;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.package = context.ir.rootPackage;
        this.projectName = context.ir.apiName.pascalCase.safeName;
        this.clientGeneratorContext = new ClientGeneratorContext({
            packageOrSubpackage: this.package,
            sdkGeneratorContext: context
        });
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public generate(): RustFile {
        const subpackages = this.getSubpackages();
        const rawDeclarations = this.buildRawDeclarations(subpackages);

        const module = rust.module({
            useStatements: this.generateImports(),
            rawDeclarations
        });

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/api/resources"),
            fileContents: module.toString()
        });
    }

    public generateAllFiles(): RustFile[] {
        const files: RustFile[] = [];
        const subpackages = this.getSubpackages();

        // Generate main mod.rs file
        files.push(this.generate());

        // Generate mod.rs files for nested directories using ALL subpackages
        const allSubpackages = this.getAllSubpackagesForModuleDetection();
        files.push(...this.generateNestedModFiles(allSubpackages));

        return files;
    }

    // =============================================================================
    // FILE STRUCTURE GENERATION
    // =============================================================================

    private buildRawDeclarations(subpackages: Subpackage[]): string[] {
        const rawDeclarations: string[] = [];

        // Add module declarations for sub-clients
        const moduleDeclarations = this.generateModuleDeclarations(subpackages);
        if (moduleDeclarations) {
            rawDeclarations.push(moduleDeclarations);
        }

        // Only generate root client if there are multiple services
        if (subpackages.length > 1) {
            const rootClient = this.generateRootClient(subpackages);
            rawDeclarations.push(rootClient);
        }

        // Add re-exports for direct access to sub-clients
        const reExports = this.generateReExports(subpackages);
        if (reExports) {
            rawDeclarations.push(reExports);
        }

        return rawDeclarations;
    }

    private generateModuleDeclarations(subpackages: Subpackage[]): string {
        return subpackages.map((subpackage) => `pub mod ${subpackage.name.snakeCase.safeName};`).join("\n");
    }

    private generateReExports(subpackages: Subpackage[]): string {
        return subpackages.map((subpackage) => `pub use ${subpackage.name.snakeCase.safeName}::*;`).join("\n");
    }

    private generateImports(): UseStatement[] {
        return [
            new UseStatement({
                path: "crate",
                items: ["ClientConfig", "ApiError"]
            })
        ];
    }

    // =============================================================================
    // ROOT CLIENT GENERATION
    // =============================================================================

    private generateRootClient(subpackages: Subpackage[]): string {
        const clientName = this.getRootClientName();
        const rustRootClient = rust.client({
            name: clientName,
            fields: this.generateFields(subpackages),
            constructors: [this.generateConstructor(subpackages)]
        });
        return rustRootClient.toString();
    }

    private generateFields(subpackages: Subpackage[]): rust.Client.Field[] {
        return [
            {
                name: "config",
                type: rust.Type.reference(rust.reference({ name: "ClientConfig" })).toString(),
                visibility: "pub" as const
            },
            ...this.clientGeneratorContext.subClients.map(({ fieldName, clientName }) => ({
                name: fieldName,
                type: rust.Type.reference(rust.reference({ name: clientName })).toString(),
                visibility: "pub" as const
            }))
        ];
    }

    private generateConstructor(subpackages: Subpackage[]): rust.Client.SimpleMethod {
        const subClientInits = this.clientGeneratorContext.subClients
            .map(({ fieldName, clientName }) => `${fieldName}: ${clientName}::new(config.clone())?`)
            .join(",\n            ");

        const configType = rust.Type.reference(rust.reference({ name: "ClientConfig" }));
        const selfType = rust.Type.reference(rust.reference({ name: "Self" }));
        const errorType = rust.Type.reference(rust.reference({ name: "ApiError" }));
        const returnType = rust.Type.result(selfType, errorType);

        return {
            name: "new",
            parameters: [`config: ${configType.toString()}`],
            returnType: returnType.toString(),
            isAsync: false,
            body: `Ok(Self {
            config: config.clone(),
            ${subClientInits}
        })`
        };
    }

    /* 
    Bellow 2 function are very specific to rust :

        - Directory traversal logic is inherently complex
        - Module detection across nested structures requires this scanning
        - Rust's module system demands both declarations and re-exports
    */
    private generateNestedModFiles(subpackages: Subpackage[]): RustFile[] {
        const files: RustFile[] = [];
        const directoriesCreated = new Set<string>();

        // For each subpackage, create mod.rs files for its directory structure
        subpackages.forEach((subpackage) => {
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(subpackage.fernFilepath);
            if (fernFilepathDir) {
                const parts = fernFilepathDir.split("/");
                let currentPath = "";

                // Create mod.rs for each directory level
                parts.forEach((part, index) => {
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    const fullPath = `src/api/resources/${currentPath}`;

                    if (!directoriesCreated.has(fullPath)) {
                        directoriesCreated.add(fullPath);

                        // Determine what modules this directory should expose
                        const moduleNames = this.getModuleNamesForDirectory(subpackages, currentPath);

                        // Create both module declarations and wildcard re-exports
                        const rawDeclarations = [
                            ...moduleNames.map((name) => `pub mod ${name};`),
                            ...moduleNames.map((name) => `pub use ${name}::*;`)
                        ];

                        const module = rust.module({
                            useStatements: [],
                            rawDeclarations
                        });

                        files.push(
                            new RustFile({
                                filename: "mod.rs",
                                directory: RelativeFilePath.of(fullPath),
                                fileContents: module.toString()
                            })
                        );
                    }
                });
            }
        });

        return files;
    }

    private getModuleNamesForDirectory(subpackages: Subpackage[], targetPath: string): string[] {
        // Use ALL subpackages (including those without services) for module detection
        const allSubpackages = this.getAllSubpackagesForModuleDetection();
        const moduleNames = new Set<string>();

        allSubpackages.forEach((subpackage, index) => {
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(subpackage.fernFilepath);

            if (fernFilepathDir) {
                // Check if this subpackage creates a file in a subdirectory of targetPath
                const targetPrefix = targetPath === "" ? "" : targetPath + "/";

                if (fernFilepathDir.startsWith(targetPrefix) && fernFilepathDir !== targetPath) {
                    // Extract the directory segment immediately after targetPath
                    const relativePath = fernFilepathDir.substring(targetPrefix.length);
                    const segments = relativePath.split("/");

                    if (segments.length > 0 && segments[0]) {
                        // First segment is a subdirectory we need to declare
                        moduleNames.add(segments[0]);
                    }
                } else if (fernFilepathDir === targetPath) {
                    // This is a file directly in the target directory
                    const filename = this.context.getUniqueFilenameForSubpackage(subpackage);
                    const moduleName = filename.replace(".rs", "");
                    moduleNames.add(moduleName);
                }
            }
        });

        const result = Array.from(moduleNames).sort();

        return result;
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    private getSubpackages(): Subpackage[] {
        return this.package.subpackages
            .map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => subpackage.service != null || subpackage.hasEndpointsInTree);
    }

    private getAllSubpackagesForModuleDetection(): Subpackage[] {
        // Get ALL subpackages from the entire IR to detect nested directory structures
        const allSubpackages: Subpackage[] = Object.values(this.context.ir.subpackages);
        return allSubpackages;
    }

    private getRootClientName(): string {
        return this.context.getClientName();
    }

    private getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.safeName}Client`;
    }
}
