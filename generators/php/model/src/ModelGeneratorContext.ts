import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractPhpGeneratorContext, AsIsFiles, FileLocation } from "@fern-api/php-codegen";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractPhpGeneratorContext<ModelCustomConfigSchema> {
    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.PhpStanNeon, AsIsFiles.PhpUnitXml];
    }

    public getLocationForTypeId(typeId: string): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        const parts = this.getPartsForFileLocation(typeDeclaration.name.fernFilepath);
        return {
            namespace: parts.join("\\"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }

    public getCoreAsIsFiles(): string[] {
        return [];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [];
    }
}
