import { AbstractGoGeneratorContext, AsIsFiles } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelCustomConfigSchema } from "./ModelCustomConfig.js";

export class ModelGeneratorContext extends AbstractGoGeneratorContext<ModelCustomConfigSchema> {
    public getTypePackageName({ fernFilepath }: { fernFilepath: FernIr.FernFilepath }): string {
        const fileLocation = this.getPackageLocation(fernFilepath);
        if (fileLocation.importPath === this.getRootImportPath()) {
            return this.getRootPackageName();
        }
        return fileLocation.importPath.split("/").pop() ?? "";
    }

    public getTypeFilename({ fernFilepath }: { fernFilepath: FernIr.FernFilepath }): string {
        if (fernFilepath.file != null) {
            return `${this.caseConverter.snakeUnsafe(fernFilepath.file)}.go`;
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

    public getRootAsIsFiles(): string[] {
        return [];
    }
}
