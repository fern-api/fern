import { cloneRepository } from "@fern-api/github";
import { template } from "es-toolkit/compat";
import { camelCase, upperFirst } from "es-toolkit/string";
import type fs from "fs";

import { FernGeneratorCli } from "../configuration/sdk";
import type { ReadmeFeature } from "../configuration/sdk/api";
import { StreamWriter, StringWriter, type Writer } from "../utils/Writer";
import { Block } from "./Block";
import { BlockMerger } from "./BlockMerger";
import type { ReadmeParser } from "./ReadmeParser";

export class ReadmeGenerator {
    private ADVANCED_FEATURE_ID = "ADVANCED";
    private ADVANCED_FEATURES = new Set<FernGeneratorCli.FeatureId>([
        FernGeneratorCli.StructuredFeatureId.Retries,
        FernGeneratorCli.StructuredFeatureId.Timeouts,
        FernGeneratorCli.StructuredFeatureId.CustomClient
    ]);

    private readmeParser: ReadmeParser;
    private readmeConfig: FernGeneratorCli.ReadmeConfig;
    private originalReadme: string | undefined;
    private languageTitle: string;
    private organizationPascalCase: string;
    private apiName: string;

    constructor({
        readmeParser,
        readmeConfig,
        originalReadme
    }: {
        readmeParser: ReadmeParser;
        readmeConfig: FernGeneratorCli.ReadmeConfig;
        originalReadme: string | undefined;
    }) {
        this.readmeParser = readmeParser;
        this.readmeConfig = readmeConfig;
        this.originalReadme = originalReadme;
        this.languageTitle = languageToTitle(this.readmeConfig.language);
        this.organizationPascalCase = pascalCase(this.readmeConfig.organization);
        this.apiName = this.readmeConfig.apiName ?? this.organizationPascalCase;
    }

    public async generateReadme({ output }: { output: fs.WriteStream | NodeJS.Process["stdout"] }): Promise<void> {
        const blocks = await this.generateBlocks();
        const mergedBlocks = await this.mergeBlocks({ blocks });

        const writer = new StreamWriter(output);
        await this.writeHeader({ writer });
        await this.writeTableOfContents({ writer, blocks: mergedBlocks });
        await this.writeBlocks({
            writer,
            blocks: mergedBlocks
        });
        await writer.end();
    }

    private async generateBlocks(): Promise<Block[]> {
        const blocks: Block[] = [];

        if (this.readmeConfig.apiReferenceLink != null) {
            blocks.push(
                await this.generateDocumentation({
                    docsLink: this.readmeConfig.apiReferenceLink
                })
            );
        }
        if (this.readmeConfig.requirements != null) {
            blocks.push(
                await this.generateRequirements({
                    requirements: this.readmeConfig.requirements
                })
            );
        }
        if (this.readmeConfig.language?.publishInfo != null) {
            blocks.push(
                await this.generateInstallation({
                    language: this.readmeConfig.language
                })
            );
        }
        if (this.readmeConfig.referenceMarkdownPath != null) {
            blocks.push(
                await this.generateReference({
                    referenceFile: this.readmeConfig.referenceMarkdownPath
                })
            );
        }

        if (this.readmeConfig.customSections != null) {
            const templateOptions = this.getCustomSectionTemplateOptions();
            for (const customSection of this.readmeConfig.customSections.filter(
                (section) => section.language.toLowerCase() === this.readmeConfig.language.type.toLowerCase()
            )) {
                blocks.push(
                    await this.generateCustomSection({
                        customSection,
                        templateOptions
                    })
                );
            }
        }

        const coreFeatures = this.readmeConfig.features?.filter((feat) => !this.isAdvanced(feat)) ?? [];
        const advancedFeatures = this.readmeConfig.features?.filter((feat) => this.isAdvanced(feat)) ?? [];

        for (const feature of coreFeatures) {
            if (this.shouldSkipFeature({ feature })) {
                continue;
            }
            blocks.push(
                await this.generateFeatureBlock({
                    feature
                })
            );
        }

        const advancedFeatureBlock = await this.generateNestedFeatureBlock({
            featureId: this.ADVANCED_FEATURE_ID,
            features: advancedFeatures
        });
        if (advancedFeatureBlock != null) {
            blocks.push(advancedFeatureBlock);
        }

        if (!this.featureDisabled(FernGeneratorCli.StructuredFeatureId.Contributing)) {
            blocks.push(this.generateContributing());
        }

        return blocks;
    }

