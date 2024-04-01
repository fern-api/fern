import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation, Name, TypeId } from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { BaseCsharpCustomConfigSchema } from "./BaseCsharpCustomConfigSchema";

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    private namespace: string;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.namespace =
            this.customConfig.namespace ??
            upperFirst(camelCase(`${this.config.organization}_${this.ir.apiName.pascalCase.unsafeName}`));
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public getCoreNamespace(): string {
        return `${this.namespace}.Core`;
    }

    public getPascalCaseSafeName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public abstract getDirectoryForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;
}
