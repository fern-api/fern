import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, UseStatement } from "@fern-api/rust-codegen";

import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class RootClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly package: Package;
    private readonly projectName: string;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.package = context.ir.rootPackage;
        this.projectName = context.ir.apiName.pascalCase.safeName;
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
            directory: RelativeFilePath.of("src/client"),
            fileContents: module.toString()
        });
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
        return subpackages
            .map((subpackage) => `pub use ${subpackage.name.snakeCase.safeName}::${this.getSubClientName(subpackage)};`)
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
            ...subpackages.map((subpackage) => ({
                name: subpackage.name.snakeCase.safeName,
                type: rust.Type.reference(rust.reference({ name: this.getSubClientName(subpackage) })).toString(),
                visibility: "pub" as const
            }))
        ];
    }

    private generateConstructor(subpackages: Subpackage[]): rust.Client.SimpleMethod {
        const subClientInits = subpackages
            .map(
                (subpackage) =>
                    `${subpackage.name.snakeCase.safeName}: ${this.getSubClientName(subpackage)}::new(config.clone())?`
            )
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

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    private getSubpackages(): Subpackage[] {
        return this.package.subpackages
            .map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => subpackage.service != null || subpackage.hasEndpointsInTree);
    }

    private getRootClientName(): string {
        return this.context.getClientName();
    }

    private getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.safeName}Client`;
    }
}