    private featureDisabled(featureId: FernGeneratorCli.FeatureId): boolean {
        return this.readmeConfig.disabledFeatures?.includes(featureId) ?? false;
    }

    private isAdvanced(feat: ReadmeFeature): boolean {
        if (this.ADVANCED_FEATURES.has(feat.id)) {
            return true;
        }
        return feat.advanced ?? false;
    }

    private async generateNestedFeatureBlock({
        featureId,
        features
    }: {
        featureId: string;
        features: FernGeneratorCli.ReadmeFeature[];
    }): Promise<Block | undefined> {
        if (!this.shouldGenerateFeatures({ features })) {
            return undefined;
        }

        const writer = new StringWriter();
        await writer.writeLine(`## ${featureIDToTitle(featureId)}`);
        await writer.writeLine();

        for (const feature of features) {
            if (this.shouldSkipFeature({ feature })) {
                continue;
            }
            await this.generateFeatureBlock({
                feature,
                heading: "###",
                maybeWriter: writer
            });
        }
        return new Block({
            id: featureId,
            content: writer.toString()
        });
    }

    private async generateFeatureBlock({
        feature,
        heading = "##",
        maybeWriter
    }: {
        feature: FernGeneratorCli.ReadmeFeature;
        heading?: "##" | "###";
        maybeWriter?: StringWriter;
    }): Promise<Block> {
        const writer = maybeWriter ?? new StringWriter();
        await writer.writeLine(`${heading} ${featureIDToTitle(feature.id)}`);
        await writer.writeLine();
        if (feature.description != null) {
            await writer.writeLine(feature.description);
        }

        for (const [index, snippet] of feature.snippets?.entries() ?? []) {
            if (index > 0) {
                await writer.writeLine();
            }
            await writer.writeCodeBlock(this.readmeConfig.language.type, snippet);
        }
        if (feature.addendum != null) {
            await writer.writeLine(feature.addendum);
        }
        await writer.writeLine();
        return new Block({
            id: feature.id,
            content: writer.toString()
        });
    }

    private async mergeBlocks({ blocks }: { blocks: Block[] }): Promise<Block[]> {
        const originalReadmeContent = await this.getOriginalReadmeContent();
        if (originalReadmeContent == null) {
            return blocks;
        }
        const parsed = this.readmeParser.parse({
            content: originalReadmeContent
        });
        const merger = new BlockMerger({
            original: parsed.blocks.filter(
                (block) => !this.readmeConfig.disabledFeatures?.includes(block.id.toUpperCase())
            ),
            updated: blocks
        });
        return merger.merge();
    }

    private async getOriginalReadmeContent(): Promise<string | undefined> {
        if (this.originalReadme != null) {
            return this.originalReadme;
        }
        if (this.readmeConfig.remote != null) {
            const clonedRepository = await cloneRepository({
                githubRepository: this.readmeConfig.remote.repoUrl,
                installationToken: this.readmeConfig.remote.installationToken
            });
            // If a specific branch is specified, checkout that branch to get the README from it
            if (this.readmeConfig.remote.branch != null) {
                try {
                    await clonedRepository.checkout(this.readmeConfig.remote.branch);
                } catch (error) {
                    // If checkout fails (e.g., branch doesn't exist), fall back to the default branch
                    console.warn(
                        `Failed to checkout branch ${this.readmeConfig.remote.branch}, using default branch instead`
                    );
                }
            }
            return await clonedRepository.getReadme();
        }
        return undefined;
    }

    private async writeBlocks({ writer, blocks }: { writer: Writer; blocks: Block[] }): Promise<void> {
        for (const block of blocks) {
            await block.write(writer);
        }
    }

