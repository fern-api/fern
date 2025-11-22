import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { HttpService, Subpackage, SubpackageId } from "@fern-fern/ir-sdk/api";
import { RawClient } from "../endpoint/http/RawClient";
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
        const rootModule = this.context.getRootModule();
        const clientClass = ruby.class_({
            name: CLIENT_CLASS_NAME
        });

        const modules = this.getClientModuleNames().map((name) => ruby.module({ name }));

        clientClass.addStatement(
            ruby.method({
                name: "initialize",
                parameters: {
                    keyword: [
                        ruby.parameters.keyword({
                            name: "client",
                            type: ruby.Type.class_(this.context.getRawClientClassReference())
                        })
                    ]
                },
                returnType: ruby.Type.void(),
                statements: [ruby.codeblock("@client = client")]
            })
        );

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (!this.context.subPackageHasEndpoints(subpackage)) {
                continue;
            }
            clientClass.addMethod(this.getSubpackageClientGetter(subpackage, rootModule));
        }

        if (this.subpackage.service != null) {
            const service = this.context.getHttpServiceOrThrow(this.subpackage.service);
            const methods = this.generateEndpoints(service);
            clientClass.addStatements(methods);
        }

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                ruby.wrapInModules(clientClass, modules).write(writer);
            }),
            directory: this.getFilepath(),
            filename: `client.rb`,
            customConfig: this.context.customConfig
        });
    }

    private getClientModuleNames(): string[] {
        return [
            this.context.getRootModuleName(),
            ...this.subpackage.fernFilepath.allParts.map((path) => path.pascalCase.safeName)
        ];
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForSubpackageId(this.subpackageId);
    }

    private getClientClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: CLIENT_CLASS_NAME,
            modules: [
                this.context.getRootModuleName(),
                ...this.subpackage.fernFilepath.allParts.map((path) => path.pascalCase.safeName)
            ],
            fullyQualified: true
        });
    }

    private generateEndpoints(service: HttpService): ruby.Method[] {
        const methods: ruby.Method[] = [];
        for (const endpoint of service.endpoints) {
            if (this.subpackage.service != null) {
                const generatedMethods = this.context.endpointGenerator.generate({
                    endpoint,
                    serviceId: this.subpackage.service,
                    rawClientReference: "",
                    rawClient: new RawClient(this.context)
                });
                methods.push(...generatedMethods);
            }
        }
        return methods;
    }

    private getSubpackageClientGetter(subpackage: FernIr.Subpackage, rootModule: ruby.Module_): ruby.Method {
        return new ruby.Method({
            name: subpackage.name.snakeCase.safeName,
            kind: ruby.MethodKind.Instance,
            returnType: ruby.Type.class_(
                ruby.classReference({
                    name: "Client",
                    modules: [rootModule.name, subpackage.name.pascalCase.safeName],
                    fullyQualified: true
                })
            ),
            statements: [
                ruby.codeblock((writer) => {
                    writer.writeLine(
                        `@${subpackage.name.snakeCase.safeName} ||= ` +
                            `${this.getClientModuleNames().join("::")}::` +
                            `${subpackage.name.pascalCase.safeName}::` +
                            `Client.new(client: @client)`
                    );
                })
            ]
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
