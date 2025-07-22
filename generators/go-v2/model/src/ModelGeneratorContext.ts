import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { AbstractGoGeneratorContext } from "@fern-api/go-base";

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
        return [];
    }

    public getInternalTestAsIsFiles(): string[] {
        return [];
    }
}
