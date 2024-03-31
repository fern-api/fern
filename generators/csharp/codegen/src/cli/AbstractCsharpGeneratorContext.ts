import { csharp } from "@fern-api/csharp-codegen";
import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation, ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";

export abstract class AbstractCsharpGeneratorContext<CustomConfig> extends AbstractGeneratorContext {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
    }

    public abstract packageName(): Promise<string>;

    public abstract getFilepathForTypeId(typeId: TypeId): Promise<string>;

    public abstract getNamespaceForTypeId(typeId: TypeId): Promise<string>;

    public abstract getClassReferenceForTypeId(typeId: TypeId): Promise<csharp.ClassReference>;

    public abstract getAllPropertiesIncludingExtensions(typeId: TypeId): ObjectProperty[];
}
