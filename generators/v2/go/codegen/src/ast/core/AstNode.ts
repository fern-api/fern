import { AbstractAstNode } from "@fern-api/generator-commons";
import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema";
import { Writer } from "./Writer";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public toString({
        packageName,
        rootImportPath,
        importPath,
        customConfig,
        snippet
    }: {
        packageName: string;
        rootImportPath: string;
        importPath: string;
        customConfig: BaseGoCustomConfigSchema;
        snippet?: boolean;
    }): string {
        const writer = new Writer({
            packageName,
            rootImportPath,
            importPath,
            customConfig
        });
        this.write(writer);
        return writer.toString({ snippet });
    }
}
