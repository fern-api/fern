import { AbstractFormatter, File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { TypeScriptFormatter } from "@fern-api/typescript-formatter";

export declare namespace TypescriptMcpFile {
    interface Args {
        /* The node to be written to the typescript source file */
        node: ts.AstNode;
        /* Directory of the file */
        directory: RelativeFilePath;
        /* Filename of the file */
        filename: string;
        /* Custom generator config */
        customConfig: TypescriptCustomConfigSchema;
        /* Optional formatter */
        formatter?: AbstractFormatter;
    }
}

export class TypescriptMcpFile extends File {
    constructor({ node, directory, filename, customConfig, formatter }: TypescriptMcpFile.Args) {
        const _formatter = formatter ?? new TypeScriptFormatter();
        super(
            filename,
            directory,
            node.toString({
                customConfig,
                formatter: _formatter
            })
        );
    }
}
