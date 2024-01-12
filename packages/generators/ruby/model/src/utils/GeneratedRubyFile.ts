import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Name } from "@fern-fern/ir-sdk/api";
import { AstNode } from "../ast/AstNode";
import { GeneratedFile } from "./GeneratedFile";

export declare namespace GeneratedRubyFile {
    export interface Init {
        rootNode: AstNode;
        directoryPrefix: RelativeFilePath;
        entityName: Name;
        isTestFile?: boolean;
    }
}
export class GeneratedRubyFile extends GeneratedFile {
    public entityName: Name;
    public rootNode: AstNode;

    constructor({ rootNode, directoryPrefix, entityName, isTestFile = false }: GeneratedRubyFile.Init) {
        // Path needs lib or test, if test: test/ is relative path
        // otherwise, relative path is:
        // lib/client_class_name.rb or request_client.rb or environment.rb or exception.rb OR
        // /lib/client_class_name/package_name/services/service_name.rb OR /lib/client_class_name/package_name/types/type_name.rb
        const updatedPrefix = isTestFile ? join("test", directoryPrefix) : join("lib", directoryPrefix);
        super(entityName.snakeCase.safeName, updatedPrefix, rootNode.write());

        this.entityName = entityName;
        this.rootNode = rootNode;
    }
}
