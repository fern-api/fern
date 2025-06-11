import { RelativeFilePath } from "../../../../packages/commons/fs-utils/src";
import { AbstractRubyGeneratorContext, BaseRubyCustomConfigSchema, FileLocation } from "../../ast/src";

export class ModelGeneratorContext extends AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema> {
    public getLocationForTypeId(typeId: string): FileLocation {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }

        const parts = typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName);
        return {
            namespace: ["IMDB", ...parts].join("::"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }
}