    private async writeHeader({ writer }: { writer: Writer }): Promise<void> {
        await writer.writeLine(`# ${this.apiName} ${this.languageTitle} Library`);
        await writer.writeLine();
        if (this.readmeConfig.bannerLink != null) {
            await this.writeBanner({
                writer,
                bannerLink: this.readmeConfig.bannerLink
            });
        }
        if (!this.isWhiteLabel()) {
            await this.writeFernShield({ writer });
        }
        if (this.readmeConfig.language != null) {
            await this.writeShield({
                writer,
                language: this.readmeConfig.language
            });
        }
        await writer.writeLine();
        await this.writeIntro({ writer });
    }

    private isWhiteLabel(): boolean {
        return this.readmeConfig.whiteLabel ?? false;
    }

    private async writeBanner({ writer, bannerLink }: { writer: Writer; bannerLink: string }): Promise<void> {
        await writer.writeLine(`![](${bannerLink})`);
        await writer.writeLine();
    }

    private async writeFernShield({ writer }: { writer: Writer }): Promise<void> {
        const repoSource = this.readmeConfig.remote?.repoUrl ?? `${this.organizationPascalCase}/${this.languageTitle}`;
        await writer.writeLine(
            `[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=${encodeURIComponent(repoSource)})`
        );
    }

    private async writeIntro({ writer }: { writer: Writer }): Promise<void> {
        await writer.writeLine(
            this.readmeConfig.introduction != null
                ? this.readmeConfig.introduction
                : `The ${this.apiName} ${this.languageTitle} library provides convenient access to the ${this.apiName} APIs from ${this.languageTitle}.`
        );
        await writer.writeLine();
    }

    private async writeTableOfContents({ writer, blocks }: { writer: Writer; blocks: Block[] }): Promise<void> {
        if (blocks.length === 0) {
            return;
        }

        await writer.writeLine("## Table of Contents");
        await writer.writeLine();

        for (const block of blocks) {
            const title = this.getBlockTitle(block.id);
            const anchor = this.getBlockAnchor(title);

            if (block.id === this.ADVANCED_FEATURE_ID) {
                await writer.writeLine(`- [${title}](#${anchor})`);

                const advancedFeatures = this.readmeConfig.features?.filter((feat) => this.isAdvanced(feat)) ?? [];
                for (const feature of advancedFeatures) {
                    if (this.shouldSkipFeature({ feature })) {
                        continue;
                    }
                    const featureTitle = featureIDToTitle(feature.id);
                    const featureAnchor = this.getBlockAnchor(featureTitle);
                    await writer.writeLine(`  - [${featureTitle}](#${featureAnchor})`);
                }
            } else {
                await writer.writeLine(`- [${title}](#${anchor})`);
            }
        }

        await writer.writeLine();
    }

    private getBlockTitle(blockId: string): string {
        if (blockId === this.ADVANCED_FEATURE_ID) {
            return featureIDToTitle(blockId);
        }

        switch (blockId.toUpperCase()) {
            case "DOCUMENTATION":
                return "Documentation";
            case "REFERENCE":
                return "Reference";
            case "REQUIREMENTS":
                return "Requirements";
            case "INSTALLATION":
                return "Installation";
            case "CONTRIBUTING":
                return "Contributing";
            default:
                return featureIDToTitle(blockId);
        }
    }

    private getBlockAnchor(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }

    private async generateDocumentation({ docsLink }: { docsLink: string }): Promise<Block> {
        const writer = new StringWriter();
        await writer.writeLine("## Documentation");
        await writer.writeLine();
        await writer.writeLine(`API reference documentation is available [here](${docsLink}).`);
        await writer.writeLine();
        return new Block({
            id: "DOCUMENTATION",
            content: writer.toString()
        });
    }

    private async generateReference({ referenceFile }: { referenceFile: string }): Promise<Block> {
        const writer = new StringWriter();
        await writer.writeLine("## Reference");
        await writer.writeLine();
        await writer.writeLine(
            `A full reference for this library is available [here](${
                this.readmeConfig.remote?.repoUrl != null
                    ? `${this.readmeConfig.remote.repoUrl}/blob/HEAD/${referenceFile}`
                    : referenceFile
            }).`
        );
        await writer.writeLine();
        return new Block({
            id: "REFERENCE",
            content: writer.toString()
        });
    }

