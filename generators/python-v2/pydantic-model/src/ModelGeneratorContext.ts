import { AbstractPythonGeneratorContext } from "@fern-api/base-python-generator";

import { PydanticModelCustomConfigSchema } from "./ModelCustomConfig";

export class PydanticModelGeneratorContext extends AbstractPythonGeneratorContext<PydanticModelCustomConfigSchema> {
    public getModulePathForId(typeId: string): string[] {
        const typeDeclaration = super.getTypeDeclarationOrThrow(typeId);
        const fernFilepath = typeDeclaration.name.fernFilepath;
        return [...fernFilepath.allParts.flatMap((part) => ["resources", super.getSnakeCaseSafeName(part)]), "types"];
    }
}
