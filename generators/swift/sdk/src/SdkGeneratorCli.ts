import { GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever, noop } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractSwiftGeneratorCli, SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import {
    AliasGenerator,
    DiscriminatedUnionGenerator,
    LiteralEnumGenerator,
    ObjectGenerator,
    StringEnumGenerator,
    UndiscriminatedUnionGenerator
} from "@fern-api/swift-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import {
    PackageSwiftGenerator,
    RootClientGenerator,
    SingleUrlEnvironmentGenerator,
    SnippetJsonGenerator,
    SubClientGenerator
} from "./generators";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class SdkGeneratorCLI extends AbstractSwiftGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: SdkCustomConfigSchema): SdkCustomConfigSchema {
        return customConfig;
    }

    protected async publishPackage(_context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
        if (context.isSelfHosted()) {
            await context.generatorAgent.pushToGitHub({ context });
        }
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        await Promise.all([this.generateRootFiles(context), this.generateSourceFiles(context)]);
        await context.project.persist();
    }

    private async generateRootFiles(context: SdkGeneratorContext): Promise<void> {
        this.generatePackageSwiftFile(context);
        await this.generateReadme(context);
    }

    private generatePackageSwiftFile(context: SdkGeneratorContext): void {
        const generator = new PackageSwiftGenerator({
            sdkGeneratorContext: context
        });
        const file = generator.generate();
        context.project.addRootFiles(file);
    }

    private async generateReadme(context: SdkGeneratorContext): Promise<void> {
        try {
            const snippets = await new SnippetJsonGenerator({ context }).generate();
            const content = await context.generatorAgent.generateReadme({
                context,
                endpointSnippets: snippets.endpoints
            });
            context.project.addRootFiles(
                new SwiftFile({
                    filename: "README.md",
                    fileContents: content,
                    directory: RelativeFilePath.of("")
                })
            );
        } catch (e) {
            context.logger.warn("Failed to generate README.md, this is OK.");
        }
    }

    private async generateSourceFiles(context: SdkGeneratorContext): Promise<void> {
        // Generation order determines priority when resolving duplicate file names
        await this.generateSourceAsIsFiles(context);
        this.generateSourceSubClientFiles(context);
        this.generateSourceRequestFiles(context);
        this.generateSourceSchemaFiles(context);
        this.generateSourceRootClientFile(context);
        this.generateSourceEnvironmentFile(context);
    }

    private async generateSourceAsIsFiles(context: SdkGeneratorContext): Promise<void> {
        await Promise.all(
            context.getSourceAsIsFiles().map(async (def) => {
                context.project.addSourceAsIsFile({
                    filenameWithoutExt: def.filenameWithoutExtension,
                    directory: def.directory,
                    contents: await def.loadContents()
                });
            })
        );
    }

    private generateSourceSubClientFiles(context: SdkGeneratorContext): void {
        Object.entries(context.ir.subpackages).forEach(([subpackageId, subpackage]) => {
            const subclientGenerator = new SubClientGenerator({
                clientName: context.project.symbolRegistry.getSubClientSymbolOrThrow(subpackageId),
                subpackage,
                sdkGeneratorContext: context
            });
            const class_ = subclientGenerator.generate();
            const fernFilepathDir = context.getDirectoryForFernFilepath(subpackage.fernFilepath);
            context.project.addSourceFile({
                nameCandidateWithoutExtension: class_.name,
                directory: join(context.resourcesDirectory, RelativeFilePath.of(fernFilepathDir)),
                contents: [class_]
            });
        });
    }

    private generateSourceRequestFiles(context: SdkGeneratorContext): void {
        const requestsContainerSymbolName = context.project.symbolRegistry.getRequestsContainerSymbolOrThrow();
        const requestsContainerEnum = swift.enumWithRawValues({
            accessLevel: "public",
            name: requestsContainerSymbolName,
            cases: [],
            docs: swift.docComment({
                summary: "Container for all inline request types used throughout the SDK.",
                description:
                    "This enum serves as a namespace to organize request types that are defined inline within endpoint specifications."
            })
        });
        context.project.addSourceFile({
            nameCandidateWithoutExtension: requestsContainerEnum.name,
            directory: context.requestsDirectory,
            contents: [requestsContainerEnum]
        });
        Object.entries(context.ir.services).forEach(([_, service]) => {
            service.endpoints.forEach((endpoint) => {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    const generator = new ObjectGenerator({
                        name: context.project.symbolRegistry.getRequestTypeSymbolOrThrow(
                            endpoint.id,
                            endpoint.requestBody.name.pascalCase.unsafeName
                        ),
                        properties: endpoint.requestBody.properties,
                        extendedProperties: endpoint.requestBody.extendedProperties,
                        docsContent: endpoint.requestBody.docs,
                        context
                    });
                    const struct = generator.generate();
                    const extension = swift.extension({
                        name: requestsContainerSymbolName,
                        nestedTypes: [struct]
                    });
                    context.project.addSourceFile({
                        nameCandidateWithoutExtension: `${requestsContainerSymbolName}+${struct.name}`,
                        directory: context.requestsDirectory,
                        contents: [extension]
                    });
                }
            });
        });
    }

    private generateSourceSchemaFiles(context: SdkGeneratorContext): void {
        for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            typeDeclaration.shape._visit({
                alias: (atd) => {
                    const name = context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId);
                    if (atd.aliasOf.type === "container" && atd.aliasOf.container.type === "literal") {
                        // Swift does not support literal aliases, so we need to generate a custom type for them
                        const literalType = atd.aliasOf.container.literal;
                        if (literalType.type === "string") {
                            const generator = new LiteralEnumGenerator({
                                name,
                                literalValue: literalType.string,
                                docsContent: typeDeclaration.docs
                            });
                            const enum_ = generator.generate();
                            context.project.addSourceFile({
                                nameCandidateWithoutExtension: enum_.name,
                                directory: context.schemasDirectory,
                                contents: [enum_]
                            });
                        } else if (literalType.type === "boolean") {
                            // TODO(kafkas): Implement boolean literals
                            const generator = new AliasGenerator({
                                name,
                                typeDeclaration: atd,
                                docsContent: typeDeclaration.docs,
                                context
                            });
                            const declaration = generator.generate();
                            context.project.addSourceFile({
                                nameCandidateWithoutExtension: name,
                                directory: context.schemasDirectory,
                                contents: [declaration]
                            });
                        } else {
                            assertNever(literalType);
                        }
                    } else {
                        const generator = new AliasGenerator({
                            name,
                            typeDeclaration: atd,
                            docsContent: typeDeclaration.docs,
                            context
                        });
                        const declaration = generator.generate();
                        context.project.addSourceFile({
                            nameCandidateWithoutExtension: name,
                            directory: context.schemasDirectory,
                            contents: [declaration]
                        });
                    }
                },
                enum: (etd) => {
                    const generator = new StringEnumGenerator({
                        name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                        source: { type: "ir", enumTypeDeclaration: etd },
                        docsContent: typeDeclaration.docs
                    });
                    const enum_ = generator.generate();
                    context.project.addSourceFile({
                        nameCandidateWithoutExtension: enum_.name,
                        directory: context.schemasDirectory,
                        contents: [enum_]
                    });
                },
                object: (otd) => {
                    const generator = new ObjectGenerator({
                        name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                        properties: otd.properties,
                        extendedProperties: otd.extendedProperties,
                        docsContent: typeDeclaration.docs,
                        context
                    });
                    const struct = generator.generate();
                    context.project.addSourceFile({
                        nameCandidateWithoutExtension: struct.name,
                        directory: context.schemasDirectory,
                        contents: [struct]
                    });
                },
                undiscriminatedUnion: (uutd) => {
                    const generator = new UndiscriminatedUnionGenerator({
                        name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                        typeDeclaration: uutd,
                        docsContent: typeDeclaration.docs,
                        context
                    });
                    const enum_ = generator.generate();
                    context.project.addSourceFile({
                        nameCandidateWithoutExtension: enum_.name,
                        directory: context.schemasDirectory,
                        contents: [enum_]
                    });
                },
                union: (utd) => {
                    const generator = new DiscriminatedUnionGenerator({
                        name: context.project.symbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
                        unionTypeDeclaration: utd,
                        docsContent: typeDeclaration.docs,
                        context
                    });
                    const enum_ = generator.generate();
                    context.project.addSourceFile({
                        nameCandidateWithoutExtension: enum_.name,
                        directory: context.schemasDirectory,
                        contents: [enum_]
                    });
                },
                _other: noop
            });
        }
    }

    private generateSourceRootClientFile(context: SdkGeneratorContext): void {
        const rootClientGenerator = new RootClientGenerator({
            clientName: context.project.symbolRegistry.getRootClientSymbolOrThrow(),
            package_: context.ir.rootPackage,
            sdkGeneratorContext: context
        });
        const rootClientClass = rootClientGenerator.generate();
        context.project.addSourceFile({
            nameCandidateWithoutExtension: rootClientClass.name,
            directory: RelativeFilePath.of(""),
            contents: [rootClientClass]
        });
    }

    private generateSourceEnvironmentFile(context: SdkGeneratorContext): void {
        if (context.ir.environments && context.ir.environments.environments.type === "singleBaseUrl") {
            const environmentGenerator = new SingleUrlEnvironmentGenerator({
                enumName: context.project.symbolRegistry.getEnvironmentSymbolOrThrow(),
                environments: context.ir.environments.environments,
                sdkGeneratorContext: context
            });
            const environmentEnum = environmentGenerator.generate();
            context.project.addSourceFile({
                nameCandidateWithoutExtension: environmentEnum.name,
                directory: RelativeFilePath.of(""),
                contents: [environmentEnum]
            });
        } else {
            // TODO(kafkas): Handle multiple environments
        }
    }
}