    private getCustomSectionTemplateOptions(): Record<string, string> {
        let options: Record<string, string> = {
            apiName: this.apiName
        };
        if (this.readmeConfig.language.publishInfo != null) {
            options = {
                ...options,
                ...this.readmeConfig.language.publishInfo
            };
        }
        return options;
    }

    private applyTemplateOptions(content: string, options: Record<string, string>): string {
        try {
            return template(content, { interpolate: /{{([^}]+)}}/g })(options);
        } catch (error) {
            console.error(`[templates] ${JSON.stringify(error)}`);
            return content;
        }
    }

    private async generateCustomSection({
        customSection,
        templateOptions
    }: {
        customSection: FernGeneratorCli.CustomSection;
        templateOptions: Record<string, string>;
    }): Promise<Block> {
        const writer = new StringWriter();
        await writer.writeLine(`## ${customSection.name}`);
        await writer.writeLine();
        await writer.writeLine(this.applyTemplateOptions(customSection.content, templateOptions));
        await writer.writeLine();
        return new Block({
            id: toScreamingSnakeCase(customSection.name),
            content: writer.toString()
        });
    }

    private async generateRequirements({ requirements }: { requirements: string[] }): Promise<Block> {
        const writer = new StringWriter();
        await writer.writeLine("## Requirements");
        await writer.writeLine();
        if (requirements.length === 1) {
            await writer.writeLine(`This SDK requires ${requirements[0]}.`);
        } else {
            await writer.writeLine("This SDK requires:");
            for (const requirement of requirements) {
                await writer.writeLine(`- ${requirement}`);
            }
        }
        await writer.writeLine();
        return new Block({
            id: "REQUIREMENTS",
            content: writer.toString()
        });
    }

    private async generateInstallation({ language }: { language: FernGeneratorCli.LanguageInfo }): Promise<Block> {
        if (language.publishInfo == null) {
            // This should be unreachable.
            throw new Error("publish information is required for installation block");
        }
        const writer = new StringWriter();
        await writer.writeLine("## Installation");
        await writer.writeLine();
        switch (language.type) {
            case "typescript":
                await this.writeInstallationForNPM({
                    writer,
                    npm: language.publishInfo
                });
                break;
            case "python":
                await this.writeInstallationForPyPi({
                    writer,
                    pypi: language.publishInfo
                });
                break;
            case "java":
                await this.writeInstallationForMaven({
                    writer,
                    maven: language.publishInfo
                });
                break;
            case "go":
                await this.writeInstallationForGo({
                    writer,
                    go: language.publishInfo
                });
                break;
            case "ruby":
                await this.writeInstallationForRubyGems({
                    writer,
                    rubyGems: language.publishInfo
                });
                break;
            case "csharp":
                await this.writeInstallationForNuget({
                    writer,
                    nuget: language.publishInfo
                });
                break;
            case "php":
                await this.writeInstallationForComposer({
                    writer,
                    composer: language.publishInfo
                });
                break;
            case "rust":
                await this.writeInstallationForCargo({
                    writer,
                    cargo: language.publishInfo
                });
                break;
            case "swift":
                await this.writeInstallationForSwiftPackageManager({
                    writer,
                    spm: language.publishInfo
                });
                break;
            default:
                assertNever(language);
        }
        return new Block({
            id: "INSTALLATION",
            content: writer.toString()
        });
    }

    private async writeInstallationForNPM({
        writer,
        npm
    }: {
        writer: Writer;
        npm: FernGeneratorCli.NpmPublishInfo;
    }): Promise<void> {
        await writer.writeLine("```sh");
        await writer.writeLine(`npm i -s ${npm.packageName}`);
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForPyPi({
        writer,
        pypi
    }: {
        writer: Writer;
        pypi: FernGeneratorCli.PypiPublishInfo;
    }): Promise<void> {
        await writer.writeLine("```sh");
        await writer.writeLine(`pip install ${pypi.packageName}`);
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForMaven({
        writer,
        maven
    }: {
        writer: Writer;
        maven: FernGeneratorCli.MavenPublishInfo;
    }): Promise<void> {
        await writer.writeLine("### Gradle");
        await writer.writeLine();
        await writer.writeLine("Add the dependency in your `build.gradle` file:");
        await writer.writeLine();
        await writer.writeLine("```groovy");
        await writer.writeLine("dependencies {");
        await writer.writeLine(`  implementation '${maven.group}:${maven.artifact}'`);
        await writer.writeLine("}");
        await writer.writeLine("```");
        await writer.writeLine();

        await writer.writeLine("### Maven");
        await writer.writeLine();
        await writer.writeLine("Add the dependency in your `pom.xml` file:");
        await writer.writeLine();
        await writer.writeLine("```xml");
        await writer.writeLine("<dependency>");
        await writer.writeLine(`  <groupId>${maven.group}</groupId>`);
        await writer.writeLine(`  <artifactId>${maven.artifact}</artifactId>`);
        await writer.writeLine(`  <version>${maven.version}</version>`);
        await writer.writeLine("</dependency>");
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForGo({
        writer,
        go
    }: {
        writer: Writer;
        go: FernGeneratorCli.GoPublishInfo;
    }): Promise<void> {
        await writer.writeLine("```sh");
        await writer.write(`go get github.com/${go.owner}/${go.repo}`);
        const majorVersion = getMajorVersion(go.version);
        if (!majorVersion.startsWith("0") && !majorVersion.startsWith("1")) {
            // For Go, we need to append the major version to the module path for any release greater than v1.X.X.
            await writer.write(`/v${majorVersion}`);
        }
        await writer.writeLine();
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForRubyGems({
        writer,
        rubyGems
    }: {
        writer: Writer;
        rubyGems: FernGeneratorCli.RubyGemsPublishInfo;
    }): Promise<void> {
        await writer.writeLine("```sh");
        await writer.writeLine(`gem install ${rubyGems.packageName}`);
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForNuget({
        writer,
        nuget
    }: {
        writer: Writer;
        nuget: FernGeneratorCli.NugetPublishInfo;
    }): Promise<void> {
        await writer.writeLine("```sh");
        await writer.writeLine(`dotnet add package ${nuget.packageName}`);
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForComposer({
        writer,
        composer
    }: {
        writer: Writer;
        composer: FernGeneratorCli.ComposerPublishInfo;
    }): Promise<void> {
        await writer.writeLine("```sh");
        await writer.writeLine(`composer require ${composer.packageName}`);
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForCargo({
        writer,
        cargo
    }: {
        writer: Writer;
        cargo: FernGeneratorCli.CargoPublishInfo;
    }): Promise<void> {
        await writer.writeLine("Add this to your `Cargo.toml`:");
        await writer.writeLine();
        await writer.writeLine("```toml");
        await writer.writeLine("[dependencies]");
        await writer.writeLine(`${this.getCrateNameFromPackageName(cargo.packageName)} = "${cargo.version}"`);
        await writer.writeLine("```");
        await writer.writeLine();
        await writer.writeLine("Or install via cargo:");
        await writer.writeLine();
        await writer.writeLine("```sh");
        await writer.writeLine(`cargo add ${this.getCrateNameFromPackageName(cargo.packageName)}`);
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private async writeInstallationForSwiftPackageManager({
        writer,
        spm
    }: {
        writer: Writer;
        spm: FernGeneratorCli.SwiftPackageManagerPublishInfo;
    }): Promise<void> {
        await writer.writeLine(
            "With Swift Package Manager (SPM), add the following to the top-level `dependencies` array within your `Package.swift` file:"
        );
        await writer.writeLine();
        await writer.writeLine("```swift");
        await writer.writeLine("dependencies: [");
        await writer.writeLine(`    .package(url: "${spm.gitUrl}", from: "${spm.minVersion}"),`);
        await writer.writeLine("]");
        await writer.writeLine("```");
        await writer.writeLine();
    }

    private getCrateNameFromPackageName(packageName: string): string {
        return packageName.includes("/") ? (packageName.split("/").pop() ?? packageName) : packageName;
    }

    private async writeShield({
        writer,
        language
    }: {
        writer: Writer;
        language: FernGeneratorCli.LanguageInfo;
    }): Promise<void> {
        switch (language.type) {
            case "typescript": {
                const npm = language.publishInfo;
                if (npm == null) {
                    return;
                }
                await this.writeShieldForNPM({
                    writer,
                    npm
                });
                return;
            }
            case "python": {
                const pypi = language.publishInfo;
                if (pypi == null) {
                    return;
                }
                await this.writeShieldForPyPi({
                    writer,
                    pypi
                });
                return;
            }
            case "java": {
                const maven = language.publishInfo;
                if (maven == null) {
                    return;
                }
                await this.writeShieldForMaven({
                    writer,
                    maven
                });
                return;
            }
            case "go": {
                const go = language.publishInfo;
                if (go == null) {
                    return;
                }
                await this.writeShieldForGo({
                    writer,
                    go
                });
                return;
            }
            case "ruby": {
                const rubyGems = language.publishInfo;
                if (rubyGems == null) {
                    return;
                }
                await this.writeShieldForRubyGems({
                    writer,
                    rubyGems
                });
                return;
            }
            case "csharp": {
                const nuget = language.publishInfo;
                if (nuget == null) {
                    return;
                }
                await this.writeShieldForNuget({
                    writer,
                    nuget
                });
                return;
            }
            case "php": {
                const composer = language.publishInfo;
                if (composer == null) {
                    return;
                }
                await this.writeShieldForComposer({
                    writer,
                    composer
                });
                return;
            }
            case "rust": {
                const cargo = language.publishInfo;
                if (cargo == null) {
                    return;
                }
                await this.writeShieldForCargo({
                    writer,
                    cargo
                });
                return;
            }
            case "swift": {
                const spm = language.publishInfo;
                if (spm == null) {
                    return;
                }
                await this.writeShieldForSwiftPackageManager({
                    writer,
                    spm
                });
                return;
            }
            default:
                assertNever(language);
        }
    }

    private async writeShieldForNPM({
        writer,
        npm
    }: {
        writer: Writer;
        npm: FernGeneratorCli.NpmPublishInfo;
    }): Promise<void> {
        await writer.write("[![npm shield]");
        await writer.write(`(https://img.shields.io/npm/v/${npm.packageName})]`);
        await writer.writeLine(`(https://www.npmjs.com/package/${npm.packageName})`);
    }

    private async writeShieldForPyPi({
        writer,
        pypi
    }: {
        writer: Writer;
        pypi: FernGeneratorCli.PypiPublishInfo;
    }): Promise<void> {
        await writer.write("[![pypi]");
        await writer.write(`(https://img.shields.io/pypi/v/${pypi.packageName})]`);
        await writer.writeLine(`(https://pypi.python.org/pypi/${pypi.packageName})`);
    }

    private async writeShieldForMaven({
        writer,
        maven
    }: {
        writer: Writer;
        maven: FernGeneratorCli.MavenPublishInfo;
    }): Promise<void> {
        await writer.write("[![Maven Central]");
        await writer.write(`(https://img.shields.io/maven-central/v/${maven.group}/${maven.artifact})]`);
        await writer.writeLine(`(https://central.sonatype.com/artifact/${maven.group}/${maven.artifact})`);
    }

    private async writeShieldForGo({
        writer,
        go
    }: {
        writer: Writer;
        go: FernGeneratorCli.GoPublishInfo;
    }): Promise<void> {
        await writer.write("[![go shield]");
        await writer.write("(https://img.shields.io/badge/go-docs-blue)]");
        await writer.writeLine(`(https://pkg.go.dev/github.com/${go.owner}/${go.repo})`);
    }

    private async writeShieldForRubyGems({
        writer,
        rubyGems
    }: {
        writer: Writer;
        rubyGems: FernGeneratorCli.RubyGemsPublishInfo;
    }): Promise<void> {
        await writer.write("[![gems shield]");
        await writer.write(`(https://img.shields.io/gem/v/${rubyGems.packageName})]`);
        await writer.writeLine(`(https://rubygems.org/gems/${rubyGems.packageName})`);
    }

    private async writeShieldForNuget({
        writer,
        nuget
    }: {
        writer: Writer;
        nuget: FernGeneratorCli.NugetPublishInfo;
    }): Promise<void> {
        await writer.write("[![nuget shield]");
        await writer.write(`(https://img.shields.io/nuget/v/${nuget.packageName})]`);
        await writer.writeLine(`(https://nuget.org/packages/${nuget.packageName})`);
    }

    private async writeShieldForComposer({
        writer,
        composer
    }: {
        writer: Writer;
        composer: FernGeneratorCli.ComposerPublishInfo;
    }): Promise<void> {
        await writer.write("[![php shield]");
        await writer.write("(https://img.shields.io/badge/php-packagist-pink)]");
        await writer.writeLine(`(https://packagist.org/packages/${composer.packageName})`);
    }

    private async writeShieldForCargo({
        writer,
        cargo
    }: {
        writer: Writer;
        cargo: FernGeneratorCli.CargoPublishInfo;
    }): Promise<void> {
        await writer.write("[![crates.io shield]");
        await writer.write(`(https://img.shields.io/crates/v/${this.getCrateNameFromPackageName(cargo.packageName)})]`);
        await writer.writeLine(`(https://crates.io/crates/${this.getCrateNameFromPackageName(cargo.packageName)})`);
    }

    private async writeShieldForSwiftPackageManager({
        writer
    }: {
        writer: Writer;
        spm: FernGeneratorCli.SwiftPackageManagerPublishInfo;
    }): Promise<void> {
        await writer.write("![SwiftPM compatible]");
        await writer.writeLine("(https://img.shields.io/badge/SwiftPM-compatible-orange.svg)");
    }

    private generateContributing(): Block {
        return new Block({
            id: "CONTRIBUTING",
            content: `## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
`
        });
    }

    private shouldSkipFeature({ feature }: { feature: FernGeneratorCli.ReadmeFeature }): boolean {
        return (
            this.featureDisabled(feature.id) ||
            (!feature.snippetsAreOptional && (feature.snippets == null || feature.snippets.length === 0))
        );
    }

    private shouldGenerateFeatures({ features }: { features: FernGeneratorCli.ReadmeFeature[] }): boolean {
        return features.some((feature) => !this.shouldSkipFeature({ feature }));
    }
}

function languageToTitle(language: FernGeneratorCli.LanguageInfo): string {
    switch (language.type) {
        case "typescript":
            return "TypeScript";
        case "python":
            return "Python";
        case "go":
            return "Go";
        case "java":
            return "Java";
        case "ruby":
            return "Ruby";
        case "csharp":
            return "C#";
        case "php":
            return "PHP";
        case "rust":
            return "Rust";
        case "swift":
            return "Swift";
        default:
            assertNever(language);
    }
}

function featureIDToTitle(featureID: string): string {
    const words = featureID.split("_").map((s) => pascalCase(s));

    const lowercaseWords = new Set([
        "And",
        "Or",
        "Nor",
        "But",
        "For",
        "Yet",
        "So",
        "At",
        "By",
        "In",
        "Of",
        "On",
        "To",
        "As"
    ]);

    return words
        .map((word, index) => {
            if (index === 0 || index === words.length - 1) {
                return word;
            }
            if (lowercaseWords.has(word)) {
                return word.toLowerCase();
            }
            return word;
        })
        .join(" ");
}

function pascalCase(s: string): string {
    return upperFirst(camelCase(s));
}

function getMajorVersion(version: string): string {
    return version.split(".")[0] ?? "0";
}

function assertNever(x: never): never {
    throw new Error(`unexpected value: ${JSON.stringify(x)}`);
}

function toScreamingSnakeCase(s: string): string {
    return s.toUpperCase().replace(/ /g, "_");
}
