import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";
import path from "path";
import { AstNode } from "../ast/core/AstNode";
import { GeneratedFile } from "./GeneratedFile";
import { FROZEN_STRING_PREFIX } from "./RubyConstants";
import { getLocationForTypeDeclaration } from "./RubyUtilities";

export declare namespace GeneratedRubyFile {
    export interface Init {
        rootNode: AstNode | AstNode[];
        directoryPrefix: RelativeFilePath;
        name: string | DeclaredTypeName;
        isTestFile?: boolean;
        isConfigurationFile?: boolean;
    }
}
export class GeneratedRubyFile extends GeneratedFile {
    public rootNode: AstNode[];

    constructor({
        rootNode,
        directoryPrefix,
        name,
        isTestFile = false,
        isConfigurationFile = false
    }: GeneratedRubyFile.Init) {
        // Path needs lib or test, if test: test/ is relative path
        // otherwise, relative path is:
        // lib/client_class_name.rb or request_client.rb or environment.rb or exception.rb OR
        // /lib/client_class_name/package_name/services/service_name.rb OR /lib/client_class_name/package_name/types/type_name.rb
        const updatedPrefix = isConfigurationFile ? "" : isTestFile ? "test" : "lib";
        const filePathFull = typeof name === "string" ? name : `${getLocationForTypeDeclaration(name)}.rb`;
        const fileName = path.parse(filePathFull).base;
        const filePath = path.parse(filePathFull).dir;

        const nodesToWrite = rootNode instanceof Array ? rootNode : [rootNode];

        super(
            fileName,
            join(RelativeFilePath.of(updatedPrefix), directoryPrefix, RelativeFilePath.of(filePath)),
            FROZEN_STRING_PREFIX +
                nodesToWrite.map((node) => node.write(0, AbsoluteFilePath.of("/" + filePath))).join("\n")
        );

        this.rootNode = nodesToWrite;
    }
}
