import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever, extractErrorMessage, noop } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractSwiftGeneratorCli } from "@fern-api/swift-base";
import { sanitizeSelf, swift } from "@fern-api/swift-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/swift-dynamic-snippets";
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
    SubClientGenerator,
    WireTestSuiteGenerator
} from "./generators";
import { ReferenceConfigAssembler } from "./reference";
import { SdkCustomConfigSchema, SdkCustomConfigSchemaDefaults } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";

export class SdkGeneratorCLI extends AbstractSwiftGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    private static readonly defaultCustomConfig: SdkCustomConfigSchema = {
        enableWireTests: SdkCustomConfigSchemaDefaults.enableWireTests
    };

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
        return customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : SdkGeneratorCLI.defaultCustomConfig;
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
        await this.generateSourceFiles(context);
        await Promise.all([this.generateRootFiles(context), this.generateTestFiles(context)]);
        await context.project.persist();
    }

    private async generateRootFiles(context: SdkGeneratorContext): Promise<void> {
        this.generatePackageSwiftFile(context);
        await Promise.all([this.generateReadme(context), this.generateReference(context)]);
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
            const endpointSnippets = this.generateSnippets(context);
            if (endpointSnippets.length === 0) {
                context.logger.debug("No snippets were produced; skipping README.md generation.");
                return;
            }
            const content = await context.generatorAgent.generateReadme({
                context,
                endpointSnippets
            });
            context.project.addRootFiles(new File("README.md", RelativeFilePath.of(""), content));
        } catch (e) {
            throw new Error(`Failed to generate README.md: ${extractErrorMessage(e)}`);
        }
    }

    private async generateReference(context: SdkGeneratorContext): Promise<void> {
        try {
            const builder = new ReferenceConfigAssembler(context).buildReferenceConfigBuilder();
            const content = await context.generatorAgent.generateReference(builder);
            context.project.addRootFiles(new File("reference.md", RelativeFilePath.of(""), content));
        } catch (e) {
            throw new Error(`Failed to generate reference.md: ${extractErrorMessage(e)}`);
        }
    }

    private generateSnippets(context: SdkGeneratorContext) {
        const endpointSnippets: FernGeneratorExec.Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }
        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: context.config
        });
        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);
            for (const endpointExample of endpoint.examples ?? []) {
                const generatedSnippet = dynamicSnippetsGenerator.generateSync(
                    convertDynamicEndpointSnippetRequest(endpointExample)
                );
                endpointSnippets.push({
                    exampleIdentifier: endpointExample.id,
                    id: {
                        method,
                        path,
                        identifierOverride: endpointId
                    },
                    // Snippets are marked as 'typescript' for compatibility with FernGeneratorExec, which will be deprecated.
                    snippet: FernGeneratorExec.EndpointSnippet.typescript({
                        client: generatedSnippet.snippet
                    })
                });
            }
        }
        return endpointSnippets;
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
                    nameCandidateWithoutExtension: def.filenameWithoutExtension,
                    directory: def.directory,
                    contents: await def.loadContents()
                });
            })
        );
    }

    private generateSourceSubClientFiles(context: SdkGeneratorContext): void {
        Object.entries(context.ir.subpackages).forEach(([subpackageId, subpackage]) => {
            const subclientGenerator = new SubClientGenerator({
                clientName: context.project.srcNameRegistry.getSubClientNameOrThrow(subpackageId),
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
        const requestsContainerSymbolName = context.project.srcNameRegistry.getRequestsContainerNameOrThrow();
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
                        name: context.project.srcNameRegistry.getRequestTypeNameOrThrow(
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
                } else if (endpoint.requestBody?.type === "fileUpload") {
                    const properties: swift.Property[] = endpoint.requestBody.properties
                        .map((p) =>
                            p._visit({
                                file: (fileProperty) => {
                                    return fileProperty._visit({
                                        file: (property) => {
                                            return swift.property({
                                                unsafeName: sanitizeSelf(property.key.name.camelCase.unsafeName),
                                                accessLevel: "public",
                                                declarationType: "let",
                                                type: swift.Type.custom("FormFile"),
                                                docs: property.docs
                                                    ? swift.docComment({ summary: property.docs })
                                                    : undefined
                                            });
                                        },
                                        fileArray: (property) => {
                                            return swift.property({
                                                unsafeName: sanitizeSelf(property.key.name.camelCase.unsafeName),
                                                accessLevel: "public",
                                                declarationType: "let",
                                                type: swift.Type.array(swift.Type.custom("FormFile")),
                                                docs: property.docs
                                                    ? swift.docComment({ summary: property.docs })
                                                    : undefined
                                            });
                                        },
                                        _other: () => null
                                    });
                                },
                                bodyProperty: (property) => {
                                    return swift.property({
                                        unsafeName: sanitizeSelf(property.name.name.camelCase.unsafeName),
                                        accessLevel: "public",
                                        declarationType: "let",
                                        type: context.getSwiftTypeForTypeReference(property.valueType),
                                        docs: property.docs ? swift.docComment({ summary: property.docs }) : undefined
                                    });
                                },
                                _other: () => null
                            })
                        )
                        .filter((p) => p !== null);

                    const struct = swift.struct({
                        name: context.project.srcSymbolRegistry.getRequestTypeSymbolOrThrow(
                            endpoint.id,
                            endpoint.requestBody.name.pascalCase.unsafeName
                        ),
                        accessLevel: "public",
                        properties,
                        initializers: [
                            swift.initializer({
                                accessLevel: "public",
                                parameters: properties.map((p) =>
                                    swift.functionParameter({
                                        argumentLabel: p.unsafeName,
                                        unsafeName: p.unsafeName,
                                        type: p.type,
                                        defaultValue: p.type.isOptional ? swift.Expression.rawValue("nil") : undefined
                                    })
                                ),
                                body: swift.CodeBlock.withStatements(
                                    properties.map((p) =>
                                        swift.Statement.propertyAssignment(
                                            p.unsafeName,
                                            swift.Expression.reference(p.unsafeName)
                                        )
                                    )
                                ),
                                multiline: true
                            })
                        ],
                        docs: endpoint.requestBody.docs
                            ? swift.docComment({ summary: endpoint.requestBody.docs })
                            : undefined
                    });
                    const requestContainerExtension = swift.extension({
                        name: requestsContainerSymbolName,
                        nestedTypes: [struct]
                    });

                    const multipartFormFields: swift.Expression[] = endpoint.requestBody.properties
                        .map((p) =>
                            p._visit({
                                file: (fileProperty) => {
                                    return fileProperty._visit({
                                        file: (property) => {
                                            return swift.Expression.contextualMethodCall({
                                                methodName: "file",
                                                arguments_: [
                                                    swift.functionArgument({
                                                        value: swift.Expression.reference(
                                                            property.key.name.camelCase.unsafeName
                                                        )
                                                    }),
                                                    swift.functionArgument({
                                                        label: "fieldName",
                                                        value: swift.Expression.stringLiteral(property.key.wireValue)
                                                    })
                                                ]
                                            });
                                        },
                                        fileArray: (property) => {
                                            return swift.Expression.contextualMethodCall({
                                                methodName: "fileArray",
                                                arguments_: [
                                                    swift.functionArgument({
                                                        value: swift.Expression.reference(
                                                            property.key.name.camelCase.unsafeName
                                                        )
                                                    }),
                                                    swift.functionArgument({
                                                        label: "fieldName",
                                                        value: swift.Expression.stringLiteral(property.key.wireValue)
                                                    })
                                                ]
                                            });
                                        },
                                        _other: () => null
                                    });
                                },
                                bodyProperty: (property) => {
                                    return swift.Expression.contextualMethodCall({
                                        methodName: "field",
                                        arguments_: [
                                            swift.functionArgument({
                                                value: swift.Expression.reference(
                                                    property.name.name.camelCase.unsafeName
                                                )
                                            }),
                                            swift.functionArgument({
                                                label: "fieldName",
                                                value: swift.Expression.stringLiteral(property.name.wireValue)
                                            })
                                        ]
                                    });
                                },
                                _other: () => null
                            })
                        )
                        .filter((p) => p !== null);

                    const requestStructExtension = swift.extension({
                        name: context.project.srcSymbolRegistry.getFullyQualifiedRequestTypeSymbolOrThrow(
                            endpoint.id,
                            endpoint.requestBody.name.pascalCase.unsafeName
                        ),
                        conformances: [swift.Protocol.MultipartFormDataConvertible],
                        computedProperties: [
                            swift.computedProperty({
                                unsafeName: "multipartFormFields",
                                type: swift.Type.array(swift.Type.custom("MultipartFormField")),
                                body: swift.Expression.arrayLiteral({
                                    elements: multipartFormFields,
                                    multiline: true
                                })
                            })
                        ]
                    });

                    context.project.addSourceFile({
                        nameCandidateWithoutExtension: `${requestsContainerSymbolName}+${struct.name}`,
                        directory: context.requestsDirectory,
                        contents: [requestContainerExtension, swift.LineBreak.double(), requestStructExtension]
                    });
                }
            });
        });
    }

    private generateSourceSchemaFiles(context: SdkGeneratorContext): void {
        for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            typeDeclaration.shape._visit({
                alias: (atd) => {
                    const name = context.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeId);
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
                        name: context.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
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
                        name: context.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
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
                        name: context.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
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
                        name: context.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeId),
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
            clientName: context.project.srcSymbolRegistry.getRootClientSymbolOrThrow(),
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
                enumName: context.project.srcSymbolRegistry.getEnvironmentSymbolOrThrow(),
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

    private async generateTestFiles(context: SdkGeneratorContext): Promise<void> {
        if (!context.hasTests) {
            return;
        }
        await this.generateTestAsIsFiles(context);
        if (context.customConfig.enableWireTests) {
            this.generateWireTestSuiteFiles(context);
        }
    }

    private async generateTestAsIsFiles(context: SdkGeneratorContext): Promise<void> {
        await Promise.all(
            context.getTestAsIsFiles().map(async (def) => {
                context.project.addTestAsIsFile({
                    nameCandidateWithoutExtension: def.filenameWithoutExtension,
                    directory: def.directory,
                    contents: await def.loadContents()
                });
            })
        );
    }

    private generateWireTestSuiteFiles(context: SdkGeneratorContext): void {
        Object.entries(context.ir.subpackages).forEach(([subpackageId, subpackage]) => {
            const subclientName = context.project.srcSymbolRegistry.getSubClientSymbolOrThrow(subpackageId);
            const testSuiteName = context.project.testSymbolRegistry.getWireTestSuiteSymbolOrThrow(subclientName);
            const testSuiteGenerator = new WireTestSuiteGenerator({
                suiteName: testSuiteName,
                subclientName,
                packageOrSubpackage: subpackage,
                sdkGeneratorContext: context
            });
            const struct = testSuiteGenerator.generate();
            const fernFilepathDir = context.getDirectoryForFernFilepath(subpackage.fernFilepath);
            context.project.addTestFile({
                nameCandidateWithoutExtension: struct.name,
                directory: join(RelativeFilePath.of("Wire/Resources"), RelativeFilePath.of(fernFilepathDir)),
                contents: [
                    swift.Statement.import("Foundation"),
                    swift.Statement.import("Testing"),
                    swift.Statement.import(context.srcTargetName),
                    swift.LineBreak.single(),
                    struct
                ]
            });
        });
    }
}
