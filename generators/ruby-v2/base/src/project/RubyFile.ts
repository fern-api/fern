import { AbstractFormatter, File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";

export declare namespace RubyFile {
    interface Args {
        /* The node to be written to the Ruby source file */
        node: ruby.AstNode;
        /* Directory of the file */
        directory: RelativeFilePath;
        /* Filename of the file */
        filename: string;
        /* Custom generator config */
        customConfig: BaseRubyCustomConfigSchema;
        /* Optional formatter */
        formatter?: AbstractFormatter;
    }
}

export class RubyFile extends File {
    constructor({ node, directory, filename, customConfig, formatter }: RubyFile.Args) {
        super(
            filename,
            directory,
            node.toString({
                customConfig,
                formatter
            })
        );
    }
}
