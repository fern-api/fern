import { mkdir } from "fs/promises";

import { AbstractProject } from "@fern-api/base-generator";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { AbstractRustGeneratorContext, BaseRustCustomConfigSchema } from "../context/AbstractRustGeneratorContext";
import { RustFile } from "./RustFile";

const SRC_DIRECTORY_NAME = "src";

export interface RustProjectConfig {
    context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>;
    packageName: string;
    packageVersion: string;
}

export class RustProject extends AbstractProject<AbstractRustGeneratorContext<BaseRustCustomConfigSchema>> {
    private packageName: string;
    private packageVersion: string;
    private sourceFiles: RustFile[] = [];

    public constructor({ context, packageName, packageVersion }: RustProjectConfig) {
        super(context);
        this.packageName = packageName;
        this.packageVersion = packageVersion;
    }

    public get sourceFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public addSourceFiles(...files: RustFile[]): void {
        this.sourceFiles.push(...files);
    }

    public async persist(): Promise<void> {
        // Create source directory
        const absolutePathToSrcDirectory = join(this.absolutePathToOutputDirectory, this.sourceFileDirectory);
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        // Write all source files
        await Promise.all(this.sourceFiles.map((file) => file.write(this.absolutePathToOutputDirectory)));

        // Generate basic project files
        await this.writeCargoToml();
        await this.writeGitignore();
        await this.writeRustfmtConfig();
    }

    private async writeCargoToml(): Promise<void> {
        const cargoToml = this.generateCargoToml();
        const cargoFile = new RustFile({
            filename: "Cargo.toml",
            directory: RelativeFilePath.of(""),
            fileContents: cargoToml
        });
        await cargoFile.write(this.absolutePathToOutputDirectory);
    }

    private generateCargoToml(): string {
        const baseDependencies = {
            serde: { version: "1.0", features: ["derive"] },
            serde_json: "1.0",
            reqwest: { version: "0.11", features: ["json"] },
            tokio: { version: "1.0", features: ["full"] },
            thiserror: "1.0"
        };

        const baseDevDependencies = {
            "tokio-test": "0.4"
        };

        // Merge with custom dependencies from config
        const dependencies = {
            ...baseDependencies,
            ...this.context.customConfig.extraDependencies
        };

        const devDependencies = {
            ...baseDevDependencies,
            ...this.context.customConfig.extraDevDependencies
        };

        let cargo = "[package]\n";
        cargo += `name = "${this.packageName}"\n`;
        cargo += `version = "${this.packageVersion}"\n`;
        cargo += 'edition = "2021"\n\n';

        cargo += "[dependencies]\n";
        for (const [name, config] of Object.entries(dependencies)) {
            if (typeof config === "string") {
                cargo += `${name} = "${config}"\n`;
            } else {
                cargo += `${name} = ${this.objectToToml(config)}\n`;
            }
        }

        if (Object.keys(devDependencies).length > 0) {
            cargo += "\n[dev-dependencies]\n";
            for (const [name, version] of Object.entries(devDependencies)) {
                cargo += `${name} = "${version}"\n`;
            }
        }

        return cargo + "\n";
    }

    private objectToToml(obj: unknown): string {
        if (typeof obj === "string") {
            return `"${obj}"`;
        }
        if (Array.isArray(obj)) {
            return `[${obj.map((item) => `"${item}"`).join(", ")}]`;
        }
        if (typeof obj === "object" && obj !== null) {
            const pairs = Object.entries(obj).map(([key, value]) => {
                if (typeof value === "string") {
                    return `${key} = "${value}"`;
                } else if (Array.isArray(value)) {
                    return `${key} = [${value.map((item) => `"${item}"`).join(", ")}]`;
                } else {
                    return `${key} = ${this.objectToToml(value)}`;
                }
            });
            return `{ ${pairs.join(", ")} }`;
        }
        return String(obj);
    }

    private async writeGitignore(): Promise<void> {
        const gitignore = ["/target", "**/*.rs.bk", "Cargo.lock", ".DS_Store", "*.swp"].join("\n") + "\n";

        const gitignoreFile = new RustFile({
            filename: ".gitignore",
            directory: RelativeFilePath.of(""),
            fileContents: gitignore
        });
        await gitignoreFile.write(this.absolutePathToOutputDirectory);
    }

    private async writeRustfmtConfig(): Promise<void> {
        const rustfmtConfig = `# Generated by Fern
edition = "2021"
max_width = 100
use_small_heuristics = "Default"
imports_granularity = "Crate"
group_imports = "StdExternalCrate"
format_code_in_doc_comments = true
`;

        const rustfmtFile = new RustFile({
            filename: "rustfmt.toml",
            directory: RelativeFilePath.of(""),
            fileContents: rustfmtConfig
        });
        await rustfmtFile.write(this.absolutePathToOutputDirectory);
    }
}
