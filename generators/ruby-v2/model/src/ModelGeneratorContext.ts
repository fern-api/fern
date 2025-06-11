import { camelCase, upperFirst } from "lodash-es";

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
            namespace: [this.getRootNamespace(), ...parts].join("::"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }

    public getRootNamespace(): string {
        return upperFirst(camelCase(`${this.config.organization}`));
    }
}
