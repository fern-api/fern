import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

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

    public generate(): RustFile {
        const subpackages = this.getSubpackages();

        // Add module declarations for sub-clients
        const moduleDeclarations = subpackages
            .map((subpackage) => `pub mod ${subpackage.name.snakeCase.safeName};`)
            .join("\n");

        const reExports = subpackages
            .map((subpackage) => `pub use ${subpackage.name.snakeCase.safeName}::${this.getSubClientName(subpackage)};`)
            .join("\n");

        let fileContents = "";

        // Add imports for config types
        const imports = `use crate::{ClientConfig, ClientError};

`;

        // Only generate root client if there are multiple services
        if (subpackages.length > 1) {
            const clientName = this.getRootClientName();
            const rustRootClient = rust.client({
                name: clientName,
                fields: this.generateFields(subpackages),
                constructors: [this.generateConstructor(subpackages)]
            });

            fileContents = [imports, moduleDeclarations, "", rustRootClient.toString(), "", reExports].join("\n");
        } else {
            // For single service, just export the module and re-export the client
            fileContents = [imports, moduleDeclarations, "", reExports].join("\n");
        }

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/client"),
            fileContents
        });
    }

    private generateFields(subpackages: Subpackage[]): rust.Client.Field[] {
        return [
            // Private config field to store the client configuration
            {
                name: "config",
                type: "ClientConfig",
                visibility: "private" as const
            },
            // Generate fields for each sub-client from IR subpackages
            ...subpackages.map((subpackage) => ({
                name: subpackage.name.snakeCase.safeName, // Use proper snake_case from IR
                type: this.getSubClientName(subpackage), // Use proper PascalCase client name
                visibility: "pub" as const // Public for direct access to sub-clients
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

        return {
            name: "new",
            parameters: ["config: ClientConfig"],
            returnType: "Result<Self, ClientError>",
            isAsync: false,
            body: `Ok(Self {
            config: config.clone(),
            ${subClientInits}
        })`
        };
    }

    private getDefaultBaseUrl(): string {
        // Simple: just use a placeholder URL since methods are todo!()
        return "";
    }

    private getRootClientName(): string {
        return this.context.getClientName();
    }

    private getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.safeName}Client`;
    }

    private getSubpackages(): Subpackage[] {
        return this.package.subpackages
            .map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => subpackage.service != null || subpackage.hasEndpointsInTree);
    }
}
