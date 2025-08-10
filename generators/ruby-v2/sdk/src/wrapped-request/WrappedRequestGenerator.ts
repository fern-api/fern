import { RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { HttpEndpoint, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace WrappedRequestGenerator {
    export interface Args {
        serviceId: ServiceId;
        wrapper: SdkRequestWrapper;
        context: SdkGeneratorContext;
        endpoint: HttpEndpoint;
    }
}


export class WrappedRequestGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;
    private endpoint: HttpEndpoint;

    constructor({ serviceId, wrapper, context, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
        this.endpoint = endpoint;
    }

    protected doGenerate(): RubyFile {
        const class_ = ruby.class_({
            name: this.wrapper.wrapperName.pascalCase.safeName
        });

        const rootModule = this.context.getRootModule();

        let nestedModule = rootModule;
        for (const filepath of this.context.getSubpackageForServiceId(this.serviceId).fernFilepath.allParts) {
            const module = ruby.module({
                name: filepath.pascalCase.safeName
            });
            nestedModule.addStatement(module);
            nestedModule = module;
        }
        nestedModule.addStatement(class_);

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                class_.write(writer);
            }),
            directory: this.getFilepath(),
            filename: `${this.wrapper.wrapperName.snakeCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        const subpackage = this.context.getSubpackageForServiceId(this.serviceId);
        const serviceDir = RelativeFilePath.of([
            "lib",
            this.context.getRootFolderName(),
            ...subpackage.fernFilepath.allParts.map((path) => path.snakeCase.safeName),
            "types"
        ].join("/"));
        return serviceDir;
    }
}
