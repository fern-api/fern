import { HttpService, Subpackage, SubpackageId } from "@fern-fern/ir-sdk/api";

import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const CLIENT_MEMBER_NAME = "_client";
export const GRPC_CLIENT_MEMBER_NAME = "_grpc";

export declare namespace SubClientGenerator {
    interface Args {
        subpackageId: SubpackageId;
        subpackage: Subpackage;
        context: SdkGeneratorContext;
    }
}

const CLIENT_CLASS_NAME = "Client";

export class SubPackageClientGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private subpackageId: SubpackageId;
    private subpackage: Subpackage;

    constructor({ subpackage, context, subpackageId }: SubClientGenerator.Args) {
        super(context);
        this.subpackageId = subpackageId;
        this.subpackage = subpackage;
    }

    public doGenerate(): RubyFile {
        const clientClass = ruby.class_({
            name: CLIENT_CLASS_NAME
        });

        const rootModule = this.context.getRootModule();

        let nestedModule = rootModule;
        for (const filepath of this.subpackage.fernFilepath.allParts) {
            const module = ruby.module({
                name: filepath.pascalCase.safeName
            });
            nestedModule.addStatement(module);
            nestedModule = module;
        }
        nestedModule.addStatement(clientClass);

        clientClass.addStatement(
            ruby.method({
                name: "initialize",
                parameters: {
                    positional: [
                        ruby.parameters.positional({
                            name: "client",
                            type: ruby.Type.class_(this.context.getRawClientClassReference())
                        })
                    ]
                },
                returnType: ruby.Type.class_(this.getClientClassReference()),
                statements: [ruby.codeblock("@client = client")]
            })
        );

        if (this.subpackage.service != null) {
            const service = this.context.getHttpServiceOrThrow(this.subpackage.service);
            const methods = this.generateEndpoints(service);
            clientClass.addStatements(methods);
        }

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                rootModule.write(writer);
            }),
            directory: this.getFilepath(),
            filename: `client.rb`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForSubpackageId(this.subpackageId);
    }

    private getClientClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: CLIENT_CLASS_NAME,
            modules: [
                this.context.getRootModule().name,
                ...this.subpackage.fernFilepath.allParts.map((path) => path.pascalCase.safeName)
            ],
            fullyQualified: true
        });
    }

    private generateEndpoints(service: HttpService): ruby.Method[] {
        const methods: ruby.Method[] = [];
        for (const endpoint of service.endpoints) {
            const method = ruby.method({
                name: endpoint.name.snakeCase.safeName,
                returnType: ruby.Type.void()
            });
            methods.push(method);
        }

        return methods;
    }
}
