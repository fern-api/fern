import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { join } from "path";

export abstract class AbstractModelGenerator extends FileGenerator<
    GoFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    public readonly typeReference: go.TypeReference;

    constructor(
        context: ModelGeneratorContext,
        protected readonly typeDeclaration: TypeDeclaration
    ) {
        super(context);
        this.typeReference = this.context.goTypeMapper.convertToTypeReference(this.typeDeclaration.name);
    }

    protected toFile(node: go.AstNode): GoFile {
        return new GoFile({
            node,
            importPath: this.getImportPath(),
            packageName: this.context.getTypePackageName({ fernFilepath: this.typeDeclaration.name.fernFilepath }),
            rootImportPath: this.context.getRootImportPath(),
            customConfig: this.context.customConfig,
            includeGeneratedCodeHeader: true,
            ...this.getFileInfo()
        });
    }

    protected getFilepath(): RelativeFilePath {
        const { directory, filename } = this.getFileInfo();
        return RelativeFilePath.of(join(directory, filename));
    }

    private getImportPath(): string {
        const location = this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
        return location.importPath;
    }

    private getFileInfo(): { directory: RelativeFilePath; filename: string } {
        const location = this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
        return {
            directory: location.directory,
            filename: this.context.getTypeFilename({ fernFilepath: this.typeDeclaration.name.fernFilepath })
        };
    }
}
