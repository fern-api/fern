import { AbstractPythonGeneratorContext, core } from "@fern-api/python-base";

import { PydanticModelCustomConfigSchema } from "./ModelCustomConfig.js";

export class PydanticModelGeneratorContext extends AbstractPythonGeneratorContext<PydanticModelCustomConfigSchema> {
    public getRawAsIsFiles(): string[] {
        return [core.AsIsFiles.GitIgnore];
    }
}
