import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { join } from "path";

export class EnumGenerator extends FileGenerator<GoFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeReference: go.TypeReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);
        this.typeReference = this.context.goTypeMapper.convertToTypeReference(this.typeDeclaration.name);
    }

    protected doGenerate(): GoFile {
        const enum_ = go.enum_({
            ...this.typeReference,
            docs: this.typeDeclaration.docs
        });
        for (const member of this.enumDeclaration.values) {
            enum_.addMember({ name: member.name.name.pascalCase.safeName, value: member.name.wireValue });
        }
        return new GoFile({
            node: enum_,
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
