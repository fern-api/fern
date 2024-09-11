import { AbstractPhpGeneratorContext, AsIsFiles } from "@fern-api/php-codegen";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractPhpGeneratorContext<ModelCustomConfigSchema> {
    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.PhpStanNeon, AsIsFiles.PhpUnitXml];
    }

    public getCoreAsIsFiles(): string[] {
        return [];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [];
    }
}
