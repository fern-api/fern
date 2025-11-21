import { AbstractGoGeneratorContext, AsIsFiles } from "@fern-api/go-base";
import { FernFilepath } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractGoGeneratorContext<ModelCustomConfigSchema> {
    public getTypePackageName({ fernFilepath }: { fernFilepath: FernFilepath }): string {
        const fileLocation = this.getPackageLocation(fernFilepath);
        if (fileLocation.importPath === this.getRootImportPath()) {
            return this.getRootPackageName();
        }
        return fileLocation.importPath.split("/").pop() ?? "";
    }

    public getTypeFilename({ fernFilepath }: { fernFilepath: FernFilepath }): string {
        if (fernFilepath.file != null) {
            return `${fernFilepath.file.snakeCase.unsafeName}.go`;
        }
        return "types.go";
    }

    public getRawAsIsFiles(): string[] {
        return [];
    }

    public getCoreAsIsFiles(): string[] {
        return [];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [];
    }

    public getInternalAsIsFiles(): string[] {
        return [AsIsFiles.ExtraProperties, AsIsFiles.ExtraPropertiesTest, AsIsFiles.Stringer, AsIsFiles.Time];
    }

    public getUtilsAsIsFiles(): string[] {
        return [];
    }

    public getRootAsIsFiles(): string[] {
        return [];
    }
}
