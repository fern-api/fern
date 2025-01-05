import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractPhpGeneratorContext, AsIsFiles, FileLocation } from "@fern-api/php-codegen";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractPhpGeneratorContext<ModelCustomConfigSchema> {
    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.PhpStanNeon, AsIsFiles.PhpUnitXml];
    }

    public getLocationForTypeId(typeId: string): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getFileLocation(typeDeclaration.name.fernFilepath);
    }

    public getCoreAsIsFiles(): string[] {
        return [...this.getCoreSerializationAsIsFiles()];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [...this.getCoreSerializationTestAsIsFiles()];
    }

    public getUtilsAsIsFiles(): string[] {
        return [];
    }
}
