import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { Subpackage, SubpackageId } from "@fern-fern/ir-sdk/api";
import { HttpEndpointTestGenerator } from "../endpoint/test/HttpEndpointTestGenerator";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SubPackageTestGenerator {
    interface Args {
        subpackageId: SubpackageId;
        subpackage: Subpackage;
        context: SdkGeneratorContext;
    }
}

const CLIENT_CLASS_NAME = "Client";

export class SubPackageTestGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private subpackageId: SubpackageId;
    private subpackage: Subpackage;

    constructor({ subpackage, context, subpackageId }: SubPackageTestGenerator.Args) {
        super(context);
        this.subpackageId = subpackageId;
        this.subpackage = subpackage;
    }

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const clientClassToTest = ruby.class_({
            name: CLIENT_CLASS_NAME
        });

        if (!this.subpackage.service) {
            throw new Error("Attempted to generate a test file for a subpackage with no service");
        }
        const service = this.context.getHttpServiceOrThrow(this.subpackage.service);
        if (service.endpoints.length == 0) {
            throw new Error("Attempted to generate a test file for a subpackage with no endpoints");
        }

        const endpointBlocks: ruby.AstNode[] = [
            ruby.invokeMethod({
                on: null,
                method: "let",
                arguments_: [ruby.codeblock(":base_url")],
                block: [
                    [],
                    [
                        this.context.getDefaultEnvironmentClassReference() ??
                            ruby.TypeLiteral.string("https://api-test-url.com")
                    ]
                ]
            }),
            ruby.invokeMethod({
                on: null,
                method: "let",
                arguments_: [ruby.codeblock(":client")],
                block: [
                    [],
                    [
                        ruby.invokeMethod({
                            on: this.context.getRootClientClassReference(),
                            method: "new",
                            arguments_: [],
                            keywordArguments: [
                                ruby.keywordArgument({ name: "token", value: ruby.TypeLiteral.string("api_token") }),
                                ruby.keywordArgument({ name: "base_url", value: ruby.codeblock("base_url") })
                            ]
                        })
                    ]
                ]
            })
        ];

        const endpointTestBlocks: HttpEndpointTestGenerator.Output[] = [];

        for (const endpoint of service.endpoints) {
            const generator = new HttpEndpointTestGenerator({ context: this.context, endpoint });
            const testBlock = generator.generate();
            if (testBlock) {
                endpointTestBlocks.push(testBlock);
            }
        }

        if (endpointTestBlocks.length == 0) {
            throw new Error("Couldn't generate any test blocks");
        }

        const addedSampleMethods = new Set();

        for (const testBlock of endpointTestBlocks) {
            if (!addedSampleMethods.has(testBlock.returnTypeIdentifier)) {
                addedSampleMethods.add(testBlock.returnTypeIdentifier);
                endpointBlocks.push(testBlock.returnTypeSampleDef);
            }
        }

        for (const testBlock of endpointTestBlocks) {
            endpointBlocks.push(
                ruby.invokeMethod({
                    on: null,
                    method: "describe",
                    arguments_: [ruby.TypeLiteral.string(testBlock.blockTitle)],
                    block: [
                        [],
                        testBlock.tests.map((test) => {
                            return ruby.invokeMethod({
                                on: null,
                                method: "it",
                                arguments_: [ruby.TypeLiteral.string(test.title)],
                                block: [[], test.block]
                            });
                        })
                    ]
                })
            );
        }

        let [directory, filename] = this.getPathAndFilename();
        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                ruby.codeblock(`require "test_helper"`).write(writer);
                writer.newLine();
                ruby.invokeMethod({
                    on: null,
                    method: "describe",
                    arguments_: [this.getClientClassReference()],
                    block: [[], endpointBlocks]
                }).write(writer);
            }),
            directory,
            filename,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.getPathAndFilename()[0];
    }

    private getPathAndFilename(): [RelativeFilePath, string] {
        let nameParts = this.safeSubpackagePathParts();
        let lastName = nameParts.pop();
        if (!lastName) {
            throw new Error("Can't determine test filename if the fern filepath has no parts");
        }
        return [RelativeFilePath.of(["test", ...nameParts].join("/")), `${lastName.toLowerCase()}_client.test.rb`];
    }

    private getClientClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: CLIENT_CLASS_NAME,
            modules: [this.context.getRootModuleName(), ...this.safeSubpackagePathParts()],
            fullyQualified: true
        });
    }

    private safeSubpackagePathParts(): string[] {
        return this.subpackage.fernFilepath.allParts.map((path) => path.pascalCase.safeName);
    }

    //  private getSubpackageClientGetter(subpackage: FernIr.Subpackage, rootModule: ruby.Module_): ruby.Method {
    //      return new ruby.Method({
    //          name: subpackage.name.snakeCase.safeName,
    //          kind: ruby.MethodKind.Instance,
    //          returnType: ruby.Type.class_(
    //              ruby.classReference({
    //                  name: "Client",
    //                  modules: [rootModule.name, subpackage.name.pascalCase.safeName],
    //                  fullyQualified: true
    //              })
    //          ),
    //          statements: [
    //              ruby.codeblock((writer) => {
    //                  writer.writeLine(
    //                      `@${subpackage.name.snakeCase.safeName} ||= ` +
    //                          `${this.getClientModuleNames().join("::")}::` +
    //                          `${subpackage.name.pascalCase.safeName}::` +
    //                          `Client.new(client: @client)`
    //                  );
    //              })
    //          ]
    //      });
    //  }
}
