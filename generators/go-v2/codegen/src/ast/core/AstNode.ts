import { AbstractAstNode } from "@fern-api/generator-commons";
import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema";
import { GoFile } from "./GoFile";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toString({
        packageName,
        rootImportPath,
        importPath,
        customConfig
    }: {
        packageName: string;
        rootImportPath: string;
        importPath: string;
        customConfig: BaseGoCustomConfigSchema;
    }): Promise<string> {
        const file = new GoFile({
            packageName,
            rootImportPath,
            importPath,
            customConfig
        });
        this.write(file);
        return file.toString();
    }
}
