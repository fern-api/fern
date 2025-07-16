import path from "path";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { AstNode } from "../ast/core/AstNode";
import { GeneratedFile } from "./GeneratedFile";
import { FROZEN_STRING_PREFIX } from "./RubyConstants";

export declare namespace GeneratedRubyFile {
    export interface Init {
        rootNode: AstNode | AstNode[];
        fullPath: string;
        isTestFile?: boolean;
        isConfigurationFile?: boolean;
        fileExtension?: string;
    }
}
export class GeneratedRubyFile extends GeneratedFile {
    public rootNode: AstNode[];

    constructor({
        rootNode,
        fullPath,
        isTestFile = false,
        isConfigurationFile = false,
        fileExtension = "rb"
    }: GeneratedRubyFile.Init) {
        // Path needs lib or test, if test: test/ is relative path
        // otherwise, relative path is:
        // lib/client_class_name.rb or request_client.rb or environment.rb or exception.rb OR
        // /lib/client_class_name/package_name/services/service_name.rb OR /lib/client_class_name/package_name/types/type_name.rb
        const updatedPrefix = isConfigurationFile ? "" : isTestFile ? "test" : "lib";
        // Make sure the filename is snakecase
        const fileName = `${path.parse(fullPath).base}.${fileExtension}`;
        const filePath = path.parse(fullPath).dir;

        const nodesToWrite = rootNode instanceof Array ? rootNode : [rootNode];

        super(
            fileName,
            join(RelativeFilePath.of(updatedPrefix), RelativeFilePath.of(filePath)),
            FROZEN_STRING_PREFIX +
                nodesToWrite
                    .map((node) =>
                        node.write({
                            startingTabSpaces: 0,
                            filePath: AbsoluteFilePath.of("/" + filePath)
                        })
                    )
                    .join("\n")
        );

        this.rootNode = nodesToWrite;
    }
}
