import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { HttpEndpoint, Subpackage, SubpackageId } from "@fern-fern/ir-sdk/api";
import { HttpEndpointTestGenerator } from "../endpoint/test/HttpEndpointTestGenerator";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

// export const CLIENT_MEMBER_NAME = "_client";
// export const GRPC_CLIENT_MEMBER_NAME = "_grpc";

export declare namespace SubTestGenerator {
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

    constructor({ subpackage, context, subpackageId }: SubTestGenerator.Args) {
        super(context);
        this.subpackageId = subpackageId;
        this.subpackage = subpackage;
    }

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const clientClassToTest = ruby.class_({
            name: CLIENT_CLASS_NAME
        });

        // TODO: Handle subpackages at higher level so they can be in their own files.

        //   for (const subpackage of this.getSubpackages()) {
        //       // skip subpackages that have no endpoints (recursively)
        //       if (!this.context.subPackageHasEndpoints(subpackage)) {
        //           continue;
        //       }
        //       // clientClass.addMethod(this.getSubpackageClientGetter(subpackage, rootModule));
        //   }

        if (!this.subpackage.service) {
            throw new Error("Attempted to generate a test file for a subpackage with no service");
        }
        const service = this.context.getHttpServiceOrThrow(this.subpackage.service);

        const endpointBlocks: ruby.MethodInvocation[] = [];

        for (const endpoint of service.endpoints) {
            endpointBlocks.push(this.generateEndpointTestBlock(endpoint));
        }

        if (endpointBlocks.length == 0) {
            throw new Error("Attempted to generate a test file for a subpackage with no endpoints");
        }

        let nameParts = this.safeSubpackagePathParts();
        if (nameParts.length == 0) {
            throw new Error("Can't determine test filename if the fern filepath has no parts");
        }
        let filename = `${nameParts.pop()}_client.test.rb`;
        let directory = RelativeFilePath.of(["test", ...nameParts].join("/"));

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
        return RelativeFilePath.of(["test", ...this.safeSubpackagePathParts()].join("/"));
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

    private generateEndpointTestBlock(endpoint: HttpEndpoint): ruby.MethodInvocation {
        const generator = new HttpEndpointTestGenerator({ context: this.context });
        const tests: HttpEndpointTestGenerator.Test[] = generator.generate({ endpoint });
        let testCalls: ruby.MethodInvocation[] = tests.map((test) => {
            return ruby.invokeMethod({
                on: null,
                method: "it",
                arguments_: [ruby.TypeLiteral.string(test.title)],
                block: [[], test.block]
            });
        });

        return ruby.invokeMethod({
            on: null,
            method: "describe",
            arguments_: [this.getClientClassReference()],
            block: [[], testCalls]
        });
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

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
