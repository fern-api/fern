import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, RustFile } from "@fern-api/rust-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ErrorGenerator } from "./error/ErrorGenerator";
import { generateModels } from "@fern-api/rust-model";

export class SdkGeneratorCli extends AbstractRustGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return SdkCustomConfigSchema.parse({});
    }

    protected publishPackage(context: SdkGeneratorContext): Promise<void> {
        return this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
        if (context.ir.selfHosted) {
            await this.generateGitHub({ context });
        }
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // Generate lib.rs
        const libContent = this.generateLibRs(context);
        const libFile = new RustFile({
            filename: "lib.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: libContent
        });

        // Generate client.rs
        const clientContent = this.generateClientRs(context);
        const clientFile = new RustFile({
            filename: "client.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: clientContent
        });

        // Generate error.rs
        const errorContent = this.generateErrorRs(context);
        const errorFile = new RustFile({
            filename: "error.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: errorContent
        });

        const files = [libFile, clientFile, errorFile];

        // Generate types if they exist
        if (Object.keys(context.ir.types).length > 0) {
            const modelFiles = generateModels({ context: context.toModelGeneratorContext() });
            // Place type files in types/ directory
            const typeFiles = modelFiles.map(
                (file) =>
                    new RustFile({
                        filename: file.filename,
                        directory: RelativeFilePath.of("src/types"),
                        fileContents:
                            typeof file.fileContents === "string" ? file.fileContents : file.fileContents.toString()
                    })
            );
            files.push(...typeFiles);

            // Create a types module file that exports all generated types
            const typesModContent = this.generateTypesModRs(context);
            const typesModFile = new RustFile({
                filename: "mod.rs",
                directory: RelativeFilePath.of("src/types"),
                fileContents: typesModContent
            });
            files.push(typesModFile);
        }

        // Generate services
        for (const [serviceId, service] of Object.entries(context.ir.services)) {
            const serviceName = service.name.fernFilepath.allParts
                .map((part: { snakeCase: { safeName: string } }) => part.snakeCase.safeName)
                .join("_");
            const serviceContent = this.generateServiceRs(context, service);
            const serviceFile = new RustFile({
                filename: `${serviceName}.rs`,
                directory: RelativeFilePath.of("src"),
                fileContents: serviceContent
            });
            files.push(serviceFile);
        }

        context.project.addSourceFiles(...files);
        await context.project.persist();
    }

    private generateLibRs(context: SdkGeneratorContext): string {
        const hasTypes = Object.keys(context.ir.types).length > 0;
        const services = Object.values(context.ir.services);

        let modules = "pub mod client;\npub mod error;";

        if (hasTypes) {
            modules += "\npub mod types;";
        }

        for (const service of services) {
            const serviceName = service.name.fernFilepath.allParts
                .map((part: { snakeCase: { safeName: string } }) => part.snakeCase.safeName)
                .join("_");
            modules += `\npub mod ${serviceName};`;
        }

        return `//! ${context.ir.apiName.pascalCase.safeName} SDK
//!
//! Generated by Fern

${modules}

pub use client::${context.getClientName()};
pub use error::ApiError;
${hasTypes ? "pub use types::*;" : ""}
`;
    }

    private generateClientRs(context: SdkGeneratorContext): string {
        const clientName = context.getClientName();
        return `use crate::error::ApiError;
use reqwest::{Client, RequestBuilder};
use serde::{Deserialize, Serialize};

pub struct ${clientName} {
    client: Client,
    base_url: String,
}

impl ${clientName} {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.into(),
        }
    }

    pub fn with_client(client: Client, base_url: impl Into<String>) -> Self {
        Self {
            client,
            base_url: base_url.into(),
        }
    }

    // TODO: Add API methods here
}
`;
    }

    private generateErrorRs(context: SdkGeneratorContext): string {
        const errorGenerator = new ErrorGenerator(context);
        return errorGenerator.generateErrorRs();
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }

    private generateTypesModRs(context: SdkGeneratorContext): string {
        let content = "// Generated types module\n\n";

        // Export all generated type files
        for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            const moduleName = typeDeclaration.name.name.snakeCase.unsafeName;
            content += `pub mod ${moduleName};\n`;
            content += `pub use ${moduleName}::*;\n`;
        }

        return content;
    }

    private generateServiceRs(
        context: SdkGeneratorContext,
        service: {
            displayName?: string;
            name: { fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> } };
        }
    ): string {
        const clientName = context.getClientName();
        const serviceName =
            service.displayName ||
            service.name.fernFilepath.allParts
                .map((part: { pascalCase: { safeName: string } }) => part.pascalCase.safeName)
                .join(" ");

        return `use crate::client::${clientName};
use crate::error::ApiError;

impl ${clientName} {
    // ${serviceName} methods
    
    // TODO: Generate actual service methods based on endpoints
}
`;
    }
}
