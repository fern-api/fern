import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation, ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { ClassReference } from "../ast";

export abstract class AbstractCsharpGeneratorContext<CustomConfig> extends AbstractGeneratorContext {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
    }

    public abstract packageName(): string;

    public abstract getFilepathForTypeId(typeId: TypeId): string;

    public abstract getNamespaceForTypeId(typeId: TypeId): string;

    public abstract getClassReferenceForTypeId(typeId: TypeId): ClassReference;

    public abstract getAllPropertiesIncludingExtensions(typeId: TypeId): ObjectProperty[];
}
