import { AbstractRustGeneratorContext, AsIsFiles, FileLocation } from "@fern-api/rust-base";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractRustGeneratorContext<ModelCustomConfigSchema> {
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
