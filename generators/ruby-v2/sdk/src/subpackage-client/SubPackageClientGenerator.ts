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
        service?: HttpService;
    }
}

const CLIENT_CLASS_NAME = "Client";

export class SubPackageClientGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private subpackageId: SubpackageId;

    constructor({ subpackage, context, subpackageId, service }: SubClientGenerator.Args) {
        super(context);
        this.subpackageId = subpackageId;
    }

    public doGenerate(): RubyFile {
        const clientClass = ruby.class_({
            name: CLIENT_CLASS_NAME,
        });
        
        const rootModule = this.context.getRootModule();
        rootModule.addStatement(clientClass);

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" })
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
}
