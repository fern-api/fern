import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Name } from "@fern-fern/ir-sdk/api";
import { AstNode } from "../ast/core/AstNode";
import { FROZEN_STRING_PREFIX } from "./Constants";
import { GeneratedFile } from "./GeneratedFile";

export declare namespace GeneratedRubyFile {
    export interface Init {
        rootNode: AstNode;
        directoryPrefix: RelativeFilePath;
        entityName: Name | string;
        isTestFile?: boolean;
        isConfigurationFile?: boolean;
    }
}
export class GeneratedRubyFile extends GeneratedFile {
    public entityName: Name | string;
    public rootNode: AstNode;

    constructor({
        rootNode,
        directoryPrefix,
        entityName,
        isTestFile = false,
        isConfigurationFile = false
    }: GeneratedRubyFile.Init) {
        // Path needs lib or test, if test: test/ is relative path
        // otherwise, relative path is:
        // lib/client_class_name.rb or request_client.rb or environment.rb or exception.rb OR
        // /lib/client_class_name/package_name/services/service_name.rb OR /lib/client_class_name/package_name/types/type_name.rb
        const updatedPrefix = isConfigurationFile ? "" : isTestFile ? "test" : "lib";
        super(
            typeof entityName === "string" ? entityName : `${entityName.snakeCase.safeName}.rb`,
            join(RelativeFilePath.of(updatedPrefix), directoryPrefix),
            FROZEN_STRING_PREFIX + rootNode.write()
        );

        this.entityName = entityName;
        this.rootNode = rootNode;
    }
}
