import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";

import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { SubClientGenerator } from "./SubClientGenerator";

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

        // Generate root client all services, or if no subpackages exist (empty client)
        const rootClient = this.generateRootClient(subpackages);
        rawDeclarations.push(rootClient);

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
        return subpackages
            .map((subpackage) => {
                const clientName = this.getSubClientName(subpackage);
                return `pub use ${subpackage.name.snakeCase.safeName}::${clientName};`;
            })
            .join("\n");
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

                        // Check if this directory needs a unified mod.rs (client + submodules)
                        const unifiedModFile = this.generateUnifiedModFileIfNeeded(subpackages, currentPath);
                        if (unifiedModFile) {
                            files.push(unifiedModFile);
                        } else {
                            // Generate regular mod.rs with just module declarations and re-exports
                            const moduleNames = this.getModuleNamesForDirectory(subpackages, currentPath);

                            // Create module declarations and selective re-exports
                            const rawDeclarations = [
                                ...moduleNames.map((name) => `pub mod ${name};`),
                                ...this.generateSelectiveReExportsForDirectory(subpackages, currentPath, moduleNames)
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
                    }
                });
            }
        });

        return files;
    }

    private generateSelectiveReExportsForDirectory(
        subpackages: Subpackage[],
        currentPath: string,
        moduleNames: string[]
    ): string[] {
        const reExports: string[] = [];

        moduleNames.forEach((moduleName) => {
            // Find the subpackage that corresponds to this module
            const subpackage = subpackages.find((sp) => {
                const fernFilepathDir = this.context.getDirectoryForFernFilepath(sp.fernFilepath);
                if (fernFilepathDir === currentPath) {
                    const filename = this.context.getUniqueFilenameForSubpackage(sp);
                    const expectedModuleName = filename.replace(".rs", "");
                    return expectedModuleName === moduleName;
                }
                return false;
            });

            if (subpackage) {
                // This is a direct subpackage file - export its client
                const clientName = this.getSubClientName(subpackage);
                reExports.push(`pub use ${moduleName}::${clientName};`);
            } else {
                // This is a subdirectory - only re-export client structs, not all types
                // We'll be more conservative and just export the module contents selectively
                reExports.push(`pub use ${moduleName}::*;`); // TODO: This could be further refined
            }
        });

        return reExports;
    }

    private getModuleNamesForDirectory(subpackages: Subpackage[], targetPath: string): string[] {
        // Use ALL subpackages (including those without services) for module detection
        const allSubpackages = this.getAllSubpackagesForModuleDetection();
        const moduleNames = new Set<string>();

        allSubpackages.forEach((subpackage) => {
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
        return this.package.subpackages.map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId));
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
        return this.context.getUniqueClientNameForSubpackage(subpackage);
    }

    private generateUnifiedModFileIfNeeded(subpackages: Subpackage[], currentPath: string): RustFile | null {
        // Find the subpackage that corresponds to this directory path
        const targetSubpackage = subpackages.find((subpackage) => {
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(subpackage.fernFilepath);
            return fernFilepathDir === currentPath;
        });

        if (!targetSubpackage) {
            return null; // No direct subpackage for this path
        }

        // Check if this subpackage has subclients (nested structure)
        const subClientSubpackages = this.context.getSubpackagesOrThrow(targetSubpackage);
        const hasSubClients = subClientSubpackages.length > 0;

        if (!hasSubClients) {
            return null; // No subclients, use regular mod.rs generation
        }

        // Generate unified mod.rs with client struct + submodule declarations
        const subClientGenerator = new SubClientGenerator(this.context, targetSubpackage);
        return this.generateUnifiedModFileContent(targetSubpackage, subClientSubpackages, currentPath);
    }

    private generateUnifiedModFileContent(
        subpackage: Subpackage,
        subClientSubpackages: Array<[string, Subpackage]>,
        currentPath: string
    ): RustFile {
        const subClientGenerator = new SubClientGenerator(this.context, subpackage);

        // Just use the existing SubClientGenerator to generate the full unified content
        // We'll create a modified version that includes both the client and submodules
        const regularClientFile = this.createUnifiedModFileFromSubClient(
            subClientGenerator,
            subClientSubpackages,
            currentPath,
            subpackage
        );

        return regularClientFile;
    }

    private createUnifiedModFileFromSubClient(
        subClientGenerator: SubClientGenerator,
        subClientSubpackages: Array<[string, Subpackage]>,
        currentPath: string,
        subpackage: Subpackage
    ): RustFile {
        // Generate submodule declarations and re-exports
        const subModuleDeclarations: string[] = [];
        subClientSubpackages.forEach(([, subClientSubpackage]) => {
            // Use the actual directory name, not the full filename
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(subClientSubpackage.fernFilepath);
            if (fernFilepathDir) {
                const parts = fernFilepathDir.split("/");
                const moduleName = parts[parts.length - 1]; // Get the last part (actual directory name)
                const subClientName = this.context.getUniqueClientNameForSubpackage(subClientSubpackage);

                subModuleDeclarations.push(`pub mod ${moduleName};`);
                subModuleDeclarations.push(`pub use ${moduleName}::${subClientName};`);
            }
        });

        // Get the regular client generation, but we'll modify it to include submodules
        // We need to get the client struct content from SubClientGenerator
        // Since the methods are private, let's use a different approach

        // For now, let's use the existing generateModFile method pattern but enhance it
        const clientGeneratorContext = new ClientGeneratorContext({
            packageOrSubpackage: subpackage,
            sdkGeneratorContext: this.context
        });

        // Build the unified content manually
        const useStatements = [
            new UseStatement({
                path: "crate",
                items: ["ApiError", "ClientConfig", "HttpClient"]
            })
        ];

        // Add crate::api imports if needed
        if (subClientSubpackages.length > 0) {
            useStatements.push(
                new UseStatement({
                    path: "crate::api",
                    items: ["*"]
                })
            );
        }

        const clientName = this.context.getUniqueClientNameForSubpackage(subpackage);

        // Create basic client struct manually since we can't access private methods
        const clientFields = clientGeneratorContext.subClients.map(
            ({ fieldName, clientName }) => `    pub ${fieldName}: ${clientName},`
        );
        clientFields.unshift("    pub http_client: HttpClient,");

        const clientConstructorFields = clientGeneratorContext.subClients.map(
            ({ fieldName, clientName }) => `            ${fieldName}: ${clientName}::new(config.clone())?,`
        );
        clientConstructorFields.unshift("            http_client: HttpClient::new(config.clone())?,");

        const clientStruct = `
pub struct ${clientName} {
${clientFields.join("\n")}
}

impl ${clientName} {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
${clientConstructorFields.join("\n")}
        })
    }
}`;

        const module = rust.module({
            useStatements,
            rawDeclarations: [
                ...subModuleDeclarations,
                "", // Empty line for readability
                clientStruct
            ]
        });

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of(`src/api/resources/${currentPath}`),
            fileContents: module.toString()
        });
    }
}
