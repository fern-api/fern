import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { ClientGeneratorContext } from "./ClientGeneratorContext.js";
import { SubClientGenerator } from "./SubClientGenerator.js";
import { WebSocketChannelGenerator } from "./WebSocketChannelGenerator.js";

export class RootClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly package: FernIr.Package;
    private readonly projectName: string;
    private readonly clientGeneratorContext: ClientGeneratorContext;
    private readonly wsConnectors: Array<{
        connectorName: string;
        fieldName: string;
        clientName: string;
        moduleName: string;
        channel: FernIr.WebSocketChannel;
    }>;
    private readonly rootServiceGenerator: SubClientGenerator | null;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.package = context.ir.rootPackage;
        this.projectName = context.ir.apiName.pascalCase.safeName;
        this.clientGeneratorContext = new ClientGeneratorContext({
            packageOrSubpackage: this.package,
            sdkGeneratorContext: context
        });

        // Gather WebSocket connector info
        const wsGen = new WebSocketChannelGenerator(context);
        this.wsConnectors = wsGen.getConnectorInfo();

        // Create a SubClientGenerator for root-level endpoints if the root package has a service
        this.rootServiceGenerator = this.createRootServiceGenerator();
    }

    private createRootServiceGenerator(): SubClientGenerator | null {
        const rootServiceId = this.package.service;
        if (!rootServiceId) {
            return null;
        }

        // Synthesize a Subpackage from the root Package (Subpackage extends Package with name + displayName)
        const rootAsSubpackage: FernIr.Subpackage = {
            ...this.package,
            subpackages: [], // Don't pass children — they're handled as separate sub-clients
            name: this.context.ir.apiName,
            displayName: undefined
        };

        return new SubClientGenerator(this.context, rootAsSubpackage);
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public generate(): RustFile {
        const subpackages = this.getSubpackages();
        const rawDeclarations = this.buildRawDeclarations(subpackages);

        // Build module documentation
        const moduleDoc: string[] = [];
        moduleDoc.push("Service clients and API endpoints");
        moduleDoc.push("");

        // Add documentation based on available subpackages
        // Deduplicate by display name since multiple subpackages can share the same name
        if (subpackages.length > 0) {
            moduleDoc.push("This module contains client implementations for:");
            moduleDoc.push("");
            const seenDocNames = new Set<string>();
            subpackages.forEach((subpackage) => {
                const name = subpackage.name.pascalCase.safeName;
                const displayName = subpackage.displayName ?? name;

                // Try to get service docs if the subpackage has a service
                let docEntry: string;
                if (subpackage.service) {
                    const service = this.context.getHttpServiceOrThrow(subpackage.service);
                    const serviceDisplayName = service.displayName ?? displayName;
                    docEntry = serviceDisplayName;
                } else {
                    docEntry = displayName;
                }
                if (!seenDocNames.has(docEntry)) {
                    seenDocNames.add(docEntry);
                    moduleDoc.push(`- **${docEntry}**`);
                }
            });
        } else {
            moduleDoc.push("This module provides the client implementations for all available services.");
        }

        const module = rust.module({
            moduleDoc,
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

    private buildRawDeclarations(subpackages: FernIr.Subpackage[]): string[] {
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

    private generateModuleDeclarations(subpackages: FernIr.Subpackage[]): string {
        // Deduplicate module names - multiple subpackages can share the same name
        // (e.g., HTTP and AsyncAPI sources both creating a "market_data" subpackage)
        const seen = new Set<string>();
        return subpackages
            .filter((subpackage) => {
                const moduleName = subpackage.name.snakeCase.safeName;
                if (seen.has(moduleName)) {
                    return false;
                }
                seen.add(moduleName);
                return true;
            })
            .map((subpackage) => `pub mod ${subpackage.name.snakeCase.safeName};`)
            .join("\n");
    }

    private generateReExports(subpackages: FernIr.Subpackage[]): string {
        // Deduplicate re-exports - multiple subpackages with the same name/path
        // resolve to the same client name via getUniqueClientNameForSubpackage
        const seen = new Set<string>();
        return subpackages
            .filter((subpackage) => {
                const clientName = this.getSubClientName(subpackage);
                const reExport = `${subpackage.name.snakeCase.safeName}::${clientName}`;
                if (seen.has(reExport)) {
                    return false;
                }
                seen.add(reExport);
                return true;
            })
            .map((subpackage) => {
                const clientName = this.getSubClientName(subpackage);
                return `pub use ${subpackage.name.snakeCase.safeName}::${clientName};`;
            })
            .join("\n");
    }

    private generateImports(): UseStatement[] {
        const crateItems = ["ClientConfig", "ApiError"];

        // Add HttpClient and RequestOptions imports if root service has endpoints
        if (this.rootServiceGenerator) {
            crateItems.push("HttpClient", "RequestOptions");
        }

        const imports: UseStatement[] = [
            new UseStatement({
                path: "crate",
                items: crateItems
            })
        ];

        // Add reqwest::Method if root service has endpoints
        if (this.rootServiceGenerator) {
            imports.push(
                new UseStatement({
                    path: "reqwest",
                    items: ["Method"]
                })
            );
            // Add crate::api::* for custom types used in endpoint parameters/responses
            imports.push(
                new UseStatement({
                    path: "crate::api",
                    items: ["*"]
                })
            );
        }

        // Import WebSocket connector types from the websocket module
        const httpFieldNames = new Set(this.clientGeneratorContext.subClients.map((c) => c.fieldName));
        const uniqueWsConnectors = this.getUniqueWsConnectors(httpFieldNames);
        if (uniqueWsConnectors.length > 0) {
            imports.push(
                new UseStatement({
                    path: "crate::api::websocket",
                    items: uniqueWsConnectors.map((c) => c.connectorName)
                })
            );
        }

        return imports;
    }

    // =============================================================================
    // ROOT CLIENT GENERATION
    // =============================================================================

    private generateRootClient(subpackages: FernIr.Subpackage[]): string {
        const clientName = this.getRootClientName();
        const methods = this.rootServiceGenerator?.getEndpointMethods() ?? [];
        const rustRootClient = rust.client({
            name: clientName,
            fields: this.generateFields(subpackages),
            constructors: [this.generateConstructor(subpackages)],
            ...(methods.length > 0 ? { methods } : {})
        });
        return rustRootClient.toString();
    }

    private generateFields(subpackages: FernIr.Subpackage[]): rust.Client.Field[] {
        // Collect HTTP sub-client field names to avoid collisions with WS connectors
        const httpFieldNames = new Set(this.clientGeneratorContext.subClients.map((c) => c.fieldName));

        // Add http_client field if root package has endpoints
        const httpClientField: rust.Client.Field[] = this.rootServiceGenerator
            ? [
                  {
                      name: "http_client",
                      type: rust.Type.reference(rust.reference({ name: "HttpClient" })).toString(),
                      visibility: "pub" as const
                  }
              ]
            : [];

        return [
            {
                name: "config",
                type: rust.Type.reference(rust.reference({ name: "ClientConfig" })).toString(),
                visibility: "pub" as const
            },
            ...httpClientField,
            ...this.clientGeneratorContext.subClients.map(({ fieldName, clientName }) => ({
                name: fieldName,
                type: rust.Type.reference(rust.reference({ name: clientName })).toString(),
                visibility: "pub" as const
            })),
            ...this.getUniqueWsConnectors(httpFieldNames).map(({ fieldName, connectorName }) => ({
                name: fieldName,
                type: rust.Type.reference(rust.reference({ name: connectorName })).toString(),
                visibility: "pub" as const
            }))
        ];
    }

    /**
     * Returns WebSocket connectors that don't collide with existing HTTP sub-client field names.
     */
    private getUniqueWsConnectors(httpFieldNames: Set<string>): typeof this.wsConnectors {
        return this.wsConnectors.filter((c) => !httpFieldNames.has(c.fieldName));
    }

    private generateConstructor(subpackages: FernIr.Subpackage[]): rust.Client.SimpleMethod {
        const allInits: string[] = [];
        const httpFieldNames = new Set(this.clientGeneratorContext.subClients.map((c) => c.fieldName));

        // HttpClient initialization for root-level endpoints
        if (this.rootServiceGenerator) {
            allInits.push("http_client: HttpClient::new(config.clone())?");
        }

        // HTTP sub-client initializations
        for (const { fieldName, clientName } of this.clientGeneratorContext.subClients) {
            allInits.push(`${fieldName}: ${clientName}::new(config.clone())?`);
        }

        // WebSocket connector initializations (only those not colliding with HTTP sub-clients).
        // Always pass the token so the connector can auto-inject the Authorization header,
        // matching the TypeScript SDK experience where auth "just works".
        for (const { fieldName, connectorName } of this.getUniqueWsConnectors(httpFieldNames)) {
            allInits.push(`${fieldName}: ${connectorName}::new(config.base_url.clone(), config.token.clone())`);
        }

        const initStr = allInits.join(",\n            ");

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
            ${initStr}
        })`
        };
    }

    /* 
    Bellow 2 function are very specific to rust :

        - Directory traversal logic is inherently complex
        - Module detection across nested structures requires this scanning
        - Rust's module system demands both declarations and re-exports
    */
    private generateNestedModFiles(subpackages: FernIr.Subpackage[]): RustFile[] {
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
        subpackages: FernIr.Subpackage[],
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

    private getModuleNamesForDirectory(subpackages: FernIr.Subpackage[], targetPath: string): string[] {
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

    private getSubpackages(): FernIr.Subpackage[] {
        return this.package.subpackages
            .map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => !this.context.isWebSocketOnlySubpackage(subpackage));
    }

    private getAllSubpackagesForModuleDetection(): FernIr.Subpackage[] {
        // Get ALL subpackages from the entire IR to detect nested directory structures,
        // excluding WebSocket-only subpackages which don't generate resource files.
        const allSubpackages: FernIr.Subpackage[] = Object.values(this.context.ir.subpackages);
        return allSubpackages.filter((subpackage) => !this.context.isWebSocketOnlySubpackage(subpackage));
    }

    private getRootClientName(): string {
        return this.context.getClientName();
    }

    private getSubClientName(subpackage: FernIr.Subpackage): string {
        return this.context.getUniqueClientNameForSubpackage(subpackage);
    }

    private generateUnifiedModFileIfNeeded(subpackages: FernIr.Subpackage[], currentPath: string): RustFile | null {
        // Find all subpackages that correspond to this directory path.
        // Multiple subpackages can map to the same path (e.g., from HTTP + AsyncAPI sources).
        const matchingSubpackages = subpackages.filter((subpackage) => {
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(subpackage.fernFilepath);
            return fernFilepathDir === currentPath;
        });

        if (matchingSubpackages.length === 0) {
            return null; // No direct subpackage for this path
        }

        // Prefer the subpackage that has children (subclients), since it needs a unified mod.rs.
        // When multiple subpackages share the same path, only one typically has children.
        const targetSubpackage =
            matchingSubpackages.find((sp) => sp.subpackages.length > 0) ?? matchingSubpackages[0];
        if (!targetSubpackage) {
            return null;
        }

        // Check if this subpackage has subclients (nested structure), excluding websocket-only ones
        const subClientSubpackages = this.context.getSubpackagesOrThrow(targetSubpackage)
            .filter(([, sp]) => !this.context.isWebSocketOnlySubpackage(sp));
        const hasSubClients = subClientSubpackages.length > 0;

        if (!hasSubClients) {
            return null; // No subclients, use regular mod.rs generation
        }

        // Generate unified mod.rs with client struct + submodule declarations
        return this.generateUnifiedModFileContent(targetSubpackage, subClientSubpackages, currentPath);
    }

    private generateUnifiedModFileContent(
        subpackage: FernIr.Subpackage,
        subClientSubpackages: Array<[string, FernIr.Subpackage]>,
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
        subClientSubpackages: Array<[string, FernIr.Subpackage]>,
        currentPath: string,
        subpackage: FernIr.Subpackage
    ): RustFile {
        // Generate submodule declarations and re-exports (websocket-only subpackages already excluded)
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

        // Delegate to SubClientGenerator for the full client code including all
        // endpoint methods, proper imports, pagination, etc. This ensures the unified
        // mod.rs has the same functionality as a standalone client file.
        const clientContent = subClientGenerator.generateRawClientContent();

        const module = rust.module({
            useStatements: clientContent.imports,
            rawDeclarations: [...subModuleDeclarations, ...clientContent.rawDeclarations]
        });

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of(`src/api/resources/${currentPath}`),
            fileContents: module.toString()
        });
    }
}
