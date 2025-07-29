import { FernFilepath } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { AbstractGoGeneratorContext, AsIsFiles } from "@fern-api/go-base";

export class ModelGeneratorContext extends AbstractGoGeneratorContext<ModelCustomConfigSchema> {
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

    public getInternalTestAsIsFiles(): string[] {
        return [];
    }
}
