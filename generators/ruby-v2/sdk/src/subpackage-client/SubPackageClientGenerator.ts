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
const ASYNC_CLIENT_CLASS_NAME = "AsyncClient";

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
        const modules = this.getClientModuleNames().map((name) => ruby.module({ name }));
        const isMultiUrl = this.context.isMultipleBaseUrlsEnvironment();

        // Generate sync Client class
        const syncClientClass = this.generateClientClass(rootModule, isMultiUrl, false);

        // Generate async AsyncClient class
        const asyncClientClass = this.generateClientClass(rootModule, isMultiUrl, true);

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                // Wrap both classes in the same module hierarchy
                const wrappedSync = ruby.wrapInModules(syncClientClass, modules);
                wrappedSync.write(writer);
                writer.newLine();
                writer.newLine();
                const wrappedAsync = ruby.wrapInModules(asyncClientClass, modules);
                wrappedAsync.write(writer);
            }),
            directory: this.getFilepath(),
            filename: `client.rb`,
            customConfig: this.context.customConfig
        });
    }

    private generateClientClass(rootModule: ruby.Module_, isMultiUrl: boolean, isAsync: boolean): ruby.Class_ {
        const className = isAsync ? ASYNC_CLIENT_CLASS_NAME : CLIENT_CLASS_NAME;
        const rawClientClassReference = isAsync
            ? this.context.getAsyncRawClientClassReference()
            : this.context.getRawClientClassReference();

        const clientClass = ruby.class_({
            name: className
        });

        const initializeParams: ruby.KeywordParameter[] = [
            ruby.parameters.keyword({
                name: "client",
                type: ruby.Type.class_(rawClientClassReference)
            })
        ];

        if (isMultiUrl) {
            initializeParams.push(
                ruby.parameters.keyword({
                    name: "base_url",
                    type: ruby.Type.nilable(ruby.Type.string()),
                    initializer: ruby.nilValue()
                }),
                ruby.parameters.keyword({
                    name: "environment",
                    type: ruby.Type.nilable(ruby.Type.hash(ruby.Type.class_({ name: "Symbol" }), ruby.Type.string())),
                    initializer: ruby.nilValue()
                })
            );
        }

        clientClass.addStatement(
            ruby.method({
                name: "initialize",
                parameters: {
                    keyword: initializeParams
                },
                returnType: ruby.Type.void(),
                statements: [
                    ruby.codeblock((writer) => {
                        writer.writeLine("@client = client");
                        if (isMultiUrl) {
                            writer.writeLine("@base_url = base_url");
                            writer.writeLine("@environment = environment");
                        }
                    })
                ]
            })
        );

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (!this.context.subPackageHasEndpoints(subpackage)) {
                continue;
            }
            clientClass.addMethod(this.getSubpackageClientGetter(subpackage, rootModule, isAsync));
        }

        if (this.subpackage.service != null) {
            const service = this.context.getHttpServiceOrThrow(this.subpackage.service);
            const methods = this.generateEndpoints(service);
            clientClass.addStatements(methods);
        }

        return clientClass;
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

    private getSubpackageClientGetter(
        subpackage: FernIr.Subpackage,
        rootModule: ruby.Module_,
        isAsync: boolean
    ): ruby.Method {
        const isMultiUrl = this.context.isMultipleBaseUrlsEnvironment();
        const clientClassName = isAsync ? ASYNC_CLIENT_CLASS_NAME : CLIENT_CLASS_NAME;
        const instanceVarName = isAsync
            ? `async_${subpackage.name.snakeCase.safeName}`
            : subpackage.name.snakeCase.safeName;
        return new ruby.Method({
            name: subpackage.name.snakeCase.safeName,
            kind: ruby.MethodKind.Instance,
            returnType: ruby.Type.class_(
                ruby.classReference({
                    name: clientClassName,
                    modules: [rootModule.name, subpackage.name.pascalCase.safeName],
                    fullyQualified: true
                })
            ),
            statements: [
                ruby.codeblock((writer) => {
                    if (isMultiUrl) {
                        writer.writeLine(
                            `@${instanceVarName} ||= ` +
                                `${this.getClientModuleNames().join("::")}::` +
                                `${subpackage.name.pascalCase.safeName}::` +
                                `${clientClassName}.new(client: @client, base_url: @base_url, environment: @environment)`
                        );
                    } else {
                        writer.writeLine(
                            `@${instanceVarName} ||= ` +
                                `${this.getClientModuleNames().join("::")}::` +
                                `${subpackage.name.pascalCase.safeName}::` +
                                `${clientClassName}.new(client: @client)`
                        );
                    }
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
