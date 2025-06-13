import { camelCase, upperFirst } from "lodash-es";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRubyGeneratorContext, BaseRubyCustomConfigSchema, FileLocation } from "@fern-api/ruby-ast";
import { RubyProject } from "@fern-api/ruby-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { RelativeFilePath } from "../../../../packages/commons/fs-utils/src";

export class ModelGeneratorContext extends AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema> {
    public readonly project: RubyProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: BaseRubyCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new RubyProject({ context: this });
    }

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
