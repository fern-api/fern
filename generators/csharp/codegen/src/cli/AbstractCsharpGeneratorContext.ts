import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation, ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { ClassReference } from "../ast";
import { BaseCsharpCustomConfigSchema } from "./BaseCsharpCustomConfigSchema";

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
    }

    public getNamespace(): string {
        return (
            this.customConfig.namespace ??
            upperFirst(camelCase(`${this.config.organization}_${this.ir.apiName.pascalCase.unsafeName}`))
        );
    }

    public abstract getFilepathForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;

    public abstract getClassReferenceForTypeId(typeId: TypeId): ClassReference;

    public abstract getAllPropertiesIncludingExtensions(typeId: TypeId): ObjectProperty[];
}
